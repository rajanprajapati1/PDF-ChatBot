import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { queryPineconeForQuestion } from '@/lib/pinecone';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { question, documentId } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const relevantChunks = await queryPineconeForQuestion('pdf-summaries', documentId, question, 5);
    
    if (!relevantChunks || relevantChunks.length === 0) {
      return NextResponse.json(
        { answer: "I couldn't find any relevant information in the document to answer your question." },
        { status: 200 }
      );
    }

    const context = relevantChunks.map(chunk => chunk.text).join('\n\n');

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that answers questions based only on the provided document context. If the answer cannot be found in the context, admit that you don't know rather than making up information."
        },
        {
          role: "user",
          content: `Context from the document:\n\n${context}\n\nQuestion: ${question}\n\nProvide a clear and concise answer based only on the context provided. If the answer isn't in the context, say so.`
        }
      ],
      model: "llama3-70b-8192",
      temperature: 0.2,
      max_tokens: 1024,
    });

    const answer = response.choices[0].message.content || "I couldn't generate an answer based on the document context.";

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process question', details: error.message },
      { status: 500 }
    );
  }
}