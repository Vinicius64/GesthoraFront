import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { api } from '../../config/api';
import { toGMT3DateString } from '../../sources/dateUtils';
import './PontosFuncionarioPage.css';

const meses = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];
const mesAtual = new Date().getMonth() + 1;
const anoAtual = new Date().getFullYear();
const anos = Array.from({ length: anoAtual - 2020 + 1 }, (_, i) => 2020 + i);
const statusList = [
  { value: '', label: 'Todos' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'inconsistente', label: 'Inconsistente' },
  { value: 'aberto', label: 'Aberto' },
];

const PontosFuncionarioPage = () => {
  const [mes, setMes] = useState(String(mesAtual));
  const [ano, setAno] = useState(String(anoAtual));
  const [status, setStatus] = useState('');
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [bancoHoras, setBancoHoras] = useState({ horas: 0, minutos: 0 });
  const [loadingBancoHoras, setLoadingBancoHoras] = useState(false);
  const [erroBancoHoras, setErroBancoHoras] = useState('');
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [erroSelecao, setErroSelecao] = useState('');
  const [modalAbono, setModalAbono] = useState(false);
  const [tipoAbono, setTipoAbono] = useState('');
  const [motivo, setMotivo] = useState('');
  const [atestadoMedico, setAtestadoMedico] = useState(false);
  const [documento, setDocumento] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagemAbono, setMensagemAbono] = useState('');
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [registroVisualizar, setRegistroVisualizar] = useState<any>(null);
  const [loadingVisualizar, setLoadingVisualizar] = useState(false);
  const [erroVisualizar, setErroVisualizar] = useState('');
  const [modalAjuste, setModalAjuste] = useState(false);
  const [registroAjuste, setRegistroAjuste] = useState<any>(null);
  const [motivoAjuste, setMotivoAjuste] = useState('');
  const [dataAjuste, setDataAjuste] = useState('');
  const [horariosAjuste, setHorariosAjuste] = useState<string[]>(['']);
  const [enviandoAjuste, setEnviandoAjuste] = useState(false);
  const [mensagemAjuste, setMensagemAjuste] = useState('');
  const [tipoSolicitacao, setTipoSolicitacao] = useState<'ajuste' | 'abono'>('ajuste');
  const [tipoAbonoAjuste, setTipoAbonoAjuste] = useState('');
  const [motivoAbonoAjuste, setMotivoAbonoAjuste] = useState('');
  const [atestadoMedicoAjuste, setAtestadoMedicoAjuste] = useState(false);
  const [documentoAjuste, setDocumentoAjuste] = useState<File | null>(null);

  useEffect(() => {
    if (mes && ano) buscarRegistros();
    buscarBancoHoras();
  }, [mes, ano, status]);

  const buscarRegistros = async () => {
    setLoading(true);
    setErro('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api.baseURL}/employee/pontos?mes=${mes}&ano=${ano}${status ? `&status=${status}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistros(res.data.registros || []);
    } catch (err: any) {
      setErro(err?.response?.data?.message || 'Erro ao buscar registros.');
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarBancoHoras = async () => {
    setLoadingBancoHoras(true);
    setErroBancoHoras('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api.baseURL}/employee/banco-horas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBancoHoras(res.data);
    } catch (err: any) {
      setErroBancoHoras(err?.response?.data?.message || 'Erro ao buscar banco de horas.');
    } finally {
      setLoadingBancoHoras(false);
    }
  };

  const handleChangeMes = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMes(e.target.value);
  };
  const handleChangeAno = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAno(e.target.value);
  };
  const handleChangeStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const saoConsecutivas = (datas: string[]) => {
    if (datas.length <= 1) return true;
    const ordenadas = datas.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
    for (let i = 1; i < ordenadas.length; i++) {
      const diff = (ordenadas[i].getTime() - ordenadas[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      if (diff !== 1) return false;
    }
    return true;
  };

  const handleSelecionar = (data: string) => {
    if (selecionados.length === 0) {
      setSelecionados([data]);
      setErroSelecao('');
      return;
    }
    if (selecionados.includes(data)) {
      setSelecionados([data]);
      setErroSelecao('');
      return;
    }
    const todasDatas = registros.map(r => r.data).sort();
    const primeira = selecionados[0];
    const idx1 = todasDatas.indexOf(primeira);
    const idx2 = todasDatas.indexOf(data);
    if (idx1 === -1 || idx2 === -1) {
      setSelecionados([data]);
      setErroSelecao('');
      return;
    }
    const [start, end] = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1];
    const intervalo = todasDatas.slice(start, end + 1);
    setSelecionados(intervalo);
    setErroSelecao('');
  };

  useEffect(() => {
    setSelecionados([]);
    setErroSelecao('');
  }, [mes, ano]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = selecionados.length > 0 && selecionados.length < registros.length;
    }
  }, [selecionados, registros]);

  const datasSelecionadasOrdenadas = selecionados
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());
  const dataInicial = datasSelecionadasOrdenadas[0]?.toISOString().split('T')[0] || '';
  const dataFinal = datasSelecionadasOrdenadas[datasSelecionadasOrdenadas.length - 1]?.toISOString().split('T')[0] || '';

  const handleSalvarAbono = async () => {
    setEnviando(true);
    setMensagemAbono('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Ajusta a data inicial para o início do dia (00:00:00) no fuso horário local
      const [anoInicial, mesInicial, diaInicial] = dataInicial.split('-').map(Number);
      const dataInicialLocal = new Date(anoInicial, mesInicial - 1, diaInicial, 0, 0, 0);
      formData.append('data_inicio', toGMT3DateString(dataInicialLocal));
      
      // Ajusta a data final para o final do último dia (23:59:59) no fuso horário local
      const ultimaData = datasSelecionadasOrdenadas[datasSelecionadasOrdenadas.length - 1];
      const [anoFinal, mesFinal, diaFinal] = ultimaData.toISOString().split('T')[0].split('-').map(Number);
      const dataFinalLocal = new Date(anoFinal, mesFinal - 1, diaFinal, 23, 59, 59);
      formData.append('data_fim', toGMT3DateString(dataFinalLocal));
      
      formData.append('tipo_abono', tipoAbono);
      formData.append('motivo', motivo);
      formData.append('com_atestado', atestadoMedico ? 'true' : 'false');
      if (documento) formData.append('documento_comprovante', documento);
      await axios.post(`${api.baseURL}/employee/abono-periodo`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensagemAbono('Solicitação de abono enviada com sucesso!');
      setModalAbono(false);
      setSelecionados([]);
      buscarRegistros();
    } catch (err: any) {
      setMensagemAbono(err?.response?.data?.message || 'Erro ao solicitar abono.');
    } finally {
      setEnviando(false);
    }
  };

  const nome = localStorage.getItem('nome') || 'Usuário';

  const handleSelecionarTodos = () => {
    const todasDatas = registros.map(r => r.data).sort();
    if (selecionados.length === todasDatas.length) {
      setSelecionados([]);
    } else {
      setSelecionados(todasDatas);
    }
  };

  const handleVisualizarRegistro = async (id_registro: number) => {
    setModalVisualizar(true);
    setLoadingVisualizar(true);
    setErroVisualizar('');
    setRegistroVisualizar(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api.baseURL}/employee/registro-ponto/${id_registro}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistroVisualizar(res.data.registro);
    } catch (err: any) {
      setErroVisualizar(err?.response?.data?.message || 'Erro ao buscar registro.');
    } finally {
      setLoadingVisualizar(false);
    }
  };

  const registrosOrdenados = [...registros].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const handleAbrirAjuste = async (registro: any) => {
    setRegistroAjuste(registro);
    setDataAjuste(registro.data);
    setMotivoAjuste('');
    setTipoSolicitacao('ajuste');
    setTipoAbonoAjuste('');
    setMotivoAbonoAjuste('');
    setAtestadoMedicoAjuste(false);
    setDocumentoAjuste(null);
    setMensagemAjuste('');
    setEnviandoAjuste(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api.baseURL}/employee/registro-ponto/${registro.id_registro}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pontos = res.data.registro.pontos || [];
      if (pontos.length > 0) {
        setHorariosAjuste(
          pontos.map((p: any) => {
            const d = new Date(p.data_hora);
            return d.toISOString().substr(11, 5); // HH:mm
          })
        );
      } else {
        setHorariosAjuste(['']);
      }
    } catch {
      setHorariosAjuste(['']);
    } finally {
      setEnviandoAjuste(false);
      setModalAjuste(true);
    }
  };

  const handleAddHorarioAjuste = () => setHorariosAjuste([...horariosAjuste, '']);
  const handleRemoveHorarioAjuste = (idx: number) => setHorariosAjuste(horariosAjuste.filter((_, i) => i !== idx));
  const handleChangeHorarioAjuste = (idx: number, value: string) => {
    const novos = [...horariosAjuste];
    novos[idx] = value;
    setHorariosAjuste(novos);
  };

  const toGMT3DateTime = (data: string, hora: string) => {
    const [ano, mes, dia] = data.split('-');
    const [h, m] = hora.split(':');
    const date = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia), Number(h) + 3, Number(m)));
    return toGMT3DateString(date);
  };

  const handleSalvarAjuste = async () => {
    setEnviandoAjuste(true);
    setMensagemAjuste('');
    try {
      const token = localStorage.getItem('token');
      if (tipoSolicitacao === 'ajuste') {
        const pontos_ajuste = horariosAjuste
          .filter(h => h)
          .map(h => ({ data_horario: toGMT3DateTime(dataAjuste, h) }));
        const payload = {
          tipo: 'ajuste',
          motivo: motivoAjuste,
          data: dataAjuste,
          registro_ponto_id: registroAjuste.id_registro,
          pontos_ajuste
        };
        await axios.post(`${api.baseURL}/employee/solicitacao`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const formData = new FormData();
        formData.append('tipo', 'abono');
        formData.append('motivo', motivoAbonoAjuste);
        formData.append('data', toGMT3DateString(dataAjuste));
        formData.append('registro_ponto_id', registroAjuste.id_registro);
        formData.append('tipo_abono', tipoAbonoAjuste);
        formData.append('com_atestado', atestadoMedicoAjuste ? 'true' : 'false');
        if (documentoAjuste) formData.append('documento_comprovante', documentoAjuste);
        await axios.post(`${api.baseURL}/employee/solicitacao`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setMensagemAjuste('Solicitação enviada com sucesso!');
      setModalAjuste(false);
      buscarRegistros();
    } catch (err: any) {
      setMensagemAjuste(err?.response?.data?.message || 'Erro ao solicitar ajuste/abono.');
    } finally {
      setEnviandoAjuste(false);
    }
  };

  return (
    <div className="funcionario-layout">
      <div className="menu-lateral">
        <div className="cargo">Desenvolvedor</div>
        <div className="nome">{nome}</div>
        <div className="link ativo" onClick={() => window.location.href='/meus-pontos'}>Meus pontos</div>
        <div className="descricao">Ver pontos/carga horária</div>
        <div className="link" onClick={() => window.location.href='/bater-ponto'}>Bater Ponto</div>
        <div className="descricao">Marcar horário de entrada/saída</div>
        <div className="link" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('perfil'); localStorage.removeItem('nome'); window.location.href='/login'; }}>Sair</div>
      </div>
      <div className="funcionario-main">
        <h1 className="titulo-pagina">Meus Pontos</h1>
        <div className="painel-funcionario">
          <div className="banco-horas-container">
            <h2>Banco de Horas</h2>
            {loadingBancoHoras ? (
              <div className="loading">Carregando banco de horas...</div>
            ) : erroBancoHoras ? (
              <div className="erro">{erroBancoHoras}</div>
            ) : (
              <div className="banco-horas-info">
                <div className="banco-horas-valor">
                  <span className="horas">{bancoHoras.horas}h</span>
                  <span className="minutos">{Math.abs(bancoHoras.minutos)}min</span>
                </div>
                <div className="banco-horas-status">
                  {bancoHoras.horas > 0 || bancoHoras.minutos > 0 ? (
                    <span className="positivo">Horas extras disponíveis</span>
                  ) : bancoHoras.horas < 0 || bancoHoras.minutos < 0 ? (
                    <span className="negativo">Horas em débito</span>
                  ) : (
                    <span className="neutro">Banco de horas zerado</span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="filtros-pontos">
            <div className="filtro-group">
              <label>Filtro por data</label>
              <select value={mes} onChange={handleChangeMes} required>
                <option value="">Selecione o mês ...</option>
                {meses.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select value={ano} onChange={handleChangeAno} required>
                <option value="">Selecione o ano ...</option>
                {anos.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="filtro-group">
              <label>Filtro por status</label>
              <select value={status} onChange={handleChangeStatus}>
                {statusList.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <button
              className="botao-abonar"
              disabled={selecionados.length === 0}
              onClick={() => setModalAbono(true)}
            >
              Abonar dias
            </button>
          </div>
          {erroSelecao && <div className="erro-selecao">{erroSelecao}</div>}
          <div className="tabela-pontos-container">
            <table className="tabela-pontos">
              <thead>
                <tr>
                  <th>
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={registros.length > 0 && selecionados.length === registros.length}
                      onChange={handleSelecionarTodos}
                    />
                  </th>
                  <th>Data</th>
                  <th>Entrada/Saída</th>
                  <th>Status</th>
                  <th>Horas extras</th>
                  <th>Horas faltantes</th>
                  <th>Ajuste/visualizar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="loading">Carregando...</td></tr>
                ) : erro ? (
                  <tr><td colSpan={7} className="erro">{erro}</td></tr>
                ) : registros.length === 0 ? (
                  <tr><td colSpan={7} className="nenhum">Nenhum registro encontrado.</td></tr>
                ) : (
                  registrosOrdenados.map((reg, idx) => (
                    <tr key={reg.id_registro}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selecionados.includes(reg.data)}
                          onChange={() => handleSelecionar(reg.data)}
                        />
                      </td>
                      <td>{(() => { 
                        const [ano, mes, dia] = reg.data.split('-');
                        const dataLocal = new Date(Number(ano), Number(mes) - 1, Number(dia));
                        return dataLocal.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
                      })()}</td>
                      <td>{(() => {
                        if (reg.entrada && reg.saida && reg.entrada !== reg.saida) {
                          return `${reg.entrada} - ${reg.saida}`;
                        } else if (reg.entrada) {
                          return reg.entrada;
                        } else if (reg.saida) {
                          return reg.saida;
                        } else {
                          return '--:--';
                        }
                      })()}</td>
                      <td style={{ textAlign: 'center' }} className={reg.status === 'fechado' ? 'status-fechado' : ''}>{reg.status}</td>
                      <td>{reg.status === 'aberto' ? '--:--' : reg.horas_extras}</td>
                      <td>{reg.status === 'aberto' ? '--:--' : reg.horas_faltantes}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="icon-btn" title="Ajustar" onClick={() => handleAbrirAjuste(reg)}><span role="img" aria-label="ajustar">🛠️</span></button>
                        <button className="icon-btn" title="Visualizar" onClick={() => handleVisualizarRegistro(reg.id_registro)}><span role="img" aria-label="visualizar">👁️</span></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {modalAbono && (
          <div className="modal-abono-overlay">
            <div className="modal-abono">
              <h2>Abono por período</h2>
              <div className="modal-campos">
                <div className="modal-row">
                  <div>
                    <label>Data inicial</label>
                    <input type="date" value={dataInicial} disabled />
                  </div>
                  <div>
                    <label>Data final</label>
                    <input type="date" value={dataFinal} disabled />
                  </div>
                  <div>
                    <label>Tipo de abono</label>
                    <select value={tipoAbono} onChange={e => setTipoAbono(e.target.value)} required>
                      <option value="">Selecione ...</option>
                      <option value="falta_justificada">Falta Justificada</option>
                      <option value="atestado">Atestado</option>
                      <option value="banco_horas">Banco de Horas</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>
                <div className="modal-row">
                  <label className="switch-label">
                    <input type="checkbox" checked={atestadoMedico} onChange={e => setAtestadoMedico(e.target.checked)} />
                    <span className="switch-slider"></span>
                    Atestado Médico?
                  </label>
                </div>
                <div className="modal-row">
                  <label>Motivo do abono</label>
                  <textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Descreva..." required />
                </div>
                <div className="modal-row">
                  <label>Documento (opcional)</label>
                  <input type="file" onChange={e => setDocumento(e.target.files?.[0] || null)} />
                </div>
                <div className="modal-row modal-botoes">
                  <button className="modal-cancelar" onClick={() => setModalAbono(false)} disabled={enviando}>Cancelar</button>
                  <button className="modal-salvar" onClick={handleSalvarAbono} disabled={enviando || !tipoAbono || !motivo}>Salvar</button>
                </div>
                {mensagemAbono && <div className="modal-mensagem">{mensagemAbono}</div>}
              </div>
            </div>
          </div>
        )}
        {/* Modal de visualização de pontos */}
        {modalVisualizar && (
          <div className="modal-abono-overlay">
            <div className="modal-abono modal-visualizar-registro">
              <h2>Pontos do Registro</h2>
              {loadingVisualizar ? (
                <div style={{ textAlign: 'center', padding: '18px' }}>Carregando...</div>
              ) : erroVisualizar ? (
                <div className="modal-mensagem" style={{ color: 'red' }}>{erroVisualizar}</div>
              ) : registroVisualizar ? (
                <div>
                  <div className="modal-visualizar-info">
                    <div className="info-bloco">
                      <span className="info-label">Data</span>
                      <span className="info-valor">{(() => {
                        const [ano, mes, dia] = registroVisualizar.date.split('-');
                        const dataLocal = new Date(Number(ano), Number(mes) - 1, Number(dia));
                        return dataLocal.toLocaleDateString('pt-BR');
                      })()}</span>
                    </div>
                    <div className="info-bloco">
                      <span className="info-label">Status</span>
                      <span className="info-valor">{registroVisualizar.status}</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 6, fontWeight: 600, color: 'var(--color-primary-dark)' }}>Pontos batidos:</div>
                  <div style={{ maxHeight: 180, overflowY: 'auto', width: '100%' }}>
                    <table className="modal-visualizar-tabela">
                      <thead>
                        <tr>
                          <th>Horário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registroVisualizar.pontos && registroVisualizar.pontos.length > 0 ? (
                          registroVisualizar.pontos.map((p: any, idx: number) => (
                            <tr key={idx}>
                              <td>{new Date(p.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td>Nenhum ponto registrado.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {registroVisualizar.motivoInconsistencia && (
                    <div style={{ color: 'red', marginTop: 16, fontWeight: 500 }}>
                      Motivo da inconsistência: {registroVisualizar.motivoInconsistencia}
                    </div>
                  )}
                </div>
              ) : null}
              <div className="modal-botoes">
                <button className="modal-cancelar" onClick={() => setModalVisualizar(false)}>Fechar</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de ajuste de ponto */}
        {modalAjuste && (
          <div className="modal-abono-overlay">
            <div className="modal-abono">
              <h2>Solicitação para o dia</h2>
              <div className="modal-campos">
                {enviandoAjuste && (
                  <div className="modal-mensagem" style={{ color: '#888', textAlign: 'center', marginBottom: 10 }}>
                    Solicitando...
                  </div>
                )}
                <div className="modal-row">
                  <label>Tipo de solicitação</label>
                  <select value={tipoSolicitacao} onChange={e => setTipoSolicitacao(e.target.value as 'ajuste' | 'abono')}>
                    <option value="ajuste">Ajuste de horário</option>
                    <option value="abono">Abono</option>
                  </select>
                </div>
                <div className="modal-row">
                  <div>
                    <label>Data</label>
                    <input type="date" value={dataAjuste} disabled />
                  </div>
                </div>
                {tipoSolicitacao === 'ajuste' ? (
                  <>
                    <div className="modal-row">
                      <label>Motivo do ajuste</label>
                      <textarea value={motivoAjuste} onChange={e => setMotivoAjuste(e.target.value)} placeholder="Descreva o motivo..." required />
                    </div>
                    <div className="modal-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <label style={{ marginBottom: 4 }}>Horários de ajuste</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                        {horariosAjuste.map((h, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <input
                              type="time"
                              value={h}
                              onChange={e => handleChangeHorarioAjuste(idx, e.target.value)}
                              required
                              className="ajuste-horario-input"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveHorarioAjuste(idx)}
                              className="ajuste-horario-btn ajuste-horario-btn-remove"
                              title="Remover horário"
                            >🗑️</button>
                            <button
                              type="button"
                              onClick={() => {
                                const novos = [...horariosAjuste];
                                novos.splice(idx + 1, 0, '');
                                setHorariosAjuste(novos);
                              }}
                              className="ajuste-horario-btn ajuste-horario-btn-add"
                              title="Adicionar horário abaixo"
                            >➕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="modal-row">
                      <label>Tipo de abono</label>
                      <select value={tipoAbonoAjuste} onChange={e => setTipoAbonoAjuste(e.target.value)} required>
                        <option value="">Selecione ...</option>
                        <option value="falta_justificada">Falta Justificada</option>
                        <option value="atestado">Atestado</option>
                        <option value="banco_horas">Banco de Horas</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div className="modal-row">
                      <label className="switch-label">
                        <input type="checkbox" checked={atestadoMedicoAjuste} onChange={e => setAtestadoMedicoAjuste(e.target.checked)} />
                        <span className="switch-slider"></span>
                        Atestado Médico?
                      </label>
                    </div>
                    <div className="modal-row">
                      <label>Motivo do abono</label>
                      <textarea value={motivoAbonoAjuste} onChange={e => setMotivoAbonoAjuste(e.target.value)} placeholder="Descreva..." required />
                    </div>
                    <div className="modal-row">
                      <label>Documento (opcional)</label>
                      <input type="file" onChange={e => setDocumentoAjuste(e.target.files?.[0] || null)} />
                    </div>
                  </>
                )}
                <div className="modal-row modal-botoes">
                  <button className="modal-cancelar" onClick={() => setModalAjuste(false)} disabled={enviandoAjuste}>Cancelar</button>
                  <button className="modal-salvar" onClick={handleSalvarAjuste}
                    disabled={enviandoAjuste ||
                      (tipoSolicitacao === 'ajuste' && (!motivoAjuste || horariosAjuste.filter(h => h).length === 0)) ||
                      (tipoSolicitacao === 'abono' && (!tipoAbonoAjuste || !motivoAbonoAjuste))
                    }
                  >Salvar</button>
                </div>
                {mensagemAjuste && <div className="modal-mensagem">{mensagemAjuste}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PontosFuncionarioPage; 