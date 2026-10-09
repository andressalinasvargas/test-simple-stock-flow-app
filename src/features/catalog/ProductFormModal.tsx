import React, { useState, useEffect } from 'react';
import { Product, ProductFormData } from '../../domain/model/Product';
import { CategoryDTO } from '../../infrastructure/api.dto';
import { HttpProductRepository } from '../../infrastructure/HttpProductRepository';

interface ProductFormModalProps {
  product?: Product | null;
  categories: CategoryDTO[];
  onClose: () => void;
  onSaved: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [stock, setStock] = useState(product ? String(product.stock) : '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || (categories[0]?.id || ''));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(String(product.price));
      setStock(String(product.stock));
      setCategoryId(product.categoryId);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData: ProductFormData = {
      name: name.trim(),
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      categoryId,
    };

    try {
      let prodId = product?.id;
      if (product) {
        await HttpProductRepository.updateProduct(product.id, formData);
      } else {
        const res = await HttpProductRepository.createProduct(formData);
        prodId = res.id;
      }

      if (imageFile && prodId) {
        await HttpProductRepository.uploadImage(prodId, imageFile);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Producto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej: Martillo de Uña 16oz"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio (COP)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="25000.00"
              />
            </div>

            <div className="form-group">
              <label>Stock Inicial</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                placeholder="10"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Imagen (Opcional, máx 5MB)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

