import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../config/api';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${api.baseURL}${api.endpoints.login}`, {
        email,
        senha
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setSuccess('Login realizado com sucesso!');
        const perfil = response.data.role;
        if (perfil) localStorage.setItem('perfil', perfil.toLowerCase());
        if (perfil && perfil.toLowerCase().includes('admin')) {
          navigate('/criar-usuario');
        } else if (perfil && perfil.toLowerCase().includes('gestor')) {
          console.log('Redirecionando gestor para /solicitacoes');
          navigate('/solicitacoes');
        } else {
          navigate('/bater-ponto');
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1 className="login-title">Login</h1>
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
        <div className="form-group">
          <label className="form-label" htmlFor="senha">Senha</label>
          <input
            className="form-input"
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          Entrar
        </button>
        <div className="login-links">
          <a href="/resetar-senha" className="login-link">
            Esqueceu sua senha?
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage; 