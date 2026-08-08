import Link from "next/link";
import { LayoutDashboard, Package, Tags, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-indigo-400">TCW Admin</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link href="/categories" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <Tags className="w-5 h-5" />
          Categories
        </Link>
        <Link href="/products" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <Package className="w-5 h-5" />
          Products
        </Link>
      </nav>
      <div className="p-4 mt-auto">
        <button className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </aside>
  );
}
