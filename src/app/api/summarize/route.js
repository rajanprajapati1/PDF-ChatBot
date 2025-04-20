import { NextResponse } from 'next/server';
import { createPineconeIndex, upsertEmbeddings, queryPinecone } from '@/lib/pinecone';
import {
  chunkText,
  tokenizeText,
  createVector
} from '@/lib/TextEmbeded'

export async function POST(request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing text content' },
        { status: 400 }
      );
    }

    const documentId = `doc_${Date.now()}`;
    const chunks = chunkText(text, 1000);

    if (!chunks.length) {
      return NextResponse.json(
        { error: 'No text chunks were generated' },
        { status: 400 }
      );
    }

    // Create or get the index
    await createPineconeIndex('pdf-summaries');

    // Create vectors
    const vectors = chunks.map((chunk, index) => {
      const tokens = tokenizeText(chunk);
      const vector = createVector(tokens);

      return {
        id: `${documentId}_chunk_${index}`,
        values: vector,
        metadata: {
          text: chunk,
          chunkIndex: index,
          documentId: documentId
        },
      };
    });

    await upsertEmbeddings('pdf-summaries', vectors, documentId);

    const retrievedChunks = await queryPinecone('pdf-summaries', documentId, chunks.length);

    const summary = retrievedChunks.map(chunk => chunk.text).join(' ');

    return NextResponse.json({
      summary,
      documentId,
      chunkCount: chunks.length
    });

  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate summary',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}