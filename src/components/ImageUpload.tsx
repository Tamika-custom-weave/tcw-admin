"use client";

import { useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { ProductImage } from "@/types";
import Image from "next/image";

interface ImageUploadProps {
  value: ProductImage | null;
  onChange: (value: ProductImage | null) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label = "Upload Image", className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: If there's already an image, we should probably delete it first, 
    // or just let the user explicitly remove it. Let's make them explicitly remove it to avoid complex state.
    
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const data = await fetchApi<ProductImage>("/uploads", {
        method: "POST",
        body: formData,
      });
      onChange(data);
    } catch (error) { const err = error as Error;
      setError(err.message);
    } finally {
      setIsUploading(false);
      // Reset input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Optional: Show some loading state on the remove button, but for simplicity we assume it's fast.
      // We trigger the delete on the backend to avoid orphaned images.
      await fetchApi(`/uploads/${value.publicId}`, {
        method: "DELETE",
      });
    } catch (error) { const err = error as Error;
      console.error("Failed to delete image from backend", err);
      // We still clear it from the form even if it fails on backend, otherwise user is stuck.
    } finally {
      onChange(null);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      
      {value ? (
        <div className="relative group w-40 h-40 rounded-xl overflow-hidden border border-gray-200">
          {/* Using img for simplicity instead of Next Image to avoid host configuration issues initially */}
          <img 
            src={value.url} 
            alt="Uploaded" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <label className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors relative bg-gray-50">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-500">Select Image</span>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
