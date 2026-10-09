import { ApiClient } from './client';
import { Sale } from '../domain/model/Sale';
import { PagedResponse, SalesReportDTO } from './api.dto';

export class HttpSaleRepository {
  public static async createSale(lines: { productId: string; quantity: number }[]): Promise<{ id: string }> {
    return await ApiClient.request<{ id: string }>('/api/sales', {
      method: 'POST',
      body: JSON.stringify({ lines }),
    });
  }

  public static async getSales(
    from: string,
    to: string,
    page: number = 1,
    size: number = 20
  ): Promise<PagedResponse<Sale>> {
    const params = new URLSearchParams({
      from,
      to,
      page: String(page),
      size: String(size),
    });

    return await ApiClient.request<PagedResponse<Sale>>(`/api/sales?${params.toString()}`);
  }

  public static async getSale(id: string): Promise<Sale> {
    return await ApiClient.request<Sale>(`/api/sales/${id}`);
  }

  public static async getReport(from: string, to: string): Promise<SalesReportDTO> {
    const params = new URLSearchParams({
      from,
      to,
    });

    return await ApiClient.request<SalesReportDTO>(`/api/reports/sales?${params.toString()}`);
  }
}

