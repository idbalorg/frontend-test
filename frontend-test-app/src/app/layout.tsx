import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Document Signer & Annotation Tool",
  description:
    "A powerful PDF document viewer with annotation, signature, and commenting capabilities. View, annotate, and sign PDF documents with ease.",
  keywords:
    "PDF viewer, document annotation, digital signature, PDF tools, document management",
  openGraph: {
    title: "Document Signer & Annotation Tool",
    description: "View, annotate, and sign PDF documents with ease.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Document Signer & Annotation Tool",
    description: "View, annotate, and sign PDF documents with ease.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
