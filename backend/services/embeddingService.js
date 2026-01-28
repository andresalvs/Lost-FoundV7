/**
 * Embedding Service - Generates semantic embeddings using Xenova transformers
 * Uses all-MiniLM-L6-v2 model (local, free, no API key needed)
 */

import { pipeline, env } from '@xenova/transformers';

// Allow loading local models
env.allowLocalModels = true;
env.allowRemoteModels = true;

let extractor = null;

/**
 * Initialize or retrieve the feature extraction pipeline
 * @returns {Promise<Pipeline>}
 */
async function initializeExtractor() {
  if (!extractor) {
    console.log('🔄 Loading embedding model (all-MiniLM-L6-v2)...');
    try {
      extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
      console.log('✅ Embedding model loaded successfully');
    } catch (error) {
      console.error('❌ Error loading embedding model:', error);
      throw error;
    }
  }
  return extractor;
}

/**
 * Generate embedding for a given text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Array of 384 floating point numbers
 */
export async function getEmbedding(text) {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for embedding');
    }

    const cleanText = text.trim();
    if (cleanText.length === 0) {
      throw new Error('Empty text cannot be embedded');
    }

    const pipeline = await initializeExtractor();

    // Generate embedding
    const result = await pipeline(cleanText, {
      pooling: 'mean',
      normalize: true,
    });

    // Convert to array
    const embedding = Array.from(result.data);
    
    console.log(`✅ Generated embedding for: "${cleanText.substring(0, 50)}..."`);
    return embedding;
  } catch (error) {
    console.error('❌ Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple items
 * @param {Array} items - Array of item objects with name, brand, color, description
 * @returns {Promise<Array>} - Array of embeddings
 */
export async function generateBatchEmbeddings(items) {
  const embeddings = [];
  
  for (const item of items) {
    try {
      const text = [
        item.name,
        item.brand,
        item.color,
        item.description
      ]
        .filter(Boolean)
        .join(' ');
      
      const embedding = await getEmbedding(text);
      embeddings.push({
        id: item.id,
        embedding,
        text: text.substring(0, 100),
      });
    } catch (error) {
      console.error(`⚠️  Failed to embed item ${item.id}:`, error);
      embeddings.push({
        id: item.id,
        embedding: null,
        error: error.message,
      });
    }
  }
  
  return embeddings;
}

/**
 * Calculate similarity score between two embeddings
 * @param {Array} embedding1 - First embedding
 * @param {Array} embedding2 - Second embedding
 * @returns {number} - Cosine similarity score (0-1, higher is more similar)
 */
export function calculateSimilarity(embedding1, embedding2) {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
    return 0;
  }

  // Cosine similarity
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (norm1 * norm2);
}

export default { getEmbedding, generateBatchEmbeddings, calculateSimilarity };
