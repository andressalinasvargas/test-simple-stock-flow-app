import React, { useState } from 'react';
import { HttpSaleRepository } from '../../infrastructure/HttpSaleRepository';
import { SalesReportDTO } from '../../infrastructure/api.dto';
import { formatMoney } from '../../domain/model/Money';

export const SalesReportView: React.FC = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [from, setFrom] = useState(firstDay.toISOString().substring(0, 10));
  const [to, setTo] = useState(today.toISOString().substring(0, 10));
  const [report, setReport] = useState<SalesReportDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fromIso = `${from}T00:00:00Z`;
      const nextDay = new Date(`${to}T00:00:00Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      const toIso = `${nextDay.toISOString().substring(0, 10)}T00:00:00Z`;
      const data = await HttpSaleRepository.getReport(fromIso, toIso);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error al generar reporte de ventas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="section-header">
        <div>
          <h2>Reporte Consolidado de Ventas</h2>
          <p className="subtitle">Consulta agregada e inmutable de ventas congeladas en el período</p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="report-form card">
        <div className="form-row">
          <div className="form-group">
            <label>Desde (Fecha Inicial)</label>
            <input
              type="date"
              required
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Hasta (Fecha Final)</label>
            <input
              type="date"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="form-group button-group">
            <button type="submit" className="btn btn-primary btn-generate" disabled={loading}>
              {loading ? 'Consultando...' : 'Generar Reporte'}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {report && (
        <div className="report-results">
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Ventas en el período</span>
              <strong className="kpi-value">{report.salesCount}</strong>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Total Facturado ({report.currency})</span>
              <strong className="kpi-value">{formatMoney(report.grandTotal)}</strong>
            </div>
          </div>

          <h3>Desglose por Producto</h3>
          {report.rows.length === 0 ? (
            <div className="empty-state">No se registraron ventas en el rango seleccionado.</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Unidades Vendidas</th>
                    <th>Facturación ({report.currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row) => (
                    <tr key={`${row.productId}-${row.categoryName}`}>
                      <td><strong>{row.productName}</strong></td>
                      <td><span className="badge category-badge">{row.categoryName}</span></td>
                      <td>{row.unitsSold}</td>
                      <td><strong>{formatMoney(row.revenue)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

