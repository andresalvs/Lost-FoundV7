import sys
import torch
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
from PIL import Image
from pathlib import Path
import os
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

# --- Configuration ---
LOCAL_MODEL_DIR = "./qwen2vl2b"
# Allow passing an image path as the first CLI argument. Fall back to default.
IMAGE_PATH = sys.argv[1] if len(sys.argv) > 1 else "images/lost_item.jpg"
PROMPT_TEXT = """Analyze this image carefully and identify the MAIN OBJECT in focus.

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

# --- Cross-Platform Helper Functions ---

def get_system_config():
    """
    Detects OS/Hardware and returns the optimal configuration.
    """
    config = {
        "device": "cpu",
        "dtype": torch.float32,
        "use_quantization": False,
        "attn_impl": "eager",
        "max_pixels": 600 * 600 # Default safe limit
    }

    # 1. Check for NVIDIA CUDA (Windows / Ubuntu)
    if torch.cuda.is_available():
        print("-> Detected System: NVIDIA GPU (CUDA)")
        config["device"] = "cuda"
        config["dtype"] = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
        config["use_quantization"] = True  # Enable 4-bit for speed
        config["attn_impl"] = "flash_attention_2" # Fastest
        config["max_pixels"] = 1024 * 1024 # CUDA can handle larger images
        
    # 2. Check for Apple Silicon (Mac)
    elif torch.backends.mps.is_available():
        print("-> Detected System: Apple Silicon (MPS)")
        config["device"] = "mps"
        # Mac Stability Settings:
        config["dtype"] = torch.float32  # Prevents "!!!!" and numerical collapse
        config["use_quantization"] = False # BitsAndBytes usually fails on Mac
        config["attn_impl"] = "eager"    # Flash Attn not supported on MPS
        config["max_pixels"] = 512 * 512 # Strict limit to prevent "Invalid Buffer" crashes

    # 3. CPU Fallback
    else:
        print("-> Detected System: CPU Only")
        config["device"] = "cpu"
        config["dtype"] = torch.float32
        config["use_quantization"] = False
        config["attn_impl"] = "eager"
        config["max_pixels"] = 400 * 400 # Keep it small for CPU speed

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
        # Use a high-quality downsampling filter on PIL for better results
        return image.resize((new_w, new_h), resample=Image.LANCZOS)
    return image

def main():
    # 1. Get Environment Settings
    conf = get_system_config()
    print(f"   [Config] Device: {conf['device']} | Dtype: {conf['dtype']} | 4-Bit: {conf['use_quantization']}")

    # 2. Prepare Quantization Config (Windows/Linux only)
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

    # 3. Load Processor
    print(f"\nLoading processor from {LOCAL_MODEL_DIR}...")
    # Auto-detect nested model folder (some model zips include an extra subfolder)
    base = Path(LOCAL_MODEL_DIR)
    if not base.exists():
        raise FileNotFoundError(f"Model root not found at {LOCAL_MODEL_DIR}")

    # Search for a preprocessor_config.json in base or one level down
    model_dir = None
    if (base / "preprocessor_config.json").exists() or (base / "config.json").exists():
        model_dir = base
    else:
        # look for a nested directory that contains model files
        for child in base.iterdir():
            if child.is_dir() and (child / "preprocessor_config.json").exists():
                model_dir = child
                break
    if model_dir is None:
        # fallback: use provided base and let transformers raise a helpful error
        model_dir = base

    try:
        processor = AutoProcessor.from_pretrained(str(model_dir), local_files_only=True)
    except Exception as e:
        print("\n[Error] Could not load processor from the model folder.")
        print(f"Model folder used: {model_dir}")
        print("Files in model folder:")
        for p in sorted([p.name for p in model_dir.iterdir()]):
            print(" -", p)
        print("\nEnsure the model folder contains a processor/tokenizer/image-processor or feature-extractor. If not, you may need a matching `transformers` version.")
        raise

    # 4. Load Model
    print(f"Loading model from {model_dir}...")
    try:
        model = Qwen2VLForConditionalGeneration.from_pretrained(
            str(model_dir),
            quantization_config=bnb_config,
            torch_dtype=conf['dtype'],
            _attn_implementation=conf['attn_impl'],
            local_files_only=True
        )
    except ValueError as e:
        # Fallback if Flash Attention 2 is not installed or supported
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

    # Explicitly place the model on the detected device for Windows compatibility
    try:
        if conf['device'] == 'cuda':
            model.to('cuda')
        elif conf['device'] == 'mps':
            model.to('mps')
        else:
            model.to('cpu')
    except Exception as e:
        print(f"Warning: failed to move model to {conf['device']}: {e}")
        print("Continuing with CPU.")
        model.to('cpu')

    # 5. Load and Process Image
    if not os.path.exists(IMAGE_PATH):
        raise FileNotFoundError(f"Image not found at: {IMAGE_PATH}")
    
    raw_image = Image.open(IMAGE_PATH).convert("RGB")
    image = resize_image_smart(raw_image, conf['max_pixels'])

    # 6. Prepare Inputs
    conversation = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {"type": "text", "text": PROMPT_TEXT},
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
    inputs = inputs.to(conf['device'])

    # 7. Generate
    print("\nGenerating description...")
    with torch.no_grad():
        generated_ids = model.generate(
            **inputs, 
            max_new_tokens=300,
            do_sample=False,        # Deterministic
            repetition_penalty=1.1  # Prevents looping
        )

    # 8. Decode
    generated_ids_trimmed = [
        out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
    ]
    output_text = processor.batch_decode(
        generated_ids_trimmed, 
        skip_special_tokens=True, 
        clean_up_tokenization_spaces=True
    )[0]

    print("\n" + "="*30)
    print("RESULT")
    print("="*30)
    print(output_text)

if __name__ == "__main__":
    main()