"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Document, Page } from "react-pdf";
import * as pdfjs from "pdfjs-dist";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./DocumentViewer.css";
import AnnotationTools, {
  AnnotationType,
} from "../AnnotationTools/AnnotationTools";
import SignaturePad from "../SignaturePad/SignaturePad";
import CommentBox from "../CommentBox/CommentBox";
import LoadingState from "../LoadingState/LoadingState";
import ErrorNotification from "../ErrorNotification/ErrorNotification";
import { exportAnnotatedPDF } from "@/utils/pdfExport";
import { Annotation } from "@/types/pdfExport";

// Initialize PDF.js worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/legacy/build/pdf.worker.min.js`;
}

interface DocumentViewerProps {
  fileUrl: string;
}

interface Position {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export default function DocumentViewer({ fileUrl }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotationType, setCurrentAnnotationType] =
    useState<AnnotationType | null>(null);
  const [currentColor, setCurrentColor] = useState("#ffeb3b");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [pendingSignaturePosition, setPendingSignaturePosition] =
    useState<Position | null>(null);
  const [pendingCommentPosition, setPendingCommentPosition] =
    useState<Position | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isWorkerLoaded, setIsWorkerLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState<Position | null>(null);

  // Initialize worker with retries
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const initializeWorker = async () => {
      if (typeof window === "undefined") return;

      try {
        console.log("Initializing PDF.js worker...");

        // Test worker initialization with a small empty PDF
        const emptyPdfBytes = new TextEncoder().encode(
          "%PDF-1.7\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF\n"
        );
        const testDoc = await pdfjs.getDocument(emptyPdfBytes).promise;

        if (!testDoc || !pdfjs.GlobalWorkerOptions.workerPort) {
          throw new Error(
            "Worker initialization failed - no worker port available"
          );
        }

        console.log("PDF.js worker initialized successfully");
        setIsWorkerLoaded(true);
      } catch (error) {
        console.error("Error initializing PDF.js worker:", error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(
            `Retrying worker initialization (attempt ${retryCount}/${maxRetries})...`
          );
          setTimeout(initializeWorker, retryDelay);
        } else {
          console.error(
            "Failed to initialize PDF.js worker after",
            maxRetries,
            "attempts"
          );
          setError("Failed to initialize PDF viewer. Please refresh the page.");
          setIsWorkerLoaded(false);
        }
      }
    };

    initializeWorker();

