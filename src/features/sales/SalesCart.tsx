import React, { useState } from 'react';
import { CartItem } from '../../domain/model/Sale';
import { HttpSaleRepository } from '../../infrastructure/HttpSaleRepository';
import { formatMoney } from '../../domain/model/Money';

interface SalesCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onSaleCompleted: () => void;
}

export const SalesCart: React.FC<SalesCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSaleCompleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotal = (): number => {
    return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setError(null);
    setLoading(true);

    try {
      const lines = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const result = await HttpSaleRepository.createSale(lines);
      alert(`¡Venta registrada con éxito!\nID de Venta: ${result.id}\nTotal: ${formatMoney(calculateTotal())}`);
      onClearCart();
      onSaleCompleted();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la venta.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <span className="empty-icon">🛒</span>
        <h3>El carrito está vacío</h3>
        <p>Agrega productos desde el catálogo para iniciar una venta.</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Punto de Venta / Carrito</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="cart-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio Unit.</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const subtotal = item.product.price * item.quantity;
              return (
                <tr key={item.product.id}>
                  <td>
                    <strong>{item.product.name}</strong>
                    <div className="item-cat text-muted">{item.product.categoryName}</div>
                  </td>
                  <td>{formatMoney(item.product.price)}</td>
                  <td>
                    <div className="qty-control">
                      <button
                        className="btn-qty"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="btn-qty"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td><strong>{formatMoney(subtotal)}</strong></td>
                  <td>
                    <button
                      className="btn-remove"
                      onClick={() => onRemoveItem(item.product.id)}
                      title="Eliminar del carrito"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="cart-summary">
        <div className="total-row">
          <span>Total a Pagar:</span>
          <strong>{formatMoney(calculateTotal())}</strong>
        </div>
        <div className="cart-actions">
          <button className="btn btn-secondary" onClick={onClearCart} disabled={loading}>
            Vaciar Carrito
          </button>
          <button className="btn btn-primary btn-lg" onClick={handleCheckout} disabled={loading}>
            {loading ? 'Procesando Venta...' : 'Completar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
};

