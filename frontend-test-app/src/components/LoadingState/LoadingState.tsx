"use client";

import React from "react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
