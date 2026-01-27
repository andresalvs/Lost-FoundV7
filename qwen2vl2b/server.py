# -*- coding: utf-8 -*-
import sys
import os

# Force UTF-8 encoding for Windows console
if sys.stdout.encoding.lower() != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import json
import torch
import warnings
from pathlib import Path
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
from PIL import Image

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(MODEL_DIR, "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

# Global variables for model and processor
model = None
processor = None
device = None
max_pixels = None

def get_system_config():
    """
    Detects OS/Hardware and returns the optimal configuration.
    """
    config = {
        "device": "cpu",
        "dtype": torch.float32,
        "use_quantization": False,
        "attn_impl": "eager",
        "max_pixels": 600 * 600
    }

    if torch.cuda.is_available():
        print("-> Detected System: NVIDIA GPU (CUDA)")
        config["device"] = "cuda"
        config["dtype"] = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
        config["use_quantization"] = True
        config["attn_impl"] = "flash_attention_2"
        config["max_pixels"] = 1024 * 1024
        
    elif torch.backends.mps.is_available():
        print("-> Detected System: Apple Silicon (MPS)")
        config["device"] = "mps"
        config["dtype"] = torch.float32
        config["use_quantization"] = False
        config["attn_impl"] = "eager"
        config["max_pixels"] = 512 * 512

    else:
        print("-> Detected System: CPU Only")
        config["device"] = "cpu"
        config["dtype"] = torch.float32
        config["use_quantization"] = False
        config["attn_impl"] = "eager"
        config["max_pixels"] = 400 * 400

    return config

def resize_image_smart(image, max_pixels):
    """
    Downscales high-res images to fit within memory limits while preserving aspect ratio.
    """
    w, h = image.size
    total_pixels = w * h
    
    if total_pixels > max_pixels:
        scale_factor = (max_pixels / total_pixels) ** 0.5
        new_w = int(w * scale_factor)
        new_h = int(h * scale_factor)
        print(f"   [System] Resizing image from {w}x{h} to {new_w}x{new_h} for stability.")
        return image.resize((new_w, new_h), resample=Image.LANCZOS)
    return image

def load_model():
    """Load the Qwen2VL model and processor at startup."""
    global model, processor, device, max_pixels
    
    print("\n[Model] Initializing Qwen2VL Model Server...")
    
    conf = get_system_config()
    device = conf['device']
    max_pixels = conf['max_pixels']
    
    print(f"   [Config] Device: {conf['device']} | Dtype: {conf['dtype']} | 4-Bit: {conf['use_quantization']}")

    # Prepare Quantization Config
    bnb_config = None
    if conf['use_quantization']:
        try:
            from transformers import BitsAndBytesConfig
            bnb_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=conf['dtype']
            )
            print("   [Config] 4-bit Quantization Enabled.")
        except ImportError:
            print("   [Warning] bitsandbytes not installed. Falling back to non-quantized.")
            conf['use_quantization'] = False

    # Load Processor
    print(f"\n[Model] Loading processor from {MODEL_DIR}...")
    base = Path(MODEL_DIR)
    if not base.exists():
        raise FileNotFoundError(f"Model root not found at {MODEL_DIR}")

    model_dir = None
    if (base / "preprocessor_config.json").exists() or (base / "config.json").exists():
        model_dir = base
    else:
        for child in base.iterdir():
            if child.is_dir() and (child / "preprocessor_config.json").exists():
                model_dir = child
                break
    if model_dir is None:
        model_dir = base

    try:
        processor = AutoProcessor.from_pretrained(str(model_dir), local_files_only=True)
        print(f"[Model] [OK] Processor loaded from {model_dir}")
    except Exception as e:
        print(f"\n[Error] Could not load processor from the model folder: {e}")
        raise

    # Load Model
    print(f"[Model] Loading Qwen2VL model from {model_dir}...")
    try:
        model = Qwen2VLForConditionalGeneration.from_pretrained(
            str(model_dir),
            quantization_config=bnb_config,
            torch_dtype=conf['dtype'],
            _attn_implementation=conf['attn_impl'],
            local_files_only=True
        )
    except ValueError as e:
        if "flash_attention_2" in str(e) or "does not support" in str(e):
            print("   [Info] Flash Attention 2 not found/supported. Falling back to eager implementation.")
            model = Qwen2VLForConditionalGeneration.from_pretrained(
                str(model_dir),
                quantization_config=bnb_config,
                torch_dtype=conf['dtype'],
                _attn_implementation="eager",
                local_files_only=True
            )
        else:
            raise

    # Place model on device
    try:
        if conf['device'] == 'cuda':
            model.to('cuda')
        elif conf['device'] == 'mps':
            model.to('mps')
        else:
            model.to('cpu')
        print(f"[Model] [OK] Model loaded and placed on {conf['device']}")
    except Exception as e:
        print(f"[Warning] failed to move model to {conf['device']}: {e}")
        print("[Model] Continuing with CPU.")
        model.to('cpu')
    
    print("[Model] [OK] Qwen2VL Model Server Ready!\n")

