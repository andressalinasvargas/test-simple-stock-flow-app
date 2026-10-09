export interface Product {
  id: string;
  name: string;
  price: number;
  currency?: string;
  stock: number;
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
  isActive: boolean;
}

export interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  categoryId: string;
}

