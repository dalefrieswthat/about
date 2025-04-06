'use client';

import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Minus, Plus } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker with CDN
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export default function Home() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Load the PDF file
    fetch('/one-pager.pdf')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load PDF');
        }
        return response.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      })
      .catch(err => {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF file. Please try again later.');
      });

    // Cleanup
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error: Error): void {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF file. Please try again later.');
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8 bg-[#1a365d] px-6 py-4 rounded-lg">
          <a 
            href="https://disputedojo.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#ffffff' }}
            className="text-3xl font-semibold hover:text-gray-100 transition-colors no-underline tracking-tight"
          >
            Dispute Dojo
          </a>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              className="p-2 rounded-lg hover:bg-[#2c5282] transition-colors flex items-center justify-center"
              title="Zoom out"
            >
              <Minus size={24} strokeWidth={3} className="text-white" />
            </button>
            <span style={{ color: '#ffffff' }} className="text-sm font-medium min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
              className="p-2 rounded-lg hover:bg-[#2c5282] transition-colors flex items-center justify-center"
              title="Zoom in"
            >
              <Plus size={24} strokeWidth={3} className="text-white" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="border border-gray-100"
                />
              </Document>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
