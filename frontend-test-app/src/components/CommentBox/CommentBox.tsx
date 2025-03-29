"use client";

import React, { useState, ChangeEvent } from "react";

interface CommentBoxProps {
  onSave: (content: string) => void;
  onCancel: () => void;
  initialContent?: string;
}

export default function CommentBox({
  onSave,
  onCancel,
  initialContent = "",
}: CommentBoxProps) {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    onSave(content);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Add Comment</h3>
        </div>
        <form>
          <textarea
            value={content}
            onChange={handleChange}
            className="w-full h-32 p-2 border border-gray-300 rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your comment here..."
            autoFocus
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
