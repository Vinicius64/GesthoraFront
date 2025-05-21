import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../config/api';
import './AlterarSenhaPage.css';

const AlterarSenhaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [senhaDiferente, setSenhaDiferente] = useState(false);

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
    if (location.state?.codigo) setCodigo(location.state.codigo);
  }, [location.state]);

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSenhaDiferente(false);
    if (novaSenha !== confirmarSenha) {
      setSenhaDiferente(true);
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${api.baseURL}/employee/reset-password/update`, {
        email,
        codigo,
        novaSenha
      });
      setSuccess('Senha alterada com sucesso! Agora você pode fazer login.');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alterar-senha-container">
      <div className="alterar-senha-form-container">
        <form className="alterar-senha-form" onSubmit={handleAlterarSenha}>
          <h1 className="alterar-senha-title">Alterar Senha</h1>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="novaSenha">Nova Senha</label>
            <input
              className="form-input"
              type="password"
              id="novaSenha"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirmarSenha">Confirmar Nova Senha</label>
            <input
              className="form-input"
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              required
            />
          </div>
          {senhaDiferente && (
            <div className="error-message">As senhas não coincidem.</div>
          )}
          <button type="submit" className="alterar-senha-button" disabled={loading}>
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AlterarSenhaPage; 