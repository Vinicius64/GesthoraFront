import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../config/api';
import './ConfirmarCodigoPage.css';

const ConfirmarCodigoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      await axios.post(`${api.baseURL}/employee/reset-password/confirm-code`, {
        email,
        codigo
      });
      setSuccess('Código confirmado com sucesso! Agora você pode redefinir sua senha.');
      setTimeout(() => {
        navigate('/alterar-senha', { state: { email, codigo } });
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao confirmar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="confirmar-codigo-container">
      <div className="confirmar-codigo-form-container">
        <form className="confirmar-codigo-form" onSubmit={handleConfirmar}>
          <h1 className="confirmar-codigo-title">Confirmar Código</h1>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="form-input"
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              readOnly
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="codigo">Código</label>
            <input
              className="form-input"
              type="text"
              id="codigo"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="confirmar-codigo-button" disabled={loading}>
            {loading ? 'Confirmando...' : 'Confirmar Código'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmarCodigoPage; 