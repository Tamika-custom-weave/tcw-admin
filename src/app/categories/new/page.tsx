import { CategoryForm } from "@/components/CategoryForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCategoryPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/categories" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Create New Category</h1>
      </div>
      
      <CategoryForm />
    </div>
  );
}
