const VECTOR_DIMENSION = 1536;

function chunkText(text, maxChunkSize) {
    const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

    let currentChunk = '';

    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length <= maxChunkSize) {
            currentChunk += sentence;
        } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = sentence;
        }
    }

    if (currentChunk) chunks.push(currentChunk);

    if (chunks.length === 0) {
        for (let i = 0; i < text.length; i += maxChunkSize) {
            chunks.push(text.slice(i, i + maxChunkSize));
        }
    }

    return chunks;
}

function tokenizeText(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

function createVector(tokens) {
    // Create a simple bag-of-words frequency vector
    const frequencyMap = {};
    tokens.forEach((token) => {
        frequencyMap[token] = (frequencyMap[token] || 0) + 1;
    });

    // Create a normalized vector
    const vector = new Array(VECTOR_DIMENSION).fill(0);

    // Fill in the vector with available frequencies
    const tokenValues = Object.values(frequencyMap);
    for (let i = 0; i < Math.min(VECTOR_DIMENSION, tokenValues.length); i++) {
        vector[i] = tokenValues[i] / (tokenValues.length || 1); // Normalize
    }

    return vector;
}

export {
    chunkText,
    tokenizeText,
    createVector
}
