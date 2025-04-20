import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";


export const parsePDF = async (filePath) => {
  try {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    return docs
  } catch (error) {
    return error
  }
}
