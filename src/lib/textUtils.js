import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunkText(text, chunkSize = 1000) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);

  // Return just the text content
  return docs.map((doc, index) => ({
    id: `${index}`,
    text: doc.pageContent,
    metadata: {
      chunkIndex: index,
    },
  }));
}
