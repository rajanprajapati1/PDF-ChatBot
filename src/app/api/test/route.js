import { NextResponse } from 'next/server';

export async function GET() {
  const chunks = [
    {
      text: "Artificial intelligence is transforming industries.",
      metadata: { source: "doc1.pdf" },
    },
    {
      text: "Machine learning models require a lot of data to train effectively.",
      metadata: { source: "doc1.pdf" },
    },
  ];

  try {
    const vectors = [];

    for (let i = 0; i < chunks.length; i++) {
      const response = await fetch("https://api-inference.huggingface.co/pipeline/feature-extraction/BAAI/bge-small-en-v1.5", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: chunks[i].text }),
      });

      // Check if response is OK
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("API Response Error:", errorDetails);
        throw new Error(`Failed to fetch embeddings: ${errorDetails.error || 'Unknown error'}`);
      }

      const embedding = await response.json();

      // Ensure embedding is in expected format
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Received unexpected embedding response');
      }

      vectors.push({
        id: `chunk_${i}`,
        values: embedding[0], // Assuming that the embedding is an array of values
        metadata: {
          ...chunks[i].metadata,
          text: chunks[i].text,
          chunkIndex: i,
        },
      });
    }

    return NextResponse.json({ success: true, vectors }, { status: 200 });
  } catch (error) {
    console.error("Embedding error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
