"use client";

import { useEffect, useState, use } from "react";
import { CategoryForm } from "@/components/CategoryForm";
import { fetchApi } from "@/lib/api";
import { Category } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const data = await fetchApi<Category>(`/categories/${id}`);
        setCategory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCategory();
  }, [id]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/categories" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Category</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 max-w-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : category ? (
        <CategoryForm initialData={category} isEdit />
      ) : null}
    </div>
  );
}
