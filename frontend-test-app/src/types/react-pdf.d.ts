import { ComponentType, ReactNode } from "react";

declare module "react-pdf" {
  export interface DocumentProps {
    file: string | File | ArrayBuffer;
    onLoadSuccess?: (pdf: any) => void;
    onLoadError?: (error: Error) => void;
    onLoadProgress?: (progressData: { loaded: number; total: number }) => void;
    loading?: ReactNode;
    error?: ReactNode;
    className?: string;
    children?: ReactNode;
    options?: {
      cMapUrl?: string;
      cMapPacked?: boolean;
      standardFontDataUrl?: string;
      disableStream?: boolean;
      disableAutoFetch?: boolean;
      disableBlobURLs?: boolean;
      maxCanvasPixels?: number;
      isEvalSupported?: boolean;
      useSystemFonts?: boolean;
      worker?: string;
    };
  }

  export interface PageProps {
    pageNumber: number;
    scale?: number;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
    children?: ReactNode;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;

  export const pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: string;
      maxImageSize?: number;
      isEvalSupported?: boolean;
      disableStream?: boolean;
      disableAutoFetch?: boolean;
      disableBlobURLs?: boolean;
      maxCanvasPixels?: number;
      useSystemFonts?: boolean;
    };
    version: string;
    getDocument: (options: { data: Uint8Array }) => Promise<any>;
  };
}
