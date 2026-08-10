"use client";

import { useState, FormEvent, useEffect } from "react";
import { Search, Menu } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const pathname = usePathname();

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setQuery(q);
    } else {
      setQuery("");
    }
  }, [searchParams]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    // Preserve existing query params like modal
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (query.trim()) {
      current.set("search", query.trim());
    } else {
      current.delete("search");
    }
    
    const search = current.toString();
    router.push(`${pathname}${search ? `?${search}` : ""}`);
  };

  return (
    <header className="h-20 bg-zinc-50 flex items-center justify-between px-4 md:px-8 border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="flex items-center gap-4 md:gap-8 flex-1 md:flex-none justify-end">
        {pathname !== "/products" && pathname !== "/categories" && (
          <form onSubmit={handleSearch} className="relative flex items-center w-full md:w-auto max-w-sm">
            <button type="submit" className="absolute left-0 p-1 text-gray-400 hover:text-gold-500 transition-colors" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-8 pr-4 py-2 bg-transparent border-b border-gray-200 focus:outline-none focus:border-gold-500 w-full md:w-64 text-sm transition-colors"
            />
          </form>
        )}
      </div>
    </header>
  );
}
