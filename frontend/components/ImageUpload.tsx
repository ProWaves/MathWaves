"use client";
import { useRef, useState } from "react";

interface Props {
  onExtract: (latex: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function ImageUpload({ onExtract }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError("");
    setPreview(URL.createObjectURL(file));

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API_URL}/api/ocr`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "OCR failed");
      }

      const data = await res.json();
      onExtract(data.latex);
    } catch (e: any) {
      setError(e.message || "Could not read image");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all border bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50"
        title="Upload an image of a formula"
      >
        <span className="text-lg">📷</span>
        <span className="text-sm">{uploading ? "Reading..." : "Image"}</span>
      </button>
      {error && <span className="text-xs text-red-600 max-w-xs">{error}</span>}
    </div>
  );
}