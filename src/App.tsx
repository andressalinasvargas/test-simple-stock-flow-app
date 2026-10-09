import React, { useState } from 'react';
import { ApiClient } from './infrastructure/client';
import { HttpAuthService } from './infrastructure/HttpAuthService';
import { Product } from './domain/model/Product';
import { CartItem } from './domain/model/Sale';
import { LoginView } from './features/auth/LoginView';
import { ProductCatalog } from './features/catalog/ProductCatalog';
import { SalesCart } from './features/sales/SalesCart';
import { SalesReportView } from './features/reports/SalesReportView';
import { RegisterSellerView } from './features/users/RegisterSellerView';

type Tab = 'catalog' | 'cart' | 'reports' | 'users';

export const App: React.FC = () => {
  const [user, setUser] = useState<{ username: string; role: 'admin' | 'seller' } | null>(
    ApiClient.getStoredUser()
  );
  const [activeTab, setActiveTab] = useState<Tab>('catalog');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleLogout = () => {
    HttpAuthService.logout();
    setUser(null);
    setCartItems([]);
  };

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('No hay más stock disponible para este producto.');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const qty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  if (!user) {
    return <LoginView onLoginSuccess={(u) => setUser(u)} />;
  }

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="container header-content">
          <div className="logo">
            <span className="logo-icon">📦</span>
            <h1>Simple Stock Flow</h1>
          </div>

          <nav className="main-nav">
            <button
              className={`nav-btn ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              Catálogo
            </button>
            <button
              className={`nav-btn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              Carrito {totalCartCount > 0 && <span className="cart-badge">{totalCartCount}</span>}
            </button>
            <button
              className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              Reportes
            </button>
            {user.role === 'admin' && (
              <button
                className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Vendedores
              </button>
            )}
          </nav>

          <div className="user-profile">
            <span className="user-info">
              {user.username} <span className="role-tag">{user.role}</span>
            </span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {activeTab === 'catalog' && (
            <ProductCatalog
              isAdmin={user.role === 'admin'}
              onAddToCart={handleAddToCart}
            />
          )}

          {activeTab === 'cart' && (
            <SalesCart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onSaleCompleted={() => setActiveTab('catalog')}
            />
          )}

          {activeTab === 'reports' && <SalesReportView />}

          {activeTab === 'users' && user.role === 'admin' && <RegisterSellerView />}
        </div>
      </main>
    </div>
  );
};

export default App;

