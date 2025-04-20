import { NextResponse } from 'next/server';
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from 'fs';
import { parsePDF } from '@/lib/pdfParser';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf');

    if (!pdfFile) {
      return NextResponse.json({ error: 'No PDF file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = pdfFile.name.replaceAll(" ", "_");
    const uploadDir = path.join(process.cwd(), "public/pdfs");

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(path.join(uploadDir, filename), buffer);

    const text = await parsePDF(path.join(uploadDir, filename));

    return NextResponse.json({ message: "Success", status: 201, text, filename }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Error in upload handler', details: String(error) }, { status: 500 });
  }
}
