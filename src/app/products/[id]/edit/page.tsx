"use client";

import { useEffect, useState, use } from "react";
import { ProductForm } from "@/components/ProductForm";
import { fetchApi } from "@/lib/api";
import { Product } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchApi<Product>(`/products/${id}`);
        setProduct(data);
      } catch (error) { const err = error as Error;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/products" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 max-w-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : product ? (
        <ProductForm initialData={product} isEdit />
      ) : null}
    </div>
  );
}
