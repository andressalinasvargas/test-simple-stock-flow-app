export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  soldAt: string;
  soldBy: string;
  total: number;
  currency: string;
  items: SaleItem[];
}

export interface CartItem {
  product: import('./Product').Product;
  quantity: number;
}

