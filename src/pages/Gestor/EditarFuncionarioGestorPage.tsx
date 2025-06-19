import { useState } from 'react';
import axios from 'axios';
import { api } from '../../config/api';
import '../Gestor/DashboardsPage.css';
import './EditarFuncionarioGestorPage.css';

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

interface RegistroPonto {
  id_registro_ponto: string;
  date: string;
  status: string;
  tempoHora: number;
  tempoMinutos: number;
  motivoInconsistencia?: string;
  pontos: {
    id_ponto: string;
    data_hora: string;
    localizacao: string;
  }[];
}

interface Paginacao {
  pagina_atual: number;
  itens_por_pagina: number;
  total_registros: number;
  total_paginas: number;
  tem_proxima_pagina: boolean;
  tem_pagina_anterior: boolean;
}

const EditarFuncionarioGestorPage = () => {
  const [busca, setBusca] = useState('');
  const [funcionarios, setFuncionarios] = useState<{ id_funcionario: string, nome: string }[]>([]);
  const [funcionarioId, setFuncionarioId] = useState('');
  const [dados, setDados] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  
  const [registrosPonto, setRegistrosPonto] = useState<RegistroPonto[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [loadingPontos, setLoadingPontos] = useState(false);
  const [erroPontos, setErroPontos] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  
  // Estados para modal de pontos
  const [modalPontosAberto, setModalPontosAberto] = useState(false);
  const [pontosSelecionados, setPontosSelecionados] = useState<{ id_ponto: string; data_hora: string; localizacao: string; }[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState('');

  const handleBuscarFuncionarios = async (nome: string) => {
    setBusca(nome);
    setFuncionarioId('');
    setDados(null);
    setErro('');
    setSucesso('');
    setRegistrosPonto([]);
    setPaginacao(null);
    setErroPontos('');
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
      
      await buscarRegistrosPonto(id, 1, '');
    } catch (err: any) {
      setErro(err?.response?.data?.message || 'Erro ao buscar funcionário.');
      setDados(null);
    } finally {
      setLoading(false);
    }
  };

  const buscarRegistrosPonto = async (id: string, pagina: number = 1, statusFiltro?: string) => {
    setLoadingPontos(true);
    setErroPontos('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        pagina: pagina.toString(),
        limite: '5'
      });
      
      const statusParaFiltrar = statusFiltro !== undefined ? statusFiltro : filtroStatus;
      
      if (statusParaFiltrar && statusParaFiltrar.trim() !== '') {
        params.append('status', statusParaFiltrar);
      }
      
      const res = await axios.get(`${api.baseURL}/manager/employee/${id}/registros-ponto?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRegistrosPonto(res.data.registros_ponto || []);
      setPaginacao(res.data.paginacao);
    } catch (err: any) {
      setErroPontos(err?.response?.data?.message || 'Erro ao buscar registros de ponto.');
      setRegistrosPonto([]);
      setPaginacao(null);
    } finally {
      setLoadingPontos(false);
    }
  };

  const handleFiltroStatus = (status: string) => {
    setFiltroStatus(status);
    if (funcionarioId) {
      buscarRegistrosPonto(funcionarioId, 1, status);
    }
  };

  const handlePagina = (pagina: number) => {
    if (funcionarioId) {
      buscarRegistrosPonto(funcionarioId, pagina);
    }
  };

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarHora = (dataHora: string) => {
    const match = dataHora.match(/(\d{2}):(\d{2}):/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    return dataHora;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'FECHADO': return 'Fechado';
      case 'INCONSISTENTE': return 'Inconsistente';
      case 'AJUSTADO': return 'Ajustado';
      default: return status;
    }
  };

  const abrirModalPontos = (pontos: { id_ponto: string; data_hora: string; localizacao: string; }[], data: string) => {
    setPontosSelecionados(pontos);
    setDataSelecionada(data);
    setModalPontosAberto(true);
  };

  const fecharModalPontos = () => {
    setModalPontosAberto(false);
    setPontosSelecionados([]);
    setDataSelecionada('');
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

          {dados && (
            <div className="registros-ponto-section">
              <h2 className="registros-ponto-title">Registros de Ponto</h2>
              
              <div className="filtros-container">
                <label className="filtros-label">Filtrar por status:</label>
                <button
                  type="button"
                  className={`filtro-btn filtro-btn-todos ${filtroStatus === '' ? '' : 'inactive'}`}
                  onClick={() => handleFiltroStatus('')}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={`filtro-btn filtro-btn-fechado ${filtroStatus === 'FECHADO' ? '' : 'inactive'}`}
                  onClick={() => handleFiltroStatus('FECHADO')}
                >
                  Fechado
                </button>
                <button
                  type="button"
                  className={`filtro-btn filtro-btn-ajustado ${filtroStatus === 'AJUSTADO' ? '' : 'inactive'}`}
                  onClick={() => handleFiltroStatus('AJUSTADO')}
                >
                  Ajustado
                </button>
                <button
                  type="button"
                  className={`filtro-btn filtro-btn-inconsistente ${filtroStatus === 'INCONSISTENTE' ? '' : 'inactive'}`}
                  onClick={() => handleFiltroStatus('INCONSISTENTE')}
                >
                  Inconsistente
                </button>
              </div>

              {loadingPontos && (
                <div className="loading-pontos">
                  <p>Carregando registros de ponto...</p>
                </div>
              )}

              {erroPontos && (
                <div className="error-message error-pontos">{erroPontos}</div>
              )}

              {!loadingPontos && registrosPonto.length > 0 && (
                <>
                  <div className="tabela-container">
                    <table className="tabela-registros">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Status</th>
                          <th>Tempo Trabalhado</th>
                          <th>Pontos</th>
                          <th>Motivo Inconsistência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrosPonto.map((registro) => (
                          <tr key={registro.id_registro_ponto}>
                            <td>{formatarData(registro.date)}</td>
                            <td>
                              <span className={`status-badge status-${registro.status.toLowerCase()}`}>
                                {getStatusText(registro.status)}
                              </span>
                            </td>
                            <td>{registro.tempoHora}h {registro.tempoMinutos}min</td>
                            <td>
                              <button
                                type="button"
                                className="btn-ver-pontos"
                                onClick={() => abrirModalPontos(registro.pontos, formatarData(registro.date))}
                              >
                                Ver {registro.pontos.length} ponto{registro.pontos.length > 1 ? 's' : ''}
                              </button>
                            </td>
                            <td>{registro.motivoInconsistencia || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {paginacao && paginacao.total_paginas > 1 && (
                    <div className="paginacao-container">
                      <button
                        type="button"
                        className="botao-buscar paginacao-btn"
                        onClick={() => handlePagina(paginacao.pagina_atual - 1)}
                        disabled={!paginacao.tem_pagina_anterior}
                      >
                        Anterior
                      </button>
                      
                      <span className="paginacao-info">
                        Página {paginacao.pagina_atual} de {paginacao.total_paginas}
                      </span>
                      
                      <button
                        type="button"
                        className="botao-buscar paginacao-btn"
                        onClick={() => handlePagina(paginacao.pagina_atual + 1)}
                        disabled={!paginacao.tem_proxima_pagina}
                      >
                        Próxima
                      </button>
                    </div>
                  )}

                  {paginacao && (
                    <div className="paginacao-stats">
                      Mostrando {((paginacao.pagina_atual - 1) * paginacao.itens_por_pagina) + 1} a {Math.min(paginacao.pagina_atual * paginacao.itens_por_pagina, paginacao.total_registros)} de {paginacao.total_registros} registros
                    </div>
                  )}
                </>
              )}

              {!loadingPontos && registrosPonto.length === 0 && !erroPontos && (
                <div className="empty-state">
                  <p>Nenhum registro de ponto encontrado para este funcionário.</p>
                </div>
              )}
            </div>
          )}

          {/* Modal de Pontos */}
          {modalPontosAberto && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">
                    Pontos do dia {dataSelecionada}
                  </h3>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={fecharModalPontos}
                  >
                    ×
                  </button>
                </div>
                
                <div className="pontos-list">
                  {pontosSelecionados.map((ponto, index) => (
                    <div key={ponto.id_ponto} className="ponto-item">
                      <div className="ponto-header">
                        <strong className="ponto-numero">
                          {index + 1}º ponto
                        </strong>
                        <span className="ponto-hora">
                          {formatarHora(ponto.data_hora)}
                        </span>
                      </div>
                      {ponto.localizacao && (
                        <div className="ponto-localizacao">
                          📍 {ponto.localizacao}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-close-btn-footer"
                    onClick={fecharModalPontos}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarFuncionarioGestorPage; 