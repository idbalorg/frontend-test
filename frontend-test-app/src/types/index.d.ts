declare module "react-pdf" {
  import { ComponentType } from "react";

  export interface DocumentProps {
    file: File | string;
    onLoadSuccess?: (pdf: any) => void;
    onLoadError?: (error: Error) => void;
    loading?: React.ReactNode;
    error?: React.ReactNode;
    className?: string;
  }

  export interface PageProps {
    pageNumber: number;
    scale?: number;
    className?: string;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;
  export const pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: string;
    };
    version: string;
  };
}

declare module "pdf-lib" {
  export interface PDFDocument {
    getPage: (pageNumber: number) => PDFPage;
    save: () => Promise<Uint8Array>;
    embedPng: (imageData: Uint8Array) => Promise<PDFImage>;
  }

  export interface PDFPage {
    getSize: () => { width: number; height: number };
    drawRectangle: (options: {
      x: number;
      y: number;
      width: number;
      height: number;
      color: RGB;
    }) => void;
    drawLine: (options: {
      start: { x: number; y: number };
      end: { x: number; y: number };
      thickness: number;
      color: RGB;
    }) => void;
    drawText: (
      text: string,
      options: {
        x: number;
        y: number;
        size: number;
        color: RGB;
      }
    ) => void;
    drawImage: (
      image: PDFImage,
      options: {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    ) => void;
  }

  export interface PDFImage {
    width: number;
    height: number;
  }

  export interface RGB {
    r: number;
    g: number;
    b: number;
  }

  export function rgb(r: number, g: number, b: number): RGB;
  export function load(pdfBytes: ArrayBuffer): Promise<PDFDocument>;
}
