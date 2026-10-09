import { ApiClient } from './client';
import { Product, ProductFormData } from '../domain/model/Product';
import { CategoryDTO, PagedResponse } from './api.dto';

export class HttpProductRepository {
  public static async getProducts(
    page: number = 1,
    size: number = 20,
    search?: string,
    categoryId?: string
  ): Promise<PagedResponse<Product>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId);

    return await ApiClient.request<PagedResponse<Product>>(`/api/products?${params.toString()}`);
  }

  public static async getProduct(id: string): Promise<Product> {
    return await ApiClient.request<Product>(`/api/products/${id}`);
  }

  public static async createProduct(data: ProductFormData): Promise<{ id: string }> {
    return await ApiClient.request<{ id: string }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static async updateProduct(id: string, data: ProductFormData): Promise<void> {
    await ApiClient.request<void>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public static async deleteProduct(id: string): Promise<void> {
    await ApiClient.request<void>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  public static async uploadImage(id: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return await ApiClient.request<{ imageUrl: string }>(`/api/products/${id}/image`, {
      method: 'POST',
      body: formData,
    });
  }

  public static async getCategories(): Promise<CategoryDTO[]> {
    return await ApiClient.request<CategoryDTO[]>('/api/categories');
  }
}

