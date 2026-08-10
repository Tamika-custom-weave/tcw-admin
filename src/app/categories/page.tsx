"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Category } from "@/types";

export default function CategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Local state for the input field to avoid lag while typing
  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  // Sync local search when URL changes externally
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setLocalSearch(q);
    }
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (val.trim()) {
      current.set("search", val.trim());
    } else {
      current.delete("search");
    }
    router.push(`?${current.toString()}`);
  };

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await fetchApi<Category[]>("/categories");
      setCategories(data);
    } catch (error) { const err = error as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await fetchApi(`/categories/${id}`, { method: "DELETE" });
      setCategories(categories.filter((c) => c._id !== id));
    } catch (error) { const err = error as Error;
      alert("Failed to delete category: " + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your product categories and collections.</p>
        </div>
        <button
          onClick={() => {
            const current = new URLSearchParams(Array.from(searchParams.entries()));
            current.set("modal", "new-category");
            router.push(`?${current.toString()}`);
          }}
          className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm font-medium text-sm border border-transparent hover:border-gray-800"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          Add Category
        </button>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-gray-50/50 px-3 py-2.5 rounded-xl w-full max-w-md border border-gray-200 focus-within:ring-2 focus-within:ring-gold-500 focus-within:border-gold-500 transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories by name..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading categories...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Created</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.filter(c => c.name.toLowerCase().includes(searchQuery)).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories
                  .filter(c => c.name.toLowerCase().includes(searchQuery))
                  .map((category) => (
                  <tr key={category._id} className="border-b border-gray-50 hover:bg-gold-50/30 transition-colors group">
                    <td className="py-4 px-6 font-semibold text-gray-900">{category.name}</td>
                    <td className="py-4 px-6 text-gray-500 truncate max-w-xs text-sm">{category.description || <span className="text-gray-300 italic">No description</span>}</td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {new Date(category.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            const current = new URLSearchParams(Array.from(searchParams.entries()));
                            current.set("modal", "edit-category");
                            current.set("id", category._id);
                            router.push(`?${current.toString()}`);
                          }}
                          className="text-gray-400 hover:text-gold-600 transition-colors p-2 rounded-md hover:bg-gold-50"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
