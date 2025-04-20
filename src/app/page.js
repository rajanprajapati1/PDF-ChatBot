"use client";

import { useState } from "react";
import PDFUploader from "@/components/PDFUploader";
import SummaryViewer from "@/components/SummaryViewer";
import PDFChat from "@/components/PDFChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PDFAnalyzerPage() {
  const [documentText, setDocumentText] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleUploadComplete = async (text, name) => {
    setDocumentText(text);
    setFileName(name);
    await generateSummary(text);
  };

  const generateSummary = async (text) => {
    setSummaryLoading(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data.summary);

      if (data.documentId) {
        setDocumentId(data.documentId);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (documentText) {
      generateSummary(documentText);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">📄 PDF ChatBot</h1>
        <p className="text-gray-500 mt-2 text-lg">Upload a PDF and interact with it using AI</p>
      </header>

      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <PDFUploader onUploadComplete={handleUploadComplete} />
      </div>

      {(fileName || summaryLoading) && (
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-1">
              <TabsTrigger
                value="summary"
                className="rounded-md text-sm font-medium transition-all hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="rounded-md text-sm font-medium transition-all hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <SummaryViewer
                fileName={fileName}
                summary={summary}
                isLoading={summaryLoading}
                onRegenerate={handleRegenerate}
              />
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <PDFChat
                fileName={fileName}
                documentId={documentId}
                isDocumentLoaded={!!documentText}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
