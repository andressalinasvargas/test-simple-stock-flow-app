export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
}

export interface SalesReportRowDTO {
  productId: string;
  productName: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
}

export interface SalesReportDTO {
  from: string;
  to: string;
  salesCount: number;
  grandTotal: number;
  currency: string;
  rows: SalesReportRowDTO[];
}

