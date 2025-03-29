declare module "pdf-lib" {
  export interface PDFDocument {
    getPage(pageIndex: number): PDFPage;
    save(): Promise<Uint8Array>;
    embedPng(imageData: string): Promise<PDFImage>;
  }

  export interface PDFPage {
    getSize(): { width: number; height: number };
    drawRectangle(options: {
      x: number;
      y: number;
      width: number;
      height: number;
      color: RGB;
      opacity?: number;
      borderColor?: RGB;
      borderWidth?: number;
    }): void;
    drawLine(options: {
      start: { x: number; y: number };
      end: { x: number; y: number };
      thickness: number;
      color: RGB;
    }): void;
    drawText(
      text: string,
      options: {
        x: number;
        y: number;
        size: number;
        color: RGB;
      }
    ): void;
    drawImage(
      image: PDFImage,
      options: {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    ): void;
  }

  export interface PDFImage {
    // Add any necessary methods here
  }

  export interface RGB {
    r: number;
    g: number;
    b: number;
  }

  export function rgb(r: number, g: number, b: number): RGB;
  export function load(pdfBytes: ArrayBuffer): Promise<PDFDocument>;
}
