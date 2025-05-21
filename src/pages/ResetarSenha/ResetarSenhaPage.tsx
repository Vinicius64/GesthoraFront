import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../config/api';
import './ResetarSenhaPage.css';

const ResetarSenhaPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleResetarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(`${api.baseURL}${api.endpoints.resetPassword}`, {
        email
      });
      setSuccess('Email de recuperação enviado com sucesso!');
      setTimeout(() => {
        navigate('/confirmar-codigo', { state: { email } });
      }, 1200);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao enviar email de recuperação');
    }
  };

  return (
    <div className="resetar-senha-container">
      <div className="resetar-senha-form-container">
        <form className="resetar-senha-form" onSubmit={handleResetarSenha}>
          <h1 className="resetar-senha-title">Resetar Senha</h1>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="form-input"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="resetar-senha-button">
            Enviar Email de Recuperação
          </button>

          <div className="resetar-senha-links">
            <a href="/login" className="resetar-senha-link">
              Voltar para o login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetarSenhaPage; 