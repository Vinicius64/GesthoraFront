import { useState } from 'react';
import axios from 'axios';
import { api } from '../../config/api';
import '../Gestor/DashboardsPage.css';

const campos = [
  { name: 'nome', label: 'Nome', type: 'text' },
  { name: 'telefone', label: 'Telefone', type: 'text' },
  { name: 'data_nascimento', label: 'Data de Nascimento', type: 'date' },
  { name: 'escolaridade', label: 'Escolaridade', type: 'text' },
  { name: 'genero', label: 'Gênero', type: 'text' },
  { name: 'endereco', label: 'Endereço', type: 'text' },
  { name: 'cep', label: 'CEP', type: 'text' },
  { name: 'cargo', label: 'Cargo', type: 'text' },
  { name: 'carga_horaria_diaria', label: 'Carga Horária Diária', type: 'number' },
];

const EditarFuncionarioGestorPage = () => {
  const [busca, setBusca] = useState('');
  const [funcionarios, setFuncionarios] = useState<{ id_funcionario: string, nome: string }[]>([]);
  const [funcionarioId, setFuncionarioId] = useState('');
  const [dados, setDados] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleBuscarFuncionarios = async (nome: string) => {
    setBusca(nome);
    setFuncionarioId('');
    setDados(null);
    setErro('');
    setSucesso('');
    if (!nome || nome.length < 2) {
      setFuncionarios([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api.baseURL}/manager/employees?name=${encodeURIComponent(nome)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFuncionarios(res.data.funcionarios || []);
    } catch {
      setFuncionarios([]);
    }
  };

  const handleSelectFuncionario = async (id: string) => {
    setFuncionarioId(id);
    setFuncionarios([]);
    setErro('');
    setSucesso('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api.baseURL}/manager/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let funcionario = res.data.funcionario;
      if (funcionario.data_nascimento && funcionario.data_nascimento.includes('T')) {
        funcionario.data_nascimento = funcionario.data_nascimento.split('T')[0];
      }
      setDados(funcionario);
      setEditando(false);
    } catch (err: any) {
      setErro(err?.response?.data?.message || 'Erro ao buscar funcionário.');
      setDados(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setDados((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { ...dados };
      if (payload.data_nascimento && payload.data_nascimento.length === 10 && payload.data_nascimento.includes('-')) {
        const [ano, mes, dia] = payload.data_nascimento.split('-');
        payload.data_nascimento = `${dia}/${mes}/${ano}`;
      }
      await axios.put(`${api.baseURL}/manager/employee/${funcionarioId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSucesso('Dados atualizados com sucesso!');
      setEditando(false);
    } catch (err: any) {
      setErro(err?.response?.data?.message || 'Erro ao salvar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gestor-layout">
      <div className="menu-lateral">
        <div className="cargo">Gestor</div>
        <div className="nome">Dados de funcionários</div>
        <div className="link" onClick={() => window.location.href='/solicitacoes'}>Solicitações</div>
        <div className="descricao">Gerir Abono e Ajustes</div>
        <div className="link" onClick={() => window.location.href='/dashboards'}>Dashboards</div>
        <div className="descricao">Visualizar relatórios</div>
        <div className="link ativo">Dados de funcionários</div>
        <div className="descricao">Visualizar e editar dados</div>
        <div className="link" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('perfil'); localStorage.removeItem('nome'); window.location.href='/login'; }}>Sair</div>
      </div>
      <div className="gestor-main">
        <h1 className="titulo-pagina">Dados de funcionários</h1>
        <div className="painel-gestor">
          <form className="form-relatorio" autoComplete="off" onSubmit={e => e.preventDefault()}>
            <div className="form-group funcionario-autocomplete">
              <label>Buscar funcionário</label>
              <input
                type="text"
                value={busca}
                onChange={e => handleBuscarFuncionarios(e.target.value)}
                placeholder="Digite o nome do funcionário"
                autoComplete="off"
                disabled={loading}
              />
              {funcionarios.length > 0 && (
                <ul className="autocomplete-list">
                  {funcionarios.map(f => (
                    <li key={f.id_funcionario} onClick={() => handleSelectFuncionario(f.id_funcionario)}>
                      {f.nome}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
          {erro && <div className="error-message">{erro}</div>}
          {dados && (
            !editando ? (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
                  {campos.map(campo => (
                    <div className="form-group" key={campo.name} style={{ minWidth: 220, flex: '1 1 220px' }}>
                      <label>{campo.label}</label>
                      <input
                        type={campo.type}
                        name={campo.name}
                        value={dados[campo.name] || ''}
                        disabled
                      />
                    </div>
                  ))}
                  <div className="form-group" style={{ minWidth: 120, flex: '1 1 120px', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ textAlign: 'center', width: '100%' }}>Ativo</label>
                    <span style={{ fontSize: 24 }} title={dados.ativo ? 'Ativo' : 'Inativo'}>{dados.ativo ? '🟢' : '⚪'}</span>
                  </div>
                </div>
                <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                  <button type="button" className="botao-buscar" onClick={() => setEditando(true)} disabled={loading}>Editar</button>
                </div>
                {sucesso && <div className="success-message" style={{ marginTop: 16 }}>{sucesso}</div>}
                {erro && <div className="error-message" style={{ marginTop: 16 }}>{erro}</div>}
              </>
            ) : (
              <form className="form-relatorio" onSubmit={handleSalvar} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
                  {campos.map(campo => (
                    <div className="form-group" key={campo.name} style={{ minWidth: 220, flex: '1 1 220px' }}>
                      <label>{campo.label}</label>
                      <input
                        type={campo.type}
                        name={campo.name}
                        value={dados[campo.name] || ''}
                        onChange={handleChange}
                        disabled={loading ? true : false}
                      />
                    </div>
                  ))}
                  <div className="form-group" style={{ minWidth: 120, flex: '1 1 120px', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ textAlign: 'center', width: '100%' }}>Ativo</label>
                    <button
                      type="button"
                      style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                      onClick={() => setDados((prev: any) => ({ ...prev, ativo: !prev.ativo }))}
                      disabled={loading}
                      title={dados.ativo ? 'Ativo' : 'Inativo'}
                    >
                      {dados.ativo ? '🟢' : '⚪'}
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                  <button type="submit" className="botao-buscar" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
                  <button type="button" className="botao-buscar" style={{ background: '#aaa' }} onClick={() => { setEditando(false); handleSelectFuncionario(funcionarioId); }} disabled={loading}>Cancelar</button>
                </div>
                {sucesso && <div className="success-message" style={{ marginTop: 16 }}>{sucesso}</div>}
                {erro && <div className="error-message" style={{ marginTop: 16 }}>{erro}</div>}
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarFuncionarioGestorPage; 