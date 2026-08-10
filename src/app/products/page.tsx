"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Product, Category } from "@/types";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Search State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    Promise.all([
      fetchApi<Product[]>("/products"),
      fetchApi<Category[]>("/categories")
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  // Sync search state if URL changes externally
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearch(q);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetchApi(`/products/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) { const err = error as Error;
      alert("Failed to delete product: " + err.message);
    }
  };

  // Derived State (Client-side filtering)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.variants.some(v => v.sku.toLowerCase().includes(search.toLowerCase()));
      const prodCatId = typeof p.category === 'object' ? p.category._id : p.category;
      const matchesCategory = categoryFilter ? prodCatId === categoryFilter : true;
      const matchesStatus = statusFilter === "active" ? p.isActive : statusFilter === "inactive" ? !p.isActive : true;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // Derived State (Client-side pagination)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your hair extensions, wigs, and accessories.</p>
        </div>
        <button
          onClick={() => {
            const current = new URLSearchParams(Array.from(searchParams.entries()));
            current.set("modal", "new-product");
            router.push(`?${current.toString()}`);
          }}
          className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm font-medium text-sm border border-transparent hover:border-gray-800"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          Add Product
        </button>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2 bg-gray-50/50 px-3 py-2.5 rounded-xl w-full md:flex-1 md:min-w-[200px] border border-gray-200 focus-within:ring-2 focus-within:ring-gold-500 focus-within:border-gold-500 transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-auto text-sm border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gold-500 py-2.5 pl-3 pr-8 border bg-white shadow-sm hover:border-gray-300 transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto text-sm border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gold-500 py-2.5 pl-3 pr-8 border bg-white shadow-sm hover:border-gray-300 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading products...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price Range</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const prodCatId = typeof product.category === 'object' ? product.category._id : product.category;
                  const category = categories.find(c => c._id === prodCatId);
                  const prices = product.variants.map(v => v.price);
                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                  const priceStr = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;
                  const thumbnailObj = product.images?.[0];
                  
                  return (
                    <tr key={product._id} className="border-b border-gray-50 hover:bg-gold-50/30 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {thumbnailObj ? (
                            <img src={thumbnailObj.url} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-400">No Img</div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{product.variants.length} variant(s)</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">{category?.name || 'Unknown'}</td>
                      <td className="py-4 px-6 text-gray-900 font-medium text-sm">{priceStr}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${product.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              const current = new URLSearchParams(Array.from(searchParams.entries()));
                              current.set("modal", "edit-product");
                              current.set("id", product._id);
                              router.push(`?${current.toString()}`);
                            }}
                            className="text-gray-400 hover:text-gold-600 transition-colors p-2 rounded-md hover:bg-gold-50"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500 text-center sm:text-left">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
