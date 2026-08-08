import { ProductForm } from "@/components/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="p-8 overflow-y-auto">
      <div className="mb-6">
        <Link href="/products" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4 w-fit text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below. Variants define each purchasable option (e.g. by length and lace type).</p>
      </div>

      <ProductForm />
    </div>
  );
}
