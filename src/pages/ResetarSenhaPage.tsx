import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

const ResetarSenhaPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromLogin = (location.state as { email?: string })?.email || '';
  const [email, setEmail] = useState(emailFromLogin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode chamar a API para enviar o código
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
        SeuPonto
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
          Resetar senha
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Informe o e-mail"
            variant="filled"
            fullWidth
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 3, bgcolor: '#111', input: { color: '#fff' }, label: { color: '#aaa' } }}
            InputProps={{ style: { color: '#fff' } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mb: 2,
              bgcolor: '#3de6d1',
              color: '#111',
              fontWeight: 700,
              '&:hover': { bgcolor: '#2bc9b6' },
            }}
          >
            Enviar código
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: '#3de6d1',
              color: '#111',
              fontWeight: 700,
              '&:hover': { bgcolor: '#2bc9b6' },
            }}
          >
            Voltar
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetarSenhaPage; 