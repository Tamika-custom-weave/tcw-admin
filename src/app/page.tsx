"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Package, Shapes, ArrowRight, TrendingUp } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Product, Category } from "@/types";

export default function Home() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi<Product[]>("/products"),
      fetchApi<Category[]>("/categories")
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load dashboard data", err);
      setLoading(false);
    });
  }, []);

  const totalProducts = products.length;
  const thisMonthProducts = products.filter(p => {
    const created = new Date(p.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;
  const productSubtext = `+${thisMonthProducts} this month`;

  const totalCategories = categories.length;
  const categoryNames = categories.slice(0, 3).map(c => c.name).join(", ") + (categories.length > 3 ? "..." : "");

  const metrics = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      subtext: productSubtext,
      icon: Package,
      active: false,
      trending: thisMonthProducts > 0,
    },
    {
      title: "Total Categories",
      value: totalCategories.toString(),
      subtext: categoryNames || "No categories yet",
      icon: Shapes,
      active: false,
      trending: false,
    },
  ];

  let filteredProducts = [...products];
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery)
    );
  }

  const recentProducts = filteredProducts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(product => {
      const prodCatId = typeof product.category === 'object' ? product.category._id : product.category;
      const cat = categories.find(c => c._id === prodCatId);
      const catName = cat ? cat.name : "Uncategorized";
      
      const prices = product.variants?.length > 0 ? product.variants.map(v => v.price) : [0];
      const stocks = product.variants?.length > 0 ? product.variants.map(v => v.stock) : [0];
      
      const minPrice = Math.min(...prices);
      const totalStock = stocks.reduce((a, b) => a + b, 0);
      
      return {
        id: product._id,
        category: catName,
        title: product.name,
        price: `$${minPrice.toFixed(2)}`,
        stock: totalStock > 5 ? `In Stock: ${totalStock}` : (totalStock > 0 ? `Low Stock: ${totalStock}` : "Out of Stock"),
        lowStock: totalStock <= 5,
        image: product.images?.[0]?.url || null,
      };
    });

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-[1200px] w-full mx-auto">
      <div className="flex justify-between items-end mb-6 md:mb-10">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Overview</h1>
          <p className="text-gray-600 text-sm">Here is the latest snapshot of your business.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className={`p-6 border flex flex-col justify-between h-44 ${
              metric.active
                ? "bg-[#F9F7F4] border-[#e8dfcf]"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{metric.title}</span>
              <metric.icon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[2.5rem] font-serif text-gray-900 mb-2 leading-none">{metric.value}</div>
              <div className={`text-xs flex items-center gap-1 ${metric.trending ? "text-[#86733B]" : "text-gray-500"}`}>
                {metric.trending && <TrendingUp className="w-3.5 h-3.5" />}
                {metric.subtext}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-gray-900">Recently Added</h2>
          <a href="/products" className="text-xs font-bold uppercase tracking-wider text-[#86733B] hover:text-[#726232] flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        
        <div className="flex flex-col gap-4">
          {recentProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
              No products found. Add some products to see them here.
            </div>
          ) : (
            recentProducts.map((product) => (
              <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 bg-white hover:border-[#e8dfcf] transition-colors gap-4">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-zinc-50 flex-shrink-0 flex items-center justify-center border border-gray-100 relative overflow-hidden rounded-md">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="object-cover w-full h-full" />
                    ) : (
                      <Image src="/next.svg" width={40} height={40} alt="Product Placeholder" className="opacity-10" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">{product.category}</div>
                    <div className="text-xl font-serif text-gray-900">{product.title}</div>
                  </div>
                </div>
                <div className="text-left sm:text-right px-0 sm:px-6">
                  <div className="text-lg text-gray-900 mb-1">{product.price}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${product.lowStock ? "text-red-600" : "text-[#86733B]"}`}>
                    {product.stock}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
