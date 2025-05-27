import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../config/api';
import './CriarUsuarioPage.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

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
    const { name, value } = e.target;
    if (name === 'cep') {
      setForm({ ...form, cep: formatarCEP(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
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
    
    const partes = data.includes('/') ? data.split('/') : data.split('-');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return data; 
  };

  function formatarCPF(valor: string) {
    return valor
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function limparCPF(valor: string) {
    return valor.replace(/\D/g, '').slice(0, 11);
  }

  function formatarTelefone(valor: string) {
    valor = valor.replace(/\D/g, '').slice(0, 11);
    if (valor.length <= 10) {
      return valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else {
      return valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
  }

  function paraInputDate(data: string) {
    if (!data) return '';
    if (data.includes('/')) {
      const [dia, mes, ano] = data.split('/');
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    if (data.includes('T')) {
      return data.split('T')[0];
    }
    return data;
  }

  function paraDDMMAAAA(data: string) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function formatarCEP(valor: string) {
    return valor.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{0,3})/, (m, p1, p2) => p2 ? `${p1}-${p2}` : p1);
  }

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
        cpf: limparCPF(form.cpf),
        data_nascimento: paraDDMMAAAA(form.dataNascimento),
        escolaridade: form.escolaridade,
        genero: form.genero,
        endereco: form.endereco,
        cep: form.cep.replace(/\D/g, ''),
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
    <div className="criar-usuario-container">
      <div className="menu-lateral">
        <div className="cargo">Administrador</div>
        <div className="nome">{adminNome}</div>
        <div className="link" onClick={() => navigate('/criar-usuario')}>Criar Usuários</div>
        <div className="descricao">Adicionar Usuários</div>
        <div className="link" onClick={() => navigate('/editar-usuario')}>Editar Usuários</div>
        <div className="descricao">Altera informações de Usuários</div>
        <div className="link" onClick={() => navigate('/gerenciar-empresa')}>Gerenciar Empresa</div>
        <div className="descricao">Gerência empresas</div>
        <div className="link" onClick={logout}>Sair</div>
      </div>
      <div className="conteudo-principal">
        <h1 className="titulo-pagina">Criar Usuários</h1>
        <form className="formulario-usuario" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <div className="form-grid-duas-colunas">
            <div className="form-group col-span-2">
              <label className="form-label" htmlFor="nome">Nome</label>
              <input className="form-input" type="text" id="nome" name="nome" value={form.nome} onChange={handleChange} required maxLength={55} />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label" htmlFor="email">Email</label>
              <input className="form-input" type="email" id="email" name="email" value={form.email} onChange={handleChange} required maxLength={55} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="senha">Senha</label>
              <input className="form-input" type="password" id="senha" name="senha" value={form.senha} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cargo">Cargo</label>
              <input className="form-input" type="text" id="cargo" name="cargo" value={form.cargo} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="telefone">Telefone</label>
              <input className="form-input" type="text" id="telefone" name="telefone" value={formatarTelefone(form.telefone)} onChange={e => setForm({ ...form, telefone: formatarTelefone(e.target.value) })} maxLength={15} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cpf">CPF</label>
              <input className="form-input" type="text" id="cpf" name="cpf" value={formatarCPF(form.cpf)} onChange={e => setForm({ ...form, cpf: limparCPF(e.target.value) })} maxLength={14} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tipoUsuario">Tipo de Usuário</label>
              <select className="form-select" id="tipoUsuario" name="tipoUsuario" value={form.tipoUsuario} onChange={e => setForm({ ...form, tipoUsuario: e.target.value })} required>
                <option value="">Selecione</option>
                {tiposUsuario.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="escolaridade">Escolaridade</label>
              <input className="form-input" type="text" id="escolaridade" name="escolaridade" value={form.escolaridade} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="genero">Gênero</label>
              <select className="form-select" id="genero" name="genero" value={form.genero} onChange={e => setForm({ ...form, genero: e.target.value })} required>
                <option value="">Selecione</option>
                {generos.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cep">CEP</label>
              <input className="form-input" type="text" id="cep" name="cep" value={form.cep} onChange={handleChange} />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label" htmlFor="endereco">Endereço</label>
              <input className="form-input" type="text" id="endereco" name="endereco" value={form.endereco} onChange={handleChange} maxLength={55} />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label" htmlFor="empresa">Empresa</label>
              <Autocomplete
                id="empresa"
                options={empresas}
                getOptionLabel={(option) => option.nome || ''}
                inputValue={empresaInput}
                value={empresas.find(e => e.id_empresa === form.empresa) || null}
                onInputChange={(_, newInputValue) => setEmpresaInput(newInputValue)}
                onChange={(_, newValue) => {
                  setForm({ ...form, empresa: newValue ? newValue.id_empresa : '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Busque uma empresa"
                    variant="outlined"
                    required
                    className="form-input"
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id_empresa === value?.id_empresa}
                noOptionsText="Nenhuma empresa encontrada"
                clearOnBlur={false}
                blurOnSelect
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="dataNascimento">Data de Nascimento</label>
              <input className="form-input" type="date" id="dataNascimento" name="dataNascimento" value={paraInputDate(form.dataNascimento)} onChange={e => setForm({ ...form, dataNascimento: e.target.value })} />
            </div>
            {form.tipoUsuario === 'funcionario' && (
              <>
                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="cargaHoraria">Carga Horária</label>
                  <input className="form-input" type="text" id="cargaHoraria" name="cargaHoraria" value={form.cargaHoraria} onChange={handleChange} />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Dias da Semana</label>
                  <div className="dias-semana">
                    {diasSemana.map((dia) => (
                      <label key={dia.value} className="dia-checkbox">
                        <input
                          type="checkbox"
                          checked={form.dias.includes(dia.value)}
                          onChange={() => handleDiasChange(dia.value)}
                        />
                        {dia.label}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <button type="submit" className="botao-criar">Salvar</button>
        </form>
      </div>
    </div>
  );
};

export default CriarUsuarioPage; 