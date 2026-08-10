"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Modal } from "./Modal";
import { ProductForm } from "./ProductForm";
import { CategoryForm } from "./CategoryForm";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Product, Category } from "@/types";

export function GlobalModals() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modalType = searchParams.get("modal");
  const editId = searchParams.get("id");

  const [initialProduct, setInitialProduct] = useState<Product | undefined>();
  const [initialCategory, setInitialCategory] = useState<Category | undefined>();
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    // Clear query params by pushing the current pathname
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("modal");
    newParams.delete("id");
    const newSearch = newParams.toString();
    router.push(newSearch ? `${pathname}?${newSearch}` : pathname);
  };

  useEffect(() => {
    if (modalType === "edit-product" && editId) {
      setLoading(true);
      fetchApi<Product>(`/products/${editId}`)
        .then(data => {
          setInitialProduct(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setInitialProduct(undefined);
    }
  }, [modalType, editId]);

  useEffect(() => {
    if (modalType === "edit-category" && editId) {
      setLoading(true);
      fetchApi<Category>(`/categories/${editId}`)
        .then(data => {
          setInitialCategory(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setInitialCategory(undefined);
    }
  }, [modalType, editId]);

  if (!modalType) return null;

  return (
    <>
      <Modal
        isOpen={modalType === "new-product" || modalType === "edit-product"}
        onClose={handleClose}
        title={modalType === "edit-product" ? "Edit Product" : "Add New Product"}
      >
        {modalType === "edit-product" && loading ? (
          <div className="flex justify-center p-10 text-gray-500">Loading product data...</div>
        ) : (
          <ProductForm 
            initialData={initialProduct} 
            isEdit={modalType === "edit-product"} 
            onSuccess={handleClose} 
          />
        )}
      </Modal>

      <Modal
        isOpen={modalType === "new-category" || modalType === "edit-category"}
        onClose={handleClose}
        title={modalType === "edit-category" ? "Edit Category" : "Add New Category"}
      >
        {modalType === "edit-category" && loading ? (
          <div className="flex justify-center p-10 text-gray-500">Loading category data...</div>
        ) : (
          <CategoryForm 
            initialData={initialCategory} 
            isEdit={modalType === "edit-category"} 
            onSuccess={handleClose}
          />
        )}
      </Modal>
    </>
  );
}
