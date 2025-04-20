
// src/components/PDFUploader.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function PDFUploader({ onUploadComplete }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setFile(files[0]);
      processFile(files[0]);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
      setFile(files[0]);
      processFile(files[0]);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const processFile = async (file) => {
    setLoading(true);
    setProgress(10);
    setError(null);
    
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
      // Upload and process the PDF
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      setProgress(70);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }
      
      const data = await response.json();
      console.log(data ,"data")
      setProgress(100);
      const allText = data.text.map(page => page.pageContent).join("\n\n");

      // Notify parent component of successful upload
      onUploadComplete(allText, data.filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <p className="text-lg font-medium">Drag and drop your PDF here</p>
              <p className="text-sm text-gray-500">or</p>
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                variant="outline"
              >
                Browse Files
              </Button>
              <input
                id="file-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <svg
                className="w-8 h-8 text-red-500"
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
              <div className="flex-1">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {loading ? (
                <Button variant="ghost" disabled>
                  Processing...
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFile(null);
                    setProgress(0);
                  }}
                >
                  Change
                </Button>
              )}
            </div>
            
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-gray-500">
                  {progress < 40 
                    ? "Uploading PDF..." 
                    : progress < 80 
                    ? "Extracting text..." 
                    : "Processing content..."}
                </p>
              </div>
            )}
            
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded">
                {error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
// // components/PDFUploader.tsx
// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';

// export default function PDFUploader({ onUploadComplete }) {
//   const [dragging, setDragging] = useState(false);
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState(null);

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setDragging(true);
//   };

//   const handleDragLeave = () => {
//     setDragging(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragging(false);
    
//     const files = e.dataTransfer.files;
//     if (files.length > 0 && files[0].type === 'application/pdf') {
//       setFile(files[0]);
//       processFile(files[0]);
//     } else {
//       setError('Please upload a PDF file');
//     }
//   };

//   const handleFileChange = (e) => {
//     const files = e.target.files;
//     if (files && files.length > 0 && files[0].type === 'application/pdf') {
//       setFile(files[0]);
//       processFile(files[0]);
//     } else {
//       setError('Please upload a PDF file');
//     }
//   };

//   const processFile = async (file) => {
//     setLoading(true);
//     setProgress(10);
//     setError(null);
    
//     const formData = new FormData();
//     formData.append('pdf', file);
    
//     try {
//       // Upload and process the PDF
//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });
      
//       setProgress(70);
      
//       if (!response.ok) {
//         throw new Error('Failed to process PDF');
//       }
      
//       const data = await response.json();
//       setProgress(100);
      
//       // Notify parent component of successful upload
//       onUploadComplete(data.text, file.name);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full">
//       <CardContent className="pt-6">
//         {!file ? (
//           <div
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//             className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
//               dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
//             }`}
//           >
//             <div className="flex flex-col items-center justify-center space-y-4">
//               <svg
//                 className="w-16 h-16 text-gray-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                 ></path>
//               </svg>
//               <p className="text-lg font-medium">Drag and drop your PDF here</p>
//               <p className="text-sm text-gray-500">or</p>
//               <Button
//                 onClick={() => document.getElementById('file-upload')?.click()}
//                 variant="outline"
//               >
//                 Browse Files
//               </Button>
//               <input
//                 id="file-upload"
//                 type="file"
//                 accept="application/pdf"
//                 className="hidden"
//                 onChange={handleFileChange}
//               />
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="flex items-center space-x-4">
//               <svg
//                 className="w-8 h-8 text-red-500"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
//                 ></path>
//               </svg>
//               <div className="flex-1">
//                 <p className="font-medium truncate">{file.name}</p>
//                 <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
//               </div>
//               {loading ? (
//                 <Button variant="ghost" disabled>
//                   Processing...
//                 </Button>
//               ) : (
//                 <Button
//                   variant="ghost"
//                   onClick={() => {
//                     setFile(null);
//                     setProgress(0);
//                   }}
//                 >
//                   Change
//                 </Button>
//               )}
//             </div>
            
//             {loading && (
//               <div className="space-y-2">
//                 <Progress value={progress} />
//                 <p className="text-sm text-center text-gray-500">
//                   {progress < 40 
//                     ? "Uploading PDF..." 
//                     : progress < 80 
//                     ? "Extracting text..." 
//                     : "Processing content..."}
//                 </p>
//               </div>
//             )}
            
//             {error && (
//               <div className="p-3 text-sm text-red-500 bg-red-50 rounded">
//                 {error}
//               </div>
//             )}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }