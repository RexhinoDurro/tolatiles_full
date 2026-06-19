'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface MediaUploaderProps {
  onUpload: (file: File) => Promise<void>;
}

export default function MediaUploader({ onUpload }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        await onUpload(file);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-500 hover:text-blue-600 disabled:opacity-50"
    >
      {uploading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <Upload className="w-5 h-5" />
          <span className="text-xs font-medium">Upload</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        multiple
        className="sr-only"
        onChange={handleChange}
      />
    </button>
  );
}
