"use client";

import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import DocumentViewer from "@/components/DocumentViewer/DocumentViewer";
import Head from "next/head";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Clean up blob URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setPdfFile(file);
      // Create a new blob URL for the file
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    },
  });

  const handleRemoveFile = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setPdfFile(null);
  };

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Document Signer & Annotation Tool",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "PDF Viewing",
      "Document Annotation",
      "Digital Signatures",
      "Comments and Notes",
      "Highlighting and Underlining",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main
        className="min-h-screen p-8"
        role="main"
        aria-label="Document Viewer Application"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" role="heading" aria-level={1}>
            Document Signer & Annotation Tool
          </h1>

          {!pdfFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
              role="button"
              aria-label="Upload PDF file"
              tabIndex={0}
            >
              <input {...getInputProps()} aria-label="File input" />
              <p className="text-lg">
                {isDragActive
                  ? "Drop the PDF here"
                  : "Drag and drop a PDF file here, or click to select"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-lg" role="status">
                  Selected file: {pdfFile.name}
                </p>
                <button
                  onClick={handleRemoveFile}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  aria-label="Remove selected file"
                >
                  Remove File
                </button>
              </div>
              {fileUrl && <DocumentViewer fileUrl={fileUrl} />}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
