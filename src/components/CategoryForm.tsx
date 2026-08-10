"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Category } from "@/types";

interface CategoryFormProps {
  initialData?: Category;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export function CategoryForm({ initialData, isEdit, onSuccess }: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit && initialData) {
        await fetchApi(`/categories/${initialData._id}`, {
          method: "PUT",
          body: JSON.stringify({ name, description }),
        });
      } else {
        await fetchApi("/categories", {
          method: "POST",
          body: JSON.stringify({ name, description }),
        });
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/categories");
      }
      router.refresh();
    } catch (error) { const err = error as Error;
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all"
          placeholder="e.g., Electronics"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all resize-none"
          placeholder="Brief description of the category"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            if (onSuccess) onSuccess();
            else router.push("/categories");
          }}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 hover:bg-black text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
        </button>
      </div>
    </form>
  );
}
