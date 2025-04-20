import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { SendIcon, Loader2 } from 'lucide-react';
import { UserCircle, Bot } from 'lucide-react';

export default function PDFChat({ fileName, documentId, isDocumentLoaded }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  // Focus input on initial load
  useEffect(() => {
    if (isDocumentLoaded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDocumentLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !isDocumentLoaded) return;
    
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          documentId: documentId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get answer');
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble answering that question. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col border-0 shadow-md">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <svg 
            className="w-5 h-5 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"  
              strokeWidth="2"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            ></path>
          </svg>
          <span>{fileName || 'Document'} Assistant</span>
        </CardTitle>
      </CardHeader>

      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">
              {isDocumentLoaded ? "Ask me about this document" : "Upload a document first"}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {isDocumentLoaded 
                ? "I can answer questions, summarize sections, or explain concepts from this PDF."
                : "Once you've uploaded a PDF, you can ask questions about its content."}
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-2">
            {messages.map((message, index) => (
              <div key={index} className="flex gap-3">
               <div className="flex-shrink-0 mt-1">
  {message.role === 'user' ? (
 <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
 <UserCircle className="h-5 w-5" />
</div>
) : (
<div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
 <Bot className="h-5 w-5" />
</div>
  )}
</div>

                <div className={`flex-1 px-1 max-w-[calc(100%-44px)]`}>
                  <div className="mb-1 text-sm font-medium">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
 <Bot className="h-5 w-5" />
</div>
                </div>
                <div className="flex-1 px-1">
                  <div className="mb-1 text-sm font-medium">Assistant</div>
                  <div className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg">
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    <span className="text-xs font-medium">Generating response...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isDocumentLoaded ? "Ask a question about your document..." : "Upload a document first"}
            disabled={!isDocumentLoaded || isLoading}
            className="flex-1 py-6 text-sm"
          />
          <Button 
            type="submit" 
            disabled={!isDocumentLoaded || isLoading || !inputValue.trim()}
            size="icon"
            className={`h-10 w-10 rounded-full ${!inputValue.trim() ? 'opacity-50' : 'opacity-100'}`}
          >
            {isLoading ? 
              <Loader2 className="h-4 w-4 animate-spin" /> : 
              <SendIcon className="h-4 w-4" />
            }
          </Button>
        </form>
      </div>
    </Card>
  );
}