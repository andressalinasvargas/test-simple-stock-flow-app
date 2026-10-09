import React, { useState } from 'react';
import { HttpAuthService } from '../../infrastructure/HttpAuthService';

interface RegisterSellerViewProps {
  onSuccess?: () => void;
}

export const RegisterSellerView: React.FC<RegisterSellerViewProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await HttpAuthService.register(username, password);
      setSuccess(`Vendedor '${username}' registrado con éxito.`);
      setUsername('');
      setPassword('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al registrar vendedor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container card">
      <h3>Registrar Nuevo Vendedor</h3>
      <p className="subtitle">Crea una cuenta con rol 'seller' para el punto de venta</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label>Nombre de Usuario</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej: vendedor1"
          />
        </div>

        <div className="form-group">
          <label>Contraseña (mínimo 8 caracteres, mayúscula, minúscula, número, especial)</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Vendedor'}
          </button>
        </div>
      </form>
    </div>
  );
};

