import React, { useState, useEffect } from 'react';
import { Product } from '../../domain/model/Product';
import { CategoryDTO } from '../../infrastructure/api.dto';
import { HttpProductRepository } from '../../infrastructure/HttpProductRepository';
import { formatMoney } from '../../domain/model/Money';
import { ProductFormModal } from './ProductFormModal';

interface ProductCatalogProps {
  isAdmin: boolean;
  onAddToCart: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ isAdmin, onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadCategories = async () => {
    try {
      const cats = await HttpProductRepository.getCategories();
      setCategories(cats);
    } catch (err: any) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await HttpProductRepository.getProducts(
        page,
        20,
        searchTerm || undefined,
        selectedCategory || undefined
      );
      setProducts(res.items);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, searchTerm]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas dar de baja el producto '${name}'?`)) {
      return;
    }
    try {
      await HttpProductRepository.deleteProduct(id);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el producto.');
    }
  };

  return (
    <div className="catalog-container">
      <div className="catalog-toolbar">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
          >
            + Nuevo Producto
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading-state">Cargando catálogo...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No hay productos disponibles.</div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <div className="product-image-container">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="product-img" />
                ) : (
                  <div className="product-placeholder">📦</div>
                )}
                <span className="badge category-badge">{p.categoryName}</span>
              </div>

              <div className="product-info">
                <h4>{p.name}</h4>
                <div className="product-price">{formatMoney(p.price)}</div>
                <div className="product-stock">
                  Stock: <strong className={p.stock === 0 ? 'text-danger' : ''}>{p.stock}</strong>
                </div>

                <div className="product-actions">
                  <button
                    className="btn btn-success btn-sm btn-block"
                    disabled={p.stock <= 0}
                    onClick={() => onAddToCart(p)}
                  >
                    {p.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
                  </button>

                  {isAdmin && (
                    <div className="admin-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setEditingProduct(p);
                          setModalOpen(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger-outline btn-sm"
                        onClick={() => handleDelete(p.id, p.name)}
                      >
                        Baja
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="btn btn-secondary btn-sm"
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="btn btn-secondary btn-sm"
          >
            Siguiente
          </button>
        </div>
      )}

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={loadProducts}
        />
      )}
    </div>
  );
};

