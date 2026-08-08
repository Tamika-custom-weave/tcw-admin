"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Product, Category } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Search State
  const [search, setSearch] = useState("");
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetchApi(`/products/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err: any) {
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <Link
          href="/products/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg flex-1 min-w-[200px] border border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="text-sm border-gray-200 rounded-lg outline-none focus:ring-indigo-500 py-2 pl-2 pr-8 border bg-gray-50"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-sm border-gray-200 rounded-lg outline-none focus:ring-indigo-500 py-2 pl-2 pr-8 border bg-gray-50"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-100 text-sm">
                <th className="py-3 px-6 font-medium">Product</th>
                <th className="py-3 px-6 font-medium">Category</th>
                <th className="py-3 px-6 font-medium">Price Range</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
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
                    <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {thumbnailObj ? (
                            <img src={thumbnailObj.url} alt={product.name} className="w-12 h-12 rounded object-cover border border-gray-200" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">No Img</div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.variants.length} variant(s)</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{category?.name || 'Unknown'}</td>
                      <td className="py-4 px-6 text-gray-900 font-medium">{priceStr}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/products/${product._id}/edit`}
                            className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-md hover:bg-indigo-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50"
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
          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
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
