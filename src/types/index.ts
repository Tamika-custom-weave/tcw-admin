export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  price: number;
  stock: number;
  sku: string;
  length?: string;
  size?: string;
  laceType?: string;
  color?: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: Category | string; // API returns object on GET, might accept string on POST
  images: ProductImage[];
  thumbnail?: ProductImage;
  variants: ProductVariant[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