@app.route('/predict_qwen', methods=['POST'])
def predict_qwen():
    """Generate item description using pre-loaded Qwen2VL model."""
    if model is None or processor is None:
        return jsonify({"error": "Model not loaded. Server still initializing."}), 503
    
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    # Save uploaded image
    filename = f"upload_{uuid.uuid4().hex}.jpg"
    saved_path = os.path.join(IMAGES_DIR, filename)
    try:
        file.save(saved_path)
    except Exception as e:
        return jsonify({"error": f"Failed to save uploaded file: {e}"}), 500

    try:
        # Load and process image
        raw_image = Image.open(saved_path).convert("RGB")
        image = resize_image_smart(raw_image, max_pixels)

        # Prepare prompt
        prompt_text = """Analyze this image carefully and identify the MAIN OBJECT in focus.

Step 1: First, list what you see.
Step 2: Identify the PRIMARY/MAIN object.
Step 3: Provide details about the main object.
Step 4: Look for BRAND - logos, text, emblems, manufacturer marks.
Step 5: Identify the PRIMARY COLOR with finish (matte, glossy).

Item Name = WHAT TYPE + model/size. Brand = WHO MAKES IT.

Generate JSON with:
- item_name: Product name with model/size if visible and product type
- color: Primary color with finish (matte black, glossy silver, etc.)
- brand: Manufacturer. If unknown, write 'unbranded'
- description: Details about the object only, ignore background

Ensure EVERY field is filled - no empty values."""
        
        conversation = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt_text},
                ],
            }
        ]

        text_prompt = processor.apply_chat_template(conversation, add_generation_prompt=True)
        
        inputs = processor(
            text=[text_prompt],
            images=[image],
            padding=True,
            return_tensors="pt"
        )

        # Move inputs to correct device
        inputs = inputs.to(device)

        # Generate
        with torch.no_grad():
            generated_ids = model.generate(
                **inputs, 
                max_new_tokens=300,
                do_sample=False,
                repetition_penalty=1.1
            )

        # Decode
        generated_ids_trimmed = [
            out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        output_text = processor.batch_decode(
            generated_ids_trimmed, 
            skip_special_tokens=True, 
            clean_up_tokenization_spaces=True
        )[0]

        # Extract JSON from output
        try:
            start = output_text.find('{')
            end = output_text.rfind('}')
            if start != -1 and end != -1 and end > start:
                json_text = output_text[start:end+1]
                parsed = json.loads(json_text)
                # Normalize keys
                result = {
                    'item_name': parsed.get('item name') or parsed.get('item_name') or parsed.get('name') or parsed.get('item') or '',
                    'brand': parsed.get('brand') or '',
                    'color': parsed.get('color') or '',
                    'description': parsed.get('description') or parsed.get('desc') or ''
                }
                return jsonify(result)
            else:
                return jsonify({"error": "No JSON output from model", "raw_output": output_text}), 500
        except json.JSONDecodeError as e:
            return jsonify({"error": f"Failed to parse model output: {e}", "raw_output": output_text}), 500

    except Exception as e:
        import traceback
        print(f"[Error] Prediction failed: {traceback.format_exc()}")
        return jsonify({"error": f"Prediction failed: {e}"}), 500
    finally:
        # Clean up uploaded image
        try:
            if os.path.exists(saved_path):
                os.remove(saved_path)
        except:
            pass


@app.route('/predict_embedding', methods=['POST'])
def predict_embedding():
    """Fast endpoint to generate image embeddings. Uses fallback if model unavailable."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Empty filename"}), 400

        # Save file
        filename = f"upload_{uuid.uuid4().hex}.jpg"
        saved_path = os.path.join(IMAGES_DIR, filename)
        try:
            file.save(saved_path)
        except Exception as e:
            print('[Embedding] Failed to save uploaded file:', e)
            return jsonify({"error": f"Failed to save uploaded file: {e}"}), 500

        # Generate a deterministic 2048-d embedding from the image
        # Focus on the foreground object by removing background
        try:
            from PIL import Image, ImageFilter
            import numpy as np
            from scipy import ndimage
            
            # Open image and convert to RGB
            img = Image.open(saved_path).convert('RGB')
            
            # Remove background using edge detection + morphological operations
            try:
                # Convert to grayscale for edge detection
                img_gray = img.convert('L')
                
                # Apply edge detection to find object boundaries
                edges = img_gray.filter(ImageFilter.FIND_EDGES)
                edges_array = np.array(edges, dtype=np.uint8)
                
                # Create binary mask: areas with significant edges
                threshold = np.percentile(edges_array, 35)  # Use 35th percentile as threshold
                mask = edges_array > threshold
                
                # Use scipy's binary dilation for more accurate foreground expansion
                # This properly expands the edge mask to include the full object
                mask_dilated = ndimage.binary_dilation(mask, iterations=8)
                
                # Fill small holes in the mask (helps with object completeness)
                mask_dilated = ndimage.binary_fill_holes(mask_dilated)
                
                # Apply mask to original image - keep object, darken background
                img_array = np.array(img, dtype=np.uint8)
                img_masked = img_array.copy()
                img_masked[~mask_dilated] = (img_masked[~mask_dilated] * 0.15).astype(np.uint8)  # Darken background to 15%
                
                # Convert back to PIL for resizing
                img_focused = Image.fromarray(img_masked)
                print('[Embedding] Background removed using scipy morphology - focusing on foreground object')
                
            except Exception as e:
                # Fallback to original if segmentation fails
                print(f'[Embedding] Background removal failed ({e}), using original image')
                img_focused = img
            
            # Resize to 64x64 and flatten
            img_focused = img_focused.resize((64, 64))
            pixels = np.array(img_focused, dtype=np.float32).flatten() / 255.0
            
            # Create 2048-d embedding by repeating/padding pixel values
            emb = []
            idx = 0
            while len(emb) < 2048:
                emb.append(float(pixels[idx % len(pixels)]))
                idx += 1
            
            print(f'[Embedding] Generated object-focused embedding (length: {len(emb)})')
            return jsonify({"embedding": emb})
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print('[Embedding] Error generating embedding:', tb)
            return jsonify({"error": f"Failed to generate embedding: {e}"}), 500

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print('[Embedding] Unexpected error in endpoint:', tb)
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    try:
        print('[INFO] Starting Qwen2VL Flask Server on http://localhost:8080')
        load_model()
        app.run(host='0.0.0.0', port=8080, debug=False)
    except Exception as e:
        print(f"[ERROR] Failed to start server: {e}")
        import traceback
        print(traceback.format_exc())
        sys.exit(1)

