import { useState } from 'react';
import axios from 'axios';
import { Box, Button, Link, TextField, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${api.baseURL}${api.endpoints.login}`, { email, senha });
      setSuccess('Login realizado com sucesso!');
      localStorage.setItem('token', response.data.token);
      if (response.data.role === 'funcionario') {
        navigate('/baterponto');
      } else if (response.data.role === 'admin') {
        navigate('/criar-usuario');
      } else if (response.data.role === 'gestor') {
        navigate('/solicitacoes');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof (err.response.data as { message?: string }).message === 'string'
      ) {
        setError((err.response.data as { message: string }).message || 'Erro ao fazer login');
      } else {
        setError('Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: '#111',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: '#3de6d1',
          fontWeight: 700,
          mb: 4,
          textAlign: 'center',
        }}
      >
        GestHora
      </Typography>
      <Paper
        elevation={6}
        sx={{
          bgcolor: '#181818',
          p: 4,
          borderRadius: 3,
          minWidth: 350,
          maxWidth: '90vw',
        }}
      >
        <Typography variant="h5" sx={{ color: '#fff', mb: 3, textAlign: 'center' }}>
          Boas-vindas!
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Login"
            variant="filled"
            fullWidth
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2, bgcolor: '#111', input: { color: '#fff' }, label: { color: '#aaa' } }}
            InputProps={{ style: { color: '#fff' } }}
          />
          <TextField
            label="Senha"
            type="password"
            variant="filled"
            fullWidth
            value={senha}
            onChange={e => setSenha(e.target.value)}
            sx={{ mb: 1, bgcolor: '#111', input: { color: '#fff' }, label: { color: '#aaa' } }}
            InputProps={{ style: { color: '#fff' } }}
          />
          <Link
            component="button"
            underline="hover"
            sx={{ color: '#3de6d1', fontSize: 14, mb: 2, display: 'block' }}
            onClick={() => navigate('/resetar-senha', { state: { email } })}
          >
            Esqueceu sua senha?
          </Link>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              bgcolor: '#3de6d1',
              color: '#111',
              fontWeight: 700,
              '&:hover': { bgcolor: '#2bc9b6' },
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage; 