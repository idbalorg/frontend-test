import { PDFDocument, rgb } from "pdf-lib";
import { Annotation } from "@/types/pdfExport";

export async function exportAnnotatedPDF(
  originalPdfArrayBuffer: ArrayBuffer,
  annotations: Annotation[]
): Promise<Uint8Array> {
  // Load the PDF document
  const pdfDoc = await PDFDocument.load(originalPdfArrayBuffer);

  // Process each annotation
  for (const annotation of annotations) {
    const page = pdfDoc.getPage(annotation.pageNumber - 1);
    const { width, height } = page.getSize();

    // Convert coordinates from screen space to PDF space
    const pdfX = annotation.position.x / 100;
    const pdfY = height - annotation.position.y / 100;

    switch (annotation.type) {
      case "highlight":
        // Draw highlight rectangle
        page.drawRectangle({
          x: pdfX,
          y: pdfY - 10,
          width: 100,
          height: 20,
          color: rgb(
            parseInt(annotation.color.slice(1, 3), 16) / 255,
            parseInt(annotation.color.slice(3, 5), 16) / 255,
            parseInt(annotation.color.slice(5, 7), 16) / 255
          ),
          opacity: 0.3,
        });
        break;

      case "underline":
        // Draw underline
        page.drawLine({
          start: { x: pdfX, y: pdfY },
          end: { x: pdfX + 100, y: pdfY },
          thickness: 2,
          color: rgb(
            parseInt(annotation.color.slice(1, 3), 16) / 255,
            parseInt(annotation.color.slice(3, 5), 16) / 255,
            parseInt(annotation.color.slice(5, 7), 16) / 255
          ),
        });
        break;

      case "comment":
        // Draw comment box
        if (annotation.content) {
          page.drawRectangle({
            x: pdfX,
            y: pdfY + 10,
            width: 200,
            height: 60,
            color: rgb(1, 1, 0.8),
            borderColor: rgb(
              parseInt(annotation.color.slice(1, 3), 16) / 255,
              parseInt(annotation.color.slice(3, 5), 16) / 255,
              parseInt(annotation.color.slice(5, 7), 16) / 255
            ),
            borderWidth: 2,
          });

          // Add comment text
          page.drawText(annotation.content, {
            x: pdfX + 5,
            y: pdfY + 45,
            size: 10,
            color: rgb(0, 0, 0),
          });
        }
        break;

      case "signature":
        // Add signature image
        if (annotation.signatureData) {
          const signatureImage = await pdfDoc.embedPng(
            annotation.signatureData
          );
          page.drawImage(signatureImage, {
            x: pdfX,
            y: pdfY - 50,
            width: 200,
            height: 100,
          });
        }
        break;
    }
  }

  // Save the modified PDF
  return await pdfDoc.save();
}
