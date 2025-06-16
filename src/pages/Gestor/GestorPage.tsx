import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../config/api';
import { toGMT3DateString } from '../../sources/dateUtils';
import './GestorPage.css';

const SolicitacoesPage = () => {
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [solicitacaoVisualizar, setSolicitacaoVisualizar] = useState<any>(null);
  const [loadingVisualizar, setLoadingVisualizar] = useState(false);
  const [erroVisualizar, setErroVisualizar] = useState('');
  const [modalJustificativa, setModalJustificativa] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [idRecusar, setIdRecusar] = useState<number|null>(null);
  const [enviandoAceitar, setEnviandoAceitar] = useState<number|null>(null);
  const [enviandoRecusar, setEnviandoRecusar] = useState<number|null>(null);
  const [mensagemAcao, setMensagemAcao] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const perfil = localStorage.getItem('perfil');
    if (!token || perfil !== 'gestor') {
      navigate('/login');
    }
  }, [navigate]);

  const fetchSolicitacoes = async () => {
    setLoading(true);
    setErro('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api.baseURL}/manager/solicitacoes-pendentes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitacoes(res.data.solicitacoes || []);
    } catch (err) {
      setErro('Erro ao buscar solicitações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const nome = localStorage.getItem('nome') || 'Gestor';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
    localStorage.removeItem('nome');
    navigate('/login');
  };

  const handleVisualizarSolicitacao = async (id: number) => {
    setModalVisualizar(true);
    setLoadingVisualizar(true);
    setErroVisualizar('');
    setSolicitacaoVisualizar(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api.baseURL}/manager/solicitacao/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitacaoVisualizar(res.data.solicitacao);
    } catch (err: any) {
      setErroVisualizar(err?.response?.data?.message || 'Erro ao buscar solicitação.');
    } finally {
      setLoadingVisualizar(false);
    }
  };

  // Função para download autenticado do documento
  const handleDownloadDocumento = async (filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${api.baseURL}/manager/documento/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('perfil');
        localStorage.removeItem('nome');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) {
        // Tenta ler a mensagem de erro
        try {
          const data = await response.json();
          if (data && data.message && data.message.includes('Token inválido')) {
            localStorage.removeItem('token');
            localStorage.removeItem('perfil');
            localStorage.removeItem('nome');
            window.location.href = '/login';
            return;
          }
        } catch {}
        throw new Error('Erro ao baixar arquivo');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao baixar arquivo.');
    }
  };

  const handleAceitar = async (sol: any) => {
    setEnviandoAceitar(sol.id_solicitacao);
    setMensagemAcao('');
    try {
      const token = localStorage.getItem('token');
      console.log('Aceitando solicitação:', { id: sol.id_solicitacao, tipo: sol.tipo });
      
      if (sol.tipo === 'ajuste') {
        // Buscar detalhes para pegar pontos de ajuste
        console.log('Buscando detalhes do ajuste...');
        const res = await axios.get(`${api.baseURL}/manager/solicitacao/${sol.id_solicitacao}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Detalhes do ajuste:', res.data);
        const pontos = res.data?.solicitacao?.ajustes?.[0]?.pontos_ajuste || [];
        console.log('Enviando pontos de ajuste:', pontos);
        const ajusteRes = await axios.put(`${api.baseURL}/manager/solicitacao/${sol.id_solicitacao}/ajuste`, { pontos }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Resposta do ajuste:', ajusteRes.data);
      } else {
        // Qualquer outro tipo é considerado abono (falta_justificada, atestado, banco_horas, outro)
        console.log('Enviando aprovação de abono...');
        const abonoRes = await axios.put(`${api.baseURL}/manager/solicitacao/${sol.id_solicitacao}/abono`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Resposta do abono:', abonoRes.data);
      }
      setMensagemAcao('Solicitação aprovada com sucesso!');
      fetchSolicitacoes();
    } catch (err: any) {
      console.error('Erro ao aprovar solicitação:', err);
      console.error('Detalhes do erro:', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message
      });
      setMensagemAcao(err?.response?.data?.error || 'Erro ao aprovar solicitação.');
    } finally {
      setEnviandoAceitar(null);
    }
  };

  const handleAbrirRecusar = (id: number) => {
    setIdRecusar(id);
    setJustificativa('');
    setModalJustificativa(true);
    setMensagemAcao('');
  };

  const handleRecusar = async () => {
    if (!idRecusar) return;
    setEnviandoRecusar(idRecusar);
    setMensagemAcao('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${api.baseURL}/manager/solicitacao/${idRecusar}/rejeitar`, { justificativa }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensagemAcao('Solicitação recusada com sucesso!');
      setModalJustificativa(false);
      fetchSolicitacoes();
    } catch (err: any) {
      setMensagemAcao(err?.response?.data?.error || 'Erro ao recusar solicitação.');
    } finally {
      setEnviandoRecusar(null);
    }
  };

  const registroPonto = solicitacaoVisualizar?.registroPonto;
  let entrada = '--:--';
  let saida = '--:--';
  let horasExtras = '--:--';
  let horasFaltantes = '--:--';
  if (registroPonto && registroPonto.pontos && registroPonto.pontos.length > 0) {
    entrada = registroPonto.pontos[0].data_hora.substring(11, 16);
    saida = registroPonto.pontos[registroPonto.pontos.length - 1].data_hora.substring(11, 16);
  }
  if (registroPonto) {
    if (registroPonto.horas_extras !== undefined) {
      horasExtras = registroPonto.horas_extras;
    } else if (registroPonto.tempoHora !== undefined && registroPonto.tempoMinutos !== undefined) {
      horasExtras = `${registroPonto.tempoHora.toString().padStart(2, '0')}:${registroPonto.tempoMinutos.toString().padStart(2, '0')}`;
    }
    if (registroPonto.horas_faltantes !== undefined) {
      horasFaltantes = registroPonto.horas_faltantes;
    }
  }

  return (
    <div className="gestor-container">
      <div className="menu-lateral">
        <div className="cargo">Gestor</div>
        <div className="nome">{nome}</div>
        <div className="link ativo">Solicitações</div>
        <div className="descricao">Gerir Abono e Ajustes</div>
        <div className="link" onClick={() => navigate('/dashboards')}>Dashboards</div>
        <div className="descricao">Visualizar relatórios</div>
        <div className={`link${location.pathname === '/dados-funcionarios' ? ' ativo' : ''}`} onClick={() => navigate('/dados-funcionarios')}>Dados de funcionários</div>
        <div className="descricao">Visualizar e editar dados</div>
        <div className="link" onClick={logout}>Sair</div>
      </div>
      <div className="conteudo-principal">
        <h1 className="titulo-pagina">Solicitações</h1>
        <div className="painel-gestor">
          {loading ? (
            <div style={{ textAlign: 'center', color: '#888', fontSize: '1.1rem', marginTop: 24 }}>Carregando...</div>
          ) : erro ? (
            <div style={{ textAlign: 'center', color: 'red', fontSize: '1.1rem', marginTop: 24 }}>{erro}</div>
          ) : solicitacoes.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', fontSize: '1.1rem', marginTop: 24 }}>
              Nenhuma solicitação encontrada.
            </div>
          ) : (
            <table className="tabela-solicitacoes" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Funcionário</th>
                  <th>Status</th>
                  <th>Tipo de solicitação</th>
                  <th>Aceitar</th>
                  <th>Recusar</th>
                  <th>Visualizar</th>
                </tr>
              </thead>
              <tbody>
                {solicitacoes.map((sol) => (
                  <tr key={sol.id_solicitacao} style={{ background: '#222', color: '#fff', borderRadius: 12, marginBottom: 8 }}>
                    <td>{new Date(sol.data_solicitacao).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</td>
                    <td>{sol.funcionario?.nome || '-'}</td>
                    <td>{sol.status}</td>
                    <td>{sol.tipo}</td>
                    <td style={{ textAlign: 'center' }}>
                      {enviandoAceitar === sol.id_solicitacao ? (
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Processando...</div>
                      ) : (
                        <button 
                          title="Aceitar" 
                          onClick={() => handleAceitar(sol)} 
                          disabled={enviandoAceitar !== null || enviandoRecusar !== null}
                        >✔️</button>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {enviandoRecusar === sol.id_solicitacao ? (
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Processando...</div>
                      ) : (
                        <button 
                          title="Recusar" 
                          onClick={() => handleAbrirRecusar(sol.id_solicitacao)} 
                          disabled={enviandoAceitar !== null || enviandoRecusar !== null}
                        >&#10006;</button>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        title="Visualizar" 
                        onClick={() => handleVisualizarSolicitacao(sol.id_solicitacao)} 
                        disabled={enviandoAceitar !== null || enviandoRecusar !== null}
                      >
                        <span role="img" aria-label="visualizar">&#128065;</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modalVisualizar && (
        <div className="modal-abono-overlay">
          <div className="modal-abono modal-visualizar-registro" style={{ minWidth: 380, maxWidth: 520 }}>
            <h2 className="modal-bloco-titulo">Detalhes da Solicitação</h2>
            {loadingVisualizar ? (
              <div style={{ textAlign: 'center', padding: '18px' }}>Carregando...</div>
            ) : erroVisualizar ? (
              <div className="modal-mensagem" style={{ color: 'red' }}>{erroVisualizar}</div>
            ) : solicitacaoVisualizar ? (
              <div>
                {/* Bloco superior: Funcionário, Tipo, Status, Data */}
                <div className="modal-bloco-info">
                  <div>
                    <span className="modal-bloco-label">Funcionário</span>
                    <span className="modal-bloco-valor">{solicitacaoVisualizar.funcionario?.nome}</span>
                  </div>
                  <div>
                    <span className="modal-bloco-label">Tipo</span>
                    <span className="modal-bloco-valor">{solicitacaoVisualizar.tipo.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="modal-bloco-label">Status</span>
                    <span className="modal-bloco-valor">{solicitacaoVisualizar.status}</span>
                  </div>
                  <div>
                    <span className="modal-bloco-label">Data solicitação</span>
                    <span className="modal-bloco-valor">{solicitacaoVisualizar.data_solicitacao ? (() => { const [y, m, d] = solicitacaoVisualizar.data_solicitacao.substring(0, 10).split('-'); return `${d}/${m}/${y}`; })() : '--'}</span>
                  </div>
                </div>

                <div className="modal-bloco-titulo-sec">Motivo:</div>
                <div className="modal-bloco-valor" style={{ marginBottom: 12 }}>{solicitacaoVisualizar.motivo}</div>

                {solicitacaoVisualizar.registroPonto && (
                  <div className="modal-bloco">
                    <div className="modal-bloco-titulo-sec">Registro de Ponto</div>
                    <div>Data: {solicitacaoVisualizar.registroPonto.date ? (() => { const [y, m, d] = solicitacaoVisualizar.registroPonto.date.substring(0, 10).split('-'); return `${d}/${m}/${y}`; })() : '--'}</div>
                    <div>Entrada: {entrada}</div>
                    <div>Saída: {saida}</div>
                    <div>Horas extras: {horasExtras}</div>
                    <div>Horas faltantes: {horasFaltantes}</div>
                    {solicitacaoVisualizar.registroPonto.motivoInconsistencia && (
                      <div className="modal-bloco-inconsistencia">
                        Motivo da inconsistência: {solicitacaoVisualizar.registroPonto.motivoInconsistencia}
                      </div>
                    )}
                  </div>
                )}

                {/* Abonos */}
                {solicitacaoVisualizar.abonos && solicitacaoVisualizar.abonos.length > 0 && (
                  <div className="modal-bloco">
                    <div className="modal-bloco-titulo-sec">Abonos</div>
                    {solicitacaoVisualizar.abonos.map((ab: any, idx: number) => (
                      <div key={idx} className="modal-bloco-abono">
                        <div><b>Tipo:</b> {ab.tipo_abono.replace('_', ' ')}</div>
                        <div><b>Status:</b> {ab.status}</div>
                        <div><b>Data início:</b> {ab.data_inicio ? (() => { const [y, m, d] = ab.data_inicio.substring(0, 10).split('-'); return `${d}/${m}/${y}`; })() : '--'}</div>
                         <div><b>Data fim:</b> {ab.data_fim ? (() => { const [y, m, d] = ab.data_fim.substring(0, 10).split('-'); return `${d}/${m}/${y}`; })() : '--'}</div>
                        <div><b>Com atestado:</b> {ab.com_atestado ? 'Sim' : 'Não'}</div>
                        <div><b>Motivo:</b> {ab.motivo}</div>
                        {ab.documento_comprovante && (
                          <div>
                            <b>Documento:</b> <button type="button" className="modal-link-download" onClick={() => handleDownloadDocumento(ab.documento_comprovante)}>Baixar documento</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Ajustes */}
                {solicitacaoVisualizar.ajustes && solicitacaoVisualizar.ajustes.length > 0 && (
                  <div className="modal-bloco">
                    <div className="modal-bloco-titulo-sec">Ajustes</div>
                    {solicitacaoVisualizar.ajustes.map((aj: any, idx: number) => (
                      <div key={idx} className="modal-bloco-ajuste">
                        <div><b>Data:</b> {aj.data ? (() => { const [y, m, d] = aj.data.substring(0, 10).split('-'); return `${d}/${m}/${y}`; })() : '--'}</div>
                        {solicitacaoVisualizar.registroPonto && solicitacaoVisualizar.registroPonto.pontos && solicitacaoVisualizar.registroPonto.pontos.length > 0 && (
                          <div style={{ margin: '6px 0 2px 0', color: '#888' }}>
                            <b>Pontos originais:</b>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {solicitacaoVisualizar.registroPonto.pontos.map((p: any, i: number) => (
                                <li key={i}>{p.data_hora.substring(11, 16)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div style={{ margin: '6px 0 2px 0', color: 'var(--color-primary-dark)' }}><b>Pontos de ajuste:</b></div>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {aj.pontos_ajuste.map((p: any, i: number) => (
                            <li key={i}>{p.data_horario.substring(11, 16)}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                <div className="modal-botoes">
                  <button className="modal-cancelar" onClick={() => setModalVisualizar(false)}>Fechar</button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {modalJustificativa && (
        <div className="modal-abono-overlay">
          <div className="modal-abono" style={{ minWidth: 320, maxWidth: 400 }}>
            <h2>Justificativa da Recusa</h2>
            <textarea
              value={justificativa}
              onChange={e => setJustificativa(e.target.value)}
              placeholder="Descreva o motivo da recusa..."
              style={{ width: '100%', minHeight: 80, marginBottom: 16 }}
            />
            <div className="modal-botoes">
              <button 
                className="modal-cancelar" 
                onClick={() => setModalJustificativa(false)} 
                disabled={enviandoAceitar !== null || enviandoRecusar !== null}
              >Cancelar</button>
              <button 
                className="modal-salvar" 
                onClick={handleRecusar} 
                disabled={enviandoAceitar !== null || enviandoRecusar !== null || !justificativa.trim()}
              >Recusar</button>
            </div>
            {mensagemAcao && <div className="modal-mensagem">{mensagemAcao}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitacoesPage; 