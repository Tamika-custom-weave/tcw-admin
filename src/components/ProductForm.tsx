"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Category, Product, ProductImage, ProductVariant } from "@/types";
import { ImageUpload } from "./ImageUpload";
import { Plus, Trash2, Tag, Layers, ChevronDown, ChevronUp, Eye } from "lucide-react";

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
  onSuccess?: () => void;
}

// Determines which extra fields to show based on the category
function getCategoryType(catName: string): "bundle" | "closure" | "frontal" | "generic" {
  const n = catName.toLowerCase();
  if (n.includes("bundle")) return "bundle";
  if (n.includes("closure")) return "closure";
  if (n.includes("frontal")) return "frontal";
  return "generic";
}

// ---- Sub-component: Live Storefront Preview Card ----
function VariantPreviewCard({ variant, catType }: { variant: ProductVariant; catType: string }) {
  const attrs: { label: string; value: string }[] = [];

  if (variant.color) attrs.push({ label: "Color", value: variant.color });
  if (variant.length && (catType === "bundle" || catType === "closure" || catType === "frontal"))
    attrs.push({ label: "Length", value: variant.length });
  if (variant.size && (catType === "closure" || catType === "frontal"))
    attrs.push({ label: "Lace Size", value: variant.size });
  if (variant.laceType && (catType === "closure" || catType === "frontal"))
    attrs.push({ label: "Lace Type", value: variant.laceType });

  return (
    <div className="flex items-center gap-3 flex-wrap bg-gold-50 border border-gold-100 rounded-lg px-3 py-2 text-sm">
      <span className="font-semibold text-gold-700">${variant.price}</span>
      <span className="text-gray-400">·</span>
      <span className="text-gray-600">{variant.stock} in stock</span>
      {attrs.map((a) => (
        <>
          <span className="text-gray-400">·</span>
          <span className="text-gray-700"><span className="text-gray-400">{a.label}: </span>{a.value}</span>
        </>
      ))}
      {variant.sku && (
        <>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400 text-xs font-mono">SKU: {variant.sku}</span>
        </>
      )}
    </div>
  );
}

// ---- Sub-component: Single Variant Row ----
function VariantRow({
  variant,
  index,
  catType,
  total,
  onChange,
  onRemove,
}: {
  variant: ProductVariant;
  index: number;
  catType: string;
  total: number;
  onChange: (field: keyof ProductVariant, value: string | number) => void;
  onRemove: () => void;
}) {
  const showLength = catType === "bundle" || catType === "closure" || catType === "frontal";
  const showLaceFields = catType === "closure" || catType === "frontal";

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all bg-white";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Variant #{index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          disabled={total === 1}
          className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors p-1 rounded"
          title="Remove this variant"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Always-visible fields */}
        <div>
          <label className={labelCls}>Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={variant.price}
            onChange={(e) => onChange("price", parseFloat(e.target.value) || 0)}
            required
            placeholder="0.00"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Stock</label>
          <input
            type="number"
            min="0"
            value={variant.stock}
            onChange={(e) => onChange("stock", parseInt(e.target.value) || 0)}
            required
            placeholder="0"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className={labelCls}>SKU</label>
          <input
            type="text"
            value={variant.sku}
            onChange={(e) => onChange("sku", e.target.value)}
            required
            placeholder="e.g. BBW-18-HD"
            className={inputCls}
          />
        </div>

        {/* Category-conditional fields */}
        {showLength && (
          <div>
            <label className={labelCls}>Length</label>
            <input
              type="text"
              value={variant.length || ""}
              onChange={(e) => onChange("length", e.target.value)}
              placeholder='e.g. 18"'
              className={inputCls}
            />
          </div>
        )}
        {showLaceFields && (
          <>
            <div>
              <label className={labelCls}>Lace Size</label>
              <input
                type="text"
                value={variant.size || ""}
                onChange={(e) => onChange("size", e.target.value)}
                placeholder="e.g. 5x5"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Lace Type</label>
              <input
                type="text"
                value={variant.laceType || ""}
                onChange={(e) => onChange("laceType", e.target.value)}
                placeholder="e.g. HD, Transparent"
                className={inputCls}
              />
            </div>
          </>
        )}

        {/* Color always available */}
        <div>
          <label className={labelCls}>Color <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
          <input
            type="text"
            value={variant.color || ""}
            onChange={(e) => onChange("color", e.target.value)}
            placeholder="e.g. Natural Black"
            className={inputCls}
          />
        </div>
      </div>

      {/* Preview row */}
      <div className="px-4 pb-4">
        <VariantPreviewCard variant={variant} catType={catType} />
      </div>
    </div>
  );
}

// ---- Main Form ----
export function ProductForm({ initialData, isEdit, onSuccess }: ProductFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState(
    typeof initialData?.category === "object"
      ? initialData.category._id
      : initialData?.category || ""
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [thumbnail, setThumbnail] = useState<ProductImage | null>(
    initialData?.thumbnail || initialData?.images?.[0] || null
  );
  const [gallery, setGallery] = useState<ProductImage[]>(
    initialData?.images || []
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants?.length
      ? initialData.variants
      : [{ price: 0, stock: 0, sku: "" }]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchApi<Category[]>("/categories")
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === categoryId),
    [categories, categoryId]
  );
  const catType = useMemo(
    () => getCategoryType(selectedCategory?.name || selectedCategory?.slug || ""),
    [selectedCategory]
  );

  const handleAddVariant = () => {
    setVariants([...variants, { price: 0, stock: 0, sku: "" }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return setError("Please select a category.");
    if (!thumbnail) return setError("Please upload a thumbnail image.");
    if (variants.length === 0) return setError("At least one variant is required.");

    setLoading(true);
    setError(null);

    // Sanitize variants: strip fields that don't apply to this category type
    const showLength = catType === "bundle" || catType === "closure" || catType === "frontal";
    const showLaceFields = catType === "closure" || catType === "frontal";

    const sanitizedVariants = variants.map((v) => ({
      price: v.price,
      stock: v.stock,
      sku: v.sku,
      ...(v.color ? { color: v.color } : {}),
      ...(showLength && v.length ? { length: v.length } : {}),
      ...(showLaceFields && v.size ? { size: v.size } : {}),
      ...(showLaceFields && v.laceType ? { laceType: v.laceType } : {}),
    }));

    const payload = {
      name,
      description,
      category: categoryId,
      isActive,
      thumbnail: thumbnail || undefined,
      images: gallery,
      variants: sanitizedVariants,
    };

    try {
      if (isEdit && initialData) {
        await fetchApi(`/products/${initialData._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/products");
      }
      router.refresh();
    } catch (error) { const err = error as Error;
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex gap-2 items-start">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Section 1: Basic Details ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50/50 border-b border-gray-100">
          <Tag className="w-4 h-4 text-gold-500" />
          <h2 className="font-semibold text-gray-800">Basic Details</h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Brazilian Body Wave Bundles"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {catType !== "generic" && (
              <p className="mt-1.5 text-xs text-gold-600 font-medium">
                {catType === "bundle" && "ℹ️ Variant builder will show: Length, Color"}
                {catType === "closure" && "ℹ️ Variant builder will show: Length, Lace Size, Lace Type, Color"}
                {catType === "frontal" && "ℹ️ Variant builder will show: Length, Lace Size, Lace Type, Color"}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short product description visible to customers…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gold-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Active — visible to customers on the storefront
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Section 2: Images ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50/50 border-b border-gray-100">
          <Eye className="w-4 h-4 text-gold-500" />
          <h2 className="font-semibold text-gray-800">Product Images</h2>
        </div>
        <div className="p-6 flex flex-col gap-6">
          {/* Thumbnail */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Main / Thumbnail Image <span className="text-red-500">*</span>
            </p>
            <p className="text-xs text-gray-500 mb-3">
              This is the primary image shown on product cards and at the top of the product page.
            </p>
            <ImageUpload value={thumbnail} onChange={setThumbnail} label="" />
          </div>

          {/* Gallery */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Gallery Images</p>
            <p className="text-xs text-gray-500 mb-3">
              Additional photos shown in the image gallery on the product page. Add as many as you like.
            </p>
            <div className="flex flex-wrap gap-4">
              {gallery.map((img, idx) => (
                <ImageUpload
                  key={idx}
                  value={img}
                  onChange={(newImg) => {
                    if (!newImg) {
                      setGallery(gallery.filter((_, i) => i !== idx));
                    } else {
                      const updated = [...gallery];
                      updated[idx] = newImg;
                      setGallery(updated);
                    }
                  }}
                  label=""
                />
              ))}
              <ImageUpload
                value={null}
                onChange={(img) => { if (img) setGallery([...gallery, img]); }}
                label=""
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Variants ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gold-500" />
            <h2 className="font-semibold text-gray-800">Product Variants</h2>
            <span className="ml-2 text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-medium">
              {variants.length} variant{variants.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        </div>

        {/* Helper tip */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 font-medium">
          💡 Each row = one purchasable option on the storefront (e.g. one length + lace combination).
          The fields shown depend on the category selected above.
        </div>

        {!categoryId && (
          <div className="p-8 text-center text-gray-400 text-sm">
            Select a category above to configure variant fields.
          </div>
        )}

        {categoryId && (
          <div className="p-6 space-y-4">
            {variants.map((variant, index) => (
              <VariantRow
                key={index}
                variant={variant}
                index={index}
                catType={catType}
                total={variants.length}
                onChange={(field, value) => handleVariantChange(index, field, value)}
                onRemove={() => handleRemoveVariant(index)}
              />
            ))}

            <button
              type="button"
              onClick={handleAddVariant}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gold-400 hover:text-gold-600 hover:bg-gold-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add another variant
            </button>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-4 pb-8">
        <button
          type="button"
          onClick={() => {
            if (onSuccess) onSuccess();
            else router.push("/products");
          }}
          className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl font-semibold text-white bg-gray-900 hover:bg-black disabled:opacity-50 transition-all shadow-sm"
        >
          {loading
            ? "Saving…"
            : isEdit
            ? "Update Product"
            : "Create Product"}
        </button>
      </div>
    </form>
  );
}