    return () => {
      // Cleanup
      retryCount = maxRetries;
      if (pdfjs.GlobalWorkerOptions.workerPort) {
        pdfjs.GlobalWorkerOptions.workerPort.terminate();
      }
    };
  }, []);

  // Reset states and load PDF data when fileUrl changes
  useEffect(() => {
    if (!isWorkerLoaded || !pdfjs.GlobalWorkerOptions.workerPort) {
      console.log("Worker not yet initialized, waiting...");
      return;
    }

    console.log("File URL changed:", fileUrl);
    setError(null);
    setIsLoading(true);
    setNumPages(null);
    setPageNumber(1);
    setAnnotations([]);
    setPdfFile(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setError("PDF loading timed out. Please try again.");
    }, 10000);

    fetch(fileUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch PDF file: ${response.status} ${response.statusText}`
          );
        }
        console.log("PDF file is accessible");
        return response.blob();
      })
      .then((blob) => {
        console.log("PDF data loaded, size:", blob.size, "bytes");
        const file = new File([blob], "document.pdf", {
          type: "application/pdf",
        });
        setPdfFile(file);
      })
      .catch((error) => {
        console.error("Error accessing PDF file:", error);
        setError(`Failed to access PDF file: ${error.message}`);
        setIsLoading(false);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  }, [fileUrl, isWorkerLoaded]);

  const onDocumentLoadSuccess = useCallback((pdf: any) => {
    console.log("PDF loaded successfully with", pdf.numPages, "pages");
    setNumPages(pdf.numPages);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("Error loading PDF:", error);
    setError(`Failed to load PDF: ${error.message}`);
    setIsLoading(false);
  }, []);

  // Add effect to monitor loading state
  useEffect(() => {
    console.log("Current loading state:", isLoading);
    console.log("Current error state:", error);
    console.log("Current numPages:", numPages);
  }, [isLoading, error, numPages]);

  // Add effect to monitor document rendering
  useEffect(() => {
    console.log("Rendering Document with numPages:", numPages);
  }, [numPages]);

  const handlePageChange = useCallback((newPageNumber: number) => {
    setPageNumber(newPageNumber);
  }, []);

  const handleScaleChange = useCallback((newScale: number) => {
    setScale(newScale);
  }, []);

  const handleAnnotationTypeChange = useCallback(
    (type: AnnotationType | null) => {
      setCurrentAnnotationType(type);
    },
    []
  );

  const handleColorChange = useCallback((color: string) => {
    setCurrentColor(color);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!currentAnnotationType) return;

      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Debounce the annotation creation
      requestAnimationFrame(() => {
        if (currentAnnotationType === "signature") {
          setPendingSignaturePosition({ x, y });
          setShowSignaturePad(true);
        } else if (currentAnnotationType === "comment") {
          setPendingCommentPosition({ x, y });
          setShowCommentBox(true);
        } else {
          const newAnnotation: Annotation = {
            id: Date.now().toString(),
            type: currentAnnotationType,
            color: currentColor,
            pageNumber,
            position: { x, y },
          };
          setAnnotations((prev: Annotation[]) => [...prev, newAnnotation]);
        }
      });
    },
    [currentAnnotationType, currentColor, pageNumber]
  );

  const handleSignatureSave = useCallback(
    (signatureData: string) => {
      if (!pendingSignaturePosition) return;

      requestAnimationFrame(() => {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: "signature",
          color: currentColor,
          pageNumber,
          position: pendingSignaturePosition,
          signatureData,
        };
        setAnnotations((prev: Annotation[]) => [...prev, newAnnotation]);
        setShowSignaturePad(false);
        setPendingSignaturePosition(null);
      });
    },
    [currentColor, pageNumber, pendingSignaturePosition]
  );

  const handleCommentSave = useCallback(
    (content: string) => {
      if (!pendingCommentPosition) return;

      requestAnimationFrame(() => {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: "comment",
          color: currentColor,
          pageNumber,
          position: pendingCommentPosition,
          content,
        };
        setAnnotations((prev: Annotation[]) => [...prev, newAnnotation]);
        setShowCommentBox(false);
        setPendingCommentPosition(null);
      });
    },
    [currentColor, pageNumber, pendingCommentPosition]
  );

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      setError(null);

      // Use AbortController for fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const arrayBuffer = await fetch(fileUrl, {
        signal: controller.signal,
      }).then((response) => response.arrayBuffer());
      clearTimeout(timeoutId);

      const annotatedPdfBytes = await exportAnnotatedPDF(
        arrayBuffer,
        annotations
      );

      const blob = new Blob([annotatedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `annotated_${fileUrl.split("/").pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setError("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [fileUrl, annotations]);

  const handleUndo = useCallback(() => {
    setAnnotations((prev: Annotation[]) => prev.slice(0, -1));
  }, []);

  // Memoize the filtered annotations for the current page
  const currentPageAnnotations = useMemo(
    () =>
      annotations.filter(
        (annotation: Annotation) => annotation.pageNumber === pageNumber
      ),
    [annotations, pageNumber]
  );

  // Memoize the Document component options
  const documentOptions = useMemo(
    () => ({
      cMapUrl: `/pdfjs-dist/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `/pdfjs-dist/standard_fonts/`,
      disableStream: false,
      disableAutoFetch: false,
      disableBlobURLs: false,
      useSystemFonts: true,
      isEvalSupported: false,
      useWorkerFetch: true,
    }),
    []
  );

  // Memoize the loading component
  const loadingComponent = useMemo(
    () => (
      <div className="flex items-center justify-center h-full">
        <LoadingState message="Loading PDF..." />
      </div>
    ),
    []
  );

  // Memoize the error component
  const errorComponent = useMemo(
    () => (
      <ErrorNotification
        message={error || "Failed to load PDF"}
        onClose={() => setError(null)}
      />
    ),
    [error]
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLCanvasElement>) => {
      if (
        !currentAnnotationType ||
        currentAnnotationType === "signature" ||
        currentAnnotationType === "comment"
      )
        return;

      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsDrawing(true);
      setStartPosition({ x, y });
    },
    [currentAnnotationType]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLCanvasElement>) => {
      if (
        !isDrawing ||
        !startPosition ||
        !currentAnnotationType ||
        currentAnnotationType === "signature" ||
        currentAnnotationType === "comment"
      )
        return;

      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      // Update the last annotation with the current dimensions
      setAnnotations((prev) => {
        const lastAnnotation = prev[prev.length - 1];
        if (lastAnnotation && lastAnnotation.type === currentAnnotationType) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastAnnotation,
              position: {
                x: Math.min(startPosition.x, currentX),
                y: Math.min(startPosition.y, currentY),
                width: Math.abs(currentX - startPosition.x),
                height: Math.abs(currentY - startPosition.y),
              },
            },
          ];
        }
        return prev;
      });
    },
    [isDrawing, startPosition, currentAnnotationType]
  );

  const handleCanvasMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLCanvasElement>) => {
      if (!isDrawing || !startPosition) return;

      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      // Only create annotation if there's significant movement
      if (
        Math.abs(endX - startPosition.x) > 5 ||
        Math.abs(endY - startPosition.y) > 5
      ) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: currentAnnotationType,
          color: currentColor,
          pageNumber,
          position: {
            x: Math.min(startPosition.x, endX),
            y: Math.min(startPosition.y, endY),
            width: Math.abs(endX - startPosition.x),
            height: Math.abs(endY - startPosition.y),
          },
        };
        setAnnotations((prev) => [...prev, newAnnotation]);
      }

      setIsDrawing(false);
      setStartPosition(null);
    },
    [isDrawing, startPosition, currentAnnotationType, currentColor, pageNumber]
  );

  return (
    <main
      className="flex flex-col h-screen"
      role="main"
      aria-label="PDF Document Viewer"
    >
      <nav
        className="flex items-center justify-between p-4 bg-white border-b"
        role="navigation"
        aria-label="PDF navigation"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span aria-live="polite">
            Page {pageNumber} of {numPages || 0}
          </span>
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber >= (numPages || 1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
        <div
          className="flex items-center space-x-4"
          role="toolbar"
          aria-label="PDF controls"
        >
          <button
            onClick={() => handleScaleChange(scale - 0.1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            aria-label="Zoom out"
          >
            Zoom Out
          </button>
          <span aria-live="polite">{Math.round(scale * 100)}% zoom level</span>
          <button
            onClick={() => handleScaleChange(scale + 0.1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            aria-label="Zoom in"
          >
            Zoom In
          </button>
          <button
            onClick={handleUndo}
            disabled={annotations.length === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            aria-label="Undo last annotation"
          >
            Undo
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || annotations.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            aria-label={
              isExporting ? "Exporting PDF..." : "Export annotated PDF"
            }
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </nav>

      <section
        className="flex-1 relative"
        role="region"
        aria-label="PDF document"
      >
        {isWorkerLoaded ? (
          <>
            {isLoading && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75"
                role="alert"
                aria-live="polite"
              >
                <LoadingState message="Loading PDF..." />
              </div>
            )}
            <div role="document" aria-label="PDF document content">
              <Document
                file={pdfFile || fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                onLoadProgress={(progressData) => {
                  console.log(
                    "Loading progress:",
                    progressData.loaded,
                    "/",
                    progressData.total
                  );
                  if (progressData.loaded === progressData.total) {
                    setIsLoading(false);
                  }
                }}
                loading={null}
                error={errorComponent}
                className="flex justify-center"
                options={documentOptions}
              >
                {typeof numPages === "number" && numPages > 0 && (
                  <div
                    role="region"
                    aria-label={`Page ${pageNumber} of ${numPages}`}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      className="relative"
                      onClick={handleCanvasClick}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    >
                      {currentPageAnnotations.map((annotation: Annotation) => {
                        if (annotation.type === "highlight") {
                          return (
                            <div
                              key={annotation.id}
                              className="absolute bg-yellow-200 opacity-50"
                              style={{
                                left: annotation.position.x,
                                top: annotation.position.y,
                                width: annotation.position.width,
                                height: annotation.position.height,
                              }}
                              role="mark"
                              aria-label="Highlighted text"
                            />
                          );
                        }
                        if (annotation.type === "underline") {
                          return (
                            <div
                              key={annotation.id}
                              className="absolute border-b-2"
                              style={{
                                left: annotation.position.x,
                                top: annotation.position.y,
                                width: annotation.position.width,
                                borderColor: annotation.color,
                              }}
                              role="mark"
                              aria-label="Underlined text"
                            />
                          );
                        }
                        if (annotation.type === "comment") {
                          return (
                            <div
                              key={annotation.id}
                              className="absolute p-2 rounded shadow-lg"
                              style={{
                                left: annotation.position.x,
                                top: annotation.position.y,
                                backgroundColor: annotation.color,
                              }}
                              role="note"
                              aria-label="Comment annotation"
                            >
                              {annotation.content}
                            </div>
                          );
                        }
                        if (
                          annotation.type === "signature" &&
                          annotation.signatureData
                        ) {
                          return (
                            <img
                              key={annotation.id}
                              src={annotation.signatureData}
                              alt="Digital signature"
                              className="absolute"
                              style={{
                                left: annotation.position.x,
                                top: annotation.position.y,
                                width: annotation.position.width,
                                height: annotation.position.height,
                              }}
                              role="img"
                              aria-label="Digital signature annotation"
                            />
                          );
                        }
                        return null;
                      })}
                    </Page>
                  </div>
                )}
              </Document>
            </div>
          </>
        ) : (
          <div
            className="flex items-center justify-center h-full"
            role="alert"
            aria-live="polite"
          >
            <LoadingState message="Initializing PDF viewer..." />
          </div>
        )}

        <AnnotationTools
          onToolSelect={handleAnnotationTypeChange}
          onColorSelect={handleColorChange}
          currentTool={currentAnnotationType}
          currentColor={currentColor}
        />
      </section>

      {showSignaturePad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onCancel={() => {
            setShowSignaturePad(false);
            setPendingSignaturePosition(null);
          }}
        />
      )}

      {showCommentBox && (
        <CommentBox
          onSave={handleCommentSave}
          onCancel={() => {
            setShowCommentBox(false);
            setPendingCommentPosition(null);
          }}
        />
      )}
    </main>
  );
}
