export interface Annotation {
  id: string;
  type: "highlight" | "underline" | "comment" | "signature" | null;
  color: string;
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  content?: string;
  signatureData?: string;
}

export function exportAnnotatedPDF(
  originalPdfArrayBuffer: ArrayBuffer,
  annotations: Annotation[]
): Promise<Uint8Array>;
