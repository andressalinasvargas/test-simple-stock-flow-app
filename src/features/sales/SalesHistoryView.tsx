import React, { useState, useEffect, useCallback } from 'react';
import { Sale } from '../../domain/model/Sale';
import { HttpSaleRepository } from '../../infrastructure/HttpSaleRepository';

export const SalesHistoryView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Default date range: 30 days ago to today
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const formatCOP = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure ISO 8601 formatting with explicit Z timezone and H-3 [from, to) half-open interval
      const fromISO = `${fromDate}T00:00:00Z`;
      const nextDay = new Date(`${toDate}T00:00:00Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      const toISO = `${nextDay.toISOString().substring(0, 10)}T00:00:00Z`;

      const response = await HttpSaleRepository.getSales(fromISO, toISO, page, size);
      setSales(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.total || 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el historial de ventas');
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, page, size]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadSales();
  };

  return (
    <div className="sales-history-view">
      <div className="section-header">
        <div>
          <h2>Historial de Ventas</h2>
          <p className="subtitle">Registro inmutable de transacciones completadas</p>
        </div>
        <button className="btn btn-secondary" onClick={() => loadSales()} disabled={loading}>
          🔄 Actualizar
        </button>
      </div>

      <form className="filter-bar" onSubmit={handleFilterSubmit}>
        <div className="filter-group">
          <label htmlFor="from-date">Desde:</label>
          <input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
        </div>
        <div className="filter-group">
          <label htmlFor="to-date">Hasta:</label>
          <input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Filtrar
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando historial de ventas...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🧾</span>
          <h3>No hay ventas registradas</h3>
          <p>No se encontraron transacciones para el período seleccionado.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Venta</th>
                  <th>Fecha y Hora</th>
                  <th>Vendedor</th>
                  <th>Ítems</th>
                  <th>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <code title={sale.id}>{sale.id.substring(0, 8)}...</code>
                    </td>
                    <td>{new Date(sale.soldAt).toLocaleString('es-CO')}</td>
                    <td>
                      <span className="badge-user">{sale.soldBy}</span>
                    </td>
                    <td>{sale.items?.length || 0} línea(s)</td>
                    <td>
                      <strong>{formatCOP(sale.total)}</strong>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setSelectedSale(sale)}
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <span className="page-indicator">
              Página {page} de {totalPages} ({totalRecords} transacciones)
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {selectedSale && (
        <div className="modal-backdrop" onClick={() => setSelectedSale(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle de Venta</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedSale(null)}
                aria-label="Cerrar"
              >
                &times;
              </button>
            </div>

            <div className="sale-metadata">
              <p>
                <strong>ID Transacción:</strong> <code>{selectedSale.id}</code>
              </p>
              <p>
                <strong>Fecha / Hora:</strong>{' '}
                {new Date(selectedSale.soldAt).toLocaleString('es-CO')}
              </p>
              <p>
                <strong>Vendedor:</strong> {selectedSale.soldBy}
              </p>
            </div>

            <table className="modal-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Cant.</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.items?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.categoryName}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCOP(item.unitPrice)}</td>
                    <td>{formatCOP(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="modal-total-banner">
              <span>Total Venta:</span>
              <strong className="total-amount">{formatCOP(selectedSale.total)} COP</strong>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setSelectedSale(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
