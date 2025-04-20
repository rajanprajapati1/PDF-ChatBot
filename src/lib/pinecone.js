import { Pinecone } from '@pinecone-database/pinecone';

const getPineconeClient = () => {
  const apiKey = process.env.PINECONE_API_KEY;
  
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not set in environment variables');
  }
  
  return new Pinecone({
    apiKey,
  });
};

export async function createPineconeIndex(indexName) {
  try {
    const pinecone = getPineconeClient();
    
    const existingIndexes = await pinecone.listIndexes();
    
    if (!existingIndexes.indexes?.find(index => index.name === indexName)) {
      console.log(`Creating new Pinecone index: ${indexName}`);
      
      // Create a new index
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      
      console.log('Waiting for index to be ready...');
      let isIndexReady = false;
      while (!isIndexReady) {
        const indexStatus = await pinecone.describeIndex(indexName);
        isIndexReady = indexStatus.status?.ready;
        if (!isIndexReady) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      console.log('Index is ready');
    } else {
      console.log(`Using existing Pinecone index: ${indexName}`);
    }
    
    return pinecone.index(indexName);
  } catch (error) {
    console.error('Error creating Pinecone index:', error);
    throw new Error(`Pinecone index creation failed: ${error.message}`);
  }
}

export async function upsertEmbeddings(indexName, vectors, documentId) {
  try {
    const pinecone = getPineconeClient();
    const index = pinecone.index(indexName);
    
    // Add documentId to each vector's metadata
    const vectorsWithDocId = vectors.map(vector => ({
      ...vector,
      metadata: {
        ...vector.metadata,
        documentId,
      }
    }));
    
    // Batch vectors in groups of 100
    const batchSize = 100;
    for (let i = 0; i < vectorsWithDocId.length; i += batchSize) {
      const batch = vectorsWithDocId.slice(i, i + batchSize);
      await index.upsert(batch);
    }
    
    return true;
  } catch (error) {
    console.error('Error upserting embeddings:', error);
    throw new Error(`Failed to upsert embeddings: ${error.message}`);
  }
}

export async function queryPinecone(indexName, documentId, topK = 5) {
  try {
    const pinecone = getPineconeClient();
    const index = pinecone.index(indexName);
    
    // Query for vectors with matching documentId
    const queryResponse = await index.query({
      topK: 1000,
      includeMetadata: true,
      filter: {
        documentId: { $eq: documentId },
      },
      // Use a simple vector for filtering by metadata only
      vector: Array(1536).fill(0),
    });
    
    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      console.log('No matching vectors found');
      return [];
    }
    
    // Extract and sort chunks by index
    const chunks = queryResponse.matches
      .sort((a, b) => (a.metadata?.chunkIndex || 0) - (b.metadata?.chunkIndex || 0))
      .map(match => match.metadata);
    
    return chunks.slice(0, topK);
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw new Error(`Pinecone query failed: ${error.message}`);
  }
}


function dotProduct(vecA, vecB) {
  return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
}

function magnitude(vec) {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(vecA, vecB) {
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(vecA, vecB) / (magA * magB);
}

function createQuestionVector(question) {
  const tokens = question.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const frequencyMap = {};
  tokens.forEach((token) => {
    frequencyMap[token] = (frequencyMap[token] || 0) + 1;
  });
  
  const vector = new Array(1536).fill(0);
  const tokenValues = Object.values(frequencyMap);
  for (let i = 0; i < Math.min(1536, tokenValues.length); i++) {
    vector[i] = tokenValues[i] / (tokenValues.length || 1);
  }
  
  return vector;
}

export async function queryPineconeForQuestion(indexName, documentId, question, topK = 5) {
  try {
    const pinecone = getPineconeClient();
    const index = pinecone.index(indexName);
    
    // Create a vector representation of the question
    const questionVector = createQuestionVector(question);
    
    // Query Pinecone with the question vector
    const queryResponse = await index.query({
      vector: questionVector,
      topK: topK,
      includeMetadata: true,
      filter: {
        documentId: { $eq: documentId },
      },
    });
    
    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      console.log('No matching vectors found');
      return [];
    }
    
    return queryResponse.matches.map(match => match.metadata);
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw new Error(`Pinecone query failed: ${error.message}`);
  }
}