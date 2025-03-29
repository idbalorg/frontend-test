"use client";

import React from "react";

export type AnnotationType =
  | "highlight"
  | "underline"
  | "comment"
  | "signature";

interface AnnotationToolsProps {
  onToolSelect: (type: AnnotationType | null) => void;
  onColorSelect: (color: string) => void;
  currentTool: AnnotationType | null;
  currentColor: string;
}

const colors = [
  "#ffd600", // Darker Yellow
  "#43a047", // Darker Green
  "#1976d2", // Darker Blue
  "#f4511e", // Darker Orange
  "#d81b60", // Darker Pink
];

export default function AnnotationTools({
  onToolSelect,
  onColorSelect,
  currentTool,
  currentColor,
}: AnnotationToolsProps) {
  return (
    <div className="fixed left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg p-2 sm:p-4 space-y-2 sm:space-y-4 z-50">
      <div className="space-y-1 sm:space-y-2">
        <button
          onClick={() =>
            onToolSelect(currentTool === "highlight" ? null : "highlight")
          }
          className={`p-1.5 sm:p-2 rounded transition-colors ${
            currentTool === "highlight" ? "bg-blue-300" : "hover:bg-blue-100"
          }`}
          title="Highlight"
          aria-label="Highlight text"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
        <button
          onClick={() =>
            onToolSelect(currentTool === "underline" ? null : "underline")
          }
          className={`p-1.5 sm:p-2 rounded transition-colors ${
            currentTool === "underline" ? "bg-blue-300" : "hover:bg-blue-100"
          }`}
          title="Underline"
          aria-label="Underline text"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 8h10M7 12h4m1 8l-4-4-4 4M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
        <button
          onClick={() =>
            onToolSelect(currentTool === "comment" ? null : "comment")
          }
          className={`p-1.5 sm:p-2 rounded transition-colors ${
            currentTool === "comment" ? "bg-blue-300" : "hover:bg-blue-100"
          }`}
          title="Add Comment"
          aria-label="Add comment"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
        <button
          onClick={() =>
            onToolSelect(currentTool === "signature" ? null : "signature")
          }
          className={`p-1.5 sm:p-2 rounded transition-colors ${
            currentTool === "signature" ? "bg-blue-300" : "hover:bg-blue-100"
          }`}
          title="Add Signature"
          aria-label="Add signature"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.05c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            />
          </svg>
        </button>
      </div>
      <div className="flex justify-between items-center w-full gap-1 sm:gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-transform hover:scale-110 ${
              currentColor === color ? "ring-2 ring-blue-600 ring-offset-1" : ""
            }`}
            style={{ backgroundColor: color }}
            title={`Select ${color} color`}
            aria-label={`Select ${color} color`}
          />
        ))}
      </div>
    </div>
  );
}
