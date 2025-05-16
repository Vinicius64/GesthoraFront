import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../config/api';

// Definição de campos
const campos = [
  { label: 'Nome', key: 'nome' },
  { label: 'Email', key: 'email' },
  { label: 'Endereço', key: 'endereco' },
  { label: 'Número de Telefone', key: 'telefone' },
  { label: 'CPF', key: 'cpf' },
  { label: 'Escolaridade', key: 'escolaridade' },
  { label: 'CEP', key: 'cep' },
  { label: 'Gênero', key: 'genero' },
  { label: 'Data de Nascimento', key: 'data_nascimento' },
  { label: 'Cargo', key: 'cargo' },
  { label: 'Carga Horária Diária', key: 'carga_horaria_diaria' },
];

function formatarData(data: string) {
  if (!data) return '';
  const d = new Date(data);
  if (isNaN(d.getTime())) return data;
  return d.toLocaleDateString('pt-BR');
}

export default function UsuarioPage() {
  const [usuario, setUsuario] = useState<{ [key: string]: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get(`${api.baseURL}${api.endpoints.employeeProfile}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsuario(response.data.user);
      } catch {
        setUsuario(null);
      }
    };
    fetchUsuario();
  }, []);

  if (!usuario) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#111' }}>
        <Typography sx={{ color: '#fff' }}>Carregando...</Typography>
      </Box>
    );
  }

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111', display: 'flex' }}>
      {/* Menu lateral */}
      <Box sx={{ width: 220, bgcolor: '#3de6d1', p: 2, borderRadius: 3, m: 2, height: 'fit-content' }}>
        {usuario.cargo && (
          <Typography variant="subtitle2" sx={{ color: '#111', fontWeight: 700 }}>{usuario.cargo}</Typography>
        )}
        <Typography variant="subtitle1" sx={{ color: '#111', fontWeight: 700 }}>{usuario.nome}</Typography>
        <Typography
          variant="body2"
          sx={{ color: '#111', mt: 1, cursor: 'pointer', fontWeight: location.pathname === '/dados' ? 700 : 400 }}
          onClick={() => navigate('/dados')}
        >Usuário</Typography>
        <Typography variant="caption" sx={{ color: '#1e8888', display: 'block', ml: 1 }}>
          Ver meus dados de usuário.
        </Typography>
        <Typography variant="body2" sx={{ color: '#111', mt: 1, cursor: 'pointer' }}>Meus pontos</Typography>
        <Typography variant="caption" sx={{ color: '#1e8888', display: 'block', ml: 1 }}>
          Ver pontos/carga horária.
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#111', mt: 1, cursor: 'pointer', fontWeight: location.pathname === '/baterponto' ? 700 : 400 }}
          onClick={() => navigate('/baterponto')}
        >Bater Ponto</Typography>
        <Typography variant="caption" sx={{ color: '#1e8888', display: 'block', ml: 1 }}>
          Marcar horário
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#111', mt: 2, cursor: 'pointer' }}
          onClick={logout}
        >Sair</Typography>
      </Box>

      {/* Conteúdo principal */}
      <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" sx={{ color: '#fff', mb: 4, fontWeight: 700, textAlign: 'center' }}>
          Dados de Usuário
        </Typography>
        <Paper sx={{ bgcolor: '#3de6d1', p: 4, borderRadius: 3, width: '100%', maxWidth: 800 }}>
          <Grid container spacing={3}>
            {campos.map((campo) => (
              <Grid item xs={12} md={6} key={campo.key}>
                <Typography variant="subtitle2" sx={{ color: '#222', fontWeight: 700, mb: 0.5 }}>
                  {campo.label}
                </Typography>
                <TextField
                  value={campo.key === 'data_nascimento' ? formatarData(usuario[campo.key]) : usuario[campo.key] || ''}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    style: {
                      background: '#e5e5e5',
                      fontSize: 20,
                      fontWeight: 500,
                      minHeight: 70,
                      minWidth: 350,
                    }
                  }}
                  variant="outlined"
                  sx={{ mb: 0 }}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}