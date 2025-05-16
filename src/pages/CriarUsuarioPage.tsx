import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Autocomplete,
  Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { api } from '../config/api';

const tiposUsuario = [
  { value: 'funcionario', label: 'Funcionário' },
  { value: 'gestor', label: 'Gestor' },
];

const generos = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
];

const diasSemana = [
  { value: 'seg', label: 'Seg' },
  { value: 'ter', label: 'Ter' },
  { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' },
  { value: 'sex', label: 'Sex' },
  { value: 'sab', label: 'Sab' },
  { value: 'dom', label: 'Dom' },
];

const CriarUsuarioPage = () => {
  const [form, setForm] = useState<{
    nome: string;
    email: string;
    senha: string;
    cargo: string;
    telefone: string;
    cpf: string;
    tipoUsuario: string;
    escolaridade: string;
    genero: string;
    cep: string;
    endereco: string;
    empresa: string;
    dataNascimento: string;
    cargaHoraria: string;
    dias: string[];
  }>({
    nome: '',
    email: '',
    senha: '',
    cargo: '',
    telefone: '',
    cpf: '',
    tipoUsuario: '',
    escolaridade: '',
    genero: '',
    cep: '',
    endereco: '',
    empresa: '',
    dataNascimento: '',
    cargaHoraria: '',
    dias: [],
  });

  const [adminNome, setAdminNome] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [empresas, setEmpresas] = useState<{ id_empresa: string; nome: string }[]>([]);
  const [empresaInput, setEmpresaInput] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState<{ id_empresa: string; nome: string } | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get(`${api.baseURL}${api.endpoints.adminProfile}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminNome(response.data.admin.nome);
      } catch {
        setAdminNome('Administrador');
      }
    };
    fetchAdmin();
  }, []);

  // Buscar empresas conforme o usuário digita
  useEffect(() => {
    const buscarEmpresas = async () => {
      if (!empresaInput) return setEmpresas([]);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${api.baseURL}${api.endpoints.companies}?nome=${empresaInput}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmpresas(response.data.empresas);
      } catch {
        setEmpresas([]);
      }
    };
    const delayDebounce = setTimeout(buscarEmpresas, 400);
    return () => clearTimeout(delayDebounce);
  }, [empresaInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDiasChange = (dia: string) => {
    setForm((prev) => ({
      ...prev,
      dias: prev.dias.includes(dia)
        ? prev.dias.filter((d) => d !== dia)
        : [...prev.dias, dia],
    }));
  };

  const formatarDataParaISO = (data: string) => {
    if (!data) return '';
    // Aceita formatos DD/MM/YYYY ou DD-MM-YYYY
    const partes = data.includes('/') ? data.split('/') : data.split('-');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return data; // Se já estiver no formato ISO
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');
      const payload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        telefone: form.telefone,
        cpf: form.cpf,
        data_nascimento: formatarDataParaISO(form.dataNascimento),
        escolaridade: form.escolaridade,
        genero: form.genero,
        endereco: form.endereco,
        cep: form.cep,
        cargo: form.cargo,
        ativo: true,
        empresa_id: form.empresa,
        tipo_usuario: form.tipoUsuario,
      } as Record<string, unknown>;
      if (form.tipoUsuario === 'funcionario') {
        if (form.dias && form.dias.length > 0) {
          payload.dias_semana = form.dias;
        }
        payload.carga_horaria = form.cargaHoraria;
      }
      await axios.post(`${api.baseURL}${api.endpoints.createUser}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setSuccess('Usuário criado com sucesso!');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data && typeof (err.response.data as { message?: string }).message === 'string') {
        setError((err.response.data as { message: string }).message || 'Erro ao criar usuário');
      } else {
        setError('Erro ao criar usuário');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111', display: 'flex' }}>
      {/* Menu lateral atualizado */}
      <Box sx={{ width: 240, bgcolor: '#3de6d1', p: 2, borderRadius: 3, m: 2, height: 'fit-content' }}>
        <Typography variant="caption" sx={{ color: '#0b4c4c', fontWeight: 700, fontSize: 13 }}>Administrador</Typography>
        <Typography variant="subtitle1" sx={{ color: '#111', fontWeight: 700, mb: 2, fontSize: 18 }}>{adminNome}</Typography>
        {/* Criar Usuários */}
        <Typography
          variant="body1"
          sx={{ color: location.pathname === '/criar-usuario' ? '#111' : '#005555', fontWeight: location.pathname === '/criar-usuario' ? 700 : 500, cursor: 'pointer', mb: 0, fontSize: 16 }}
          onClick={() => navigate('/criar-usuario')}
        >Criar Usuários</Typography>
        <Typography variant="caption" sx={{ color: '#1e8888', ml: 1, mb: 1, display: 'block', fontSize: 13 }}>Adicionar Usuários</Typography>
        {/* Editar Usuários */}
        <Typography
          variant="body1"
          sx={{ color: location.pathname === '/editar-usuarios' ? '#111' : '#005555', fontWeight: location.pathname === '/editar-usuarios' ? 700 : 500, cursor: 'pointer', mb: 0, fontSize: 16 }}
          onClick={() => navigate('/editar-usuarios')}
        >Editar Usuários</Typography>
        <Typography variant="caption" sx={{ color: '#1e8888', ml: 1, mb: 1, display: 'block', fontSize: 13 }}>Altera informações de Usuários</Typography>
        {/* Gerenciar Empresa */}
        <Typography
          variant="body1"
          sx={{ color: location.pathname === '/gerenciar-empresa' ? '#111' : '#005555', fontWeight: location.pathname === '/gerenciar-empresa' ? 700 : 500, cursor: 'pointer', mb: 0, fontSize: 16 }}
          onClick={() => navigate('/gerenciar-empresa')}
        >Gerenciar Empresa</Typography>
        <Typography variant="caption" sx={{ color: '#1e8888', ml: 1, mb: 1, display: 'block', fontSize: 13 }}>Gerência empresas</Typography>
        {/* Sair */}
        <Typography
          variant="body1"
          sx={{ color: '#111', mt: 2, cursor: 'pointer', fontWeight: 500, fontSize: 16 }}
          onClick={logout}
        >Sair</Typography>
      </Box>
      {/* Conteúdo principal */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography
          variant="h3"
          sx={{ color: '#fff', mb: 4, textAlign: 'center' }}
        >
          Criar Usuários
        </Typography>
        <Paper
          elevation={6}
          sx={{
            bgcolor: '#3de6d1',
            p: 4,
            borderRadius: 3,
            minWidth: 800,
            maxWidth: 1000,
            width: '100%',
          }}
        >
          <form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}>
              <TextField label="Nome" name="nome" value={form.nome} onChange={handleChange} fullWidth sx={{ bgcolor: '#eaeaea' }} />
              <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth sx={{ bgcolor: '#eaeaea' }} />
              <TextField label="Senha" name="senha" type="password" value={form.senha} onChange={handleChange} fullWidth sx={{ bgcolor: '#eaeaea' }} />
              <TextField label="Cargo" name="cargo" value={form.cargo} onChange={handleChange} fullWidth sx={{ bgcolor: '#eaeaea' }} />
              <TextField label="Número de Telefone" name="telefone" value={form.telefone} onChange={handleChange} fullWidth sx={{ bgcolor: '#eaeaea' }} />
              <TextField label="CPF" name="cpf" value={form.cpf} onChange={handleChange} fullWidth sx={{ bgcolor: '#eaeaea' }} />
              <TextField label="Tipo de Usuário" name="tipoUsuario" value={form.tipoUsuario} onChange={handleSelectChange} select fullWidth sx={{ bgcolor: '#eaeaea' }}>
                {tiposUsuario.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
              <TextField label="Escolaridade" name="escolaridade" value={form.escolaridade} onChange={handleChange} fullWidth sx={{ bgcolor: '#eaeaea' }} />
              <TextField label="Gênero" name="genero" value={form.genero} onChange={handleSelectChange} select fullWidth sx={{ bgcolor: '#eaeaea' }}>
                {generos.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
              <TextField label="CEP" name="cep" value={form.cep} onChange={handleChange} fullWidth sx={{ bgcolor: '#eaeaea' }} />
              <TextField label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} fullWidth sx={{ bgcolor: '#eaeaea' }} />
              <Autocomplete
                inputValue={empresaInput}
                value={empresaSelecionada}
                options={empresas}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.nome}
                onInputChange={(_, newInputValue) => setEmpresaInput(newInputValue)}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') {
                    setEmpresaSelecionada(newValue);
                    setForm({ ...form, empresa: newValue.id_empresa });
                  } else {
                    setEmpresaSelecionada(null);
                    setForm({ ...form, empresa: '' });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Busque uma empresa"
                    fullWidth
                    sx={{ bgcolor: '#eaeaea' }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id_empresa === value?.id_empresa}
              />
              <TextField label="Data de Nascimento" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} fullWidth placeholder="XX/XX/XXXX" sx={{ bgcolor: '#eaeaea' }} />
              {form.tipoUsuario === 'funcionario' && (
                <TextField label="Carga Horária" name="cargaHoraria" value={form.cargaHoraria} onChange={handleChange} fullWidth sx={{ bgcolor: '#eaeaea' }} />
              )}
            </Box>
            {form.tipoUsuario === 'funcionario' && (
              <FormGroup row sx={{ mt: 3, justifyContent: 'center' }}>
                {diasSemana.map((dia) => (
                  <FormControlLabel
                    key={dia.value}
                    control={
                      <Checkbox
                        checked={form.dias.includes(dia.value)}
                        onChange={() => handleDiasChange(dia.value)}
                      />
                    }
                    label={dia.label}
                  />
                ))}
              </FormGroup>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, bgcolor: '#111', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#222' } }}
            >
              Salvar
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default CriarUsuarioPage; 