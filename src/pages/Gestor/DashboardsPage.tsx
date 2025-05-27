import { useState } from 'react';
import axios from 'axios';
import { api } from '../../config/api';
import './DashboardsPage.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, Label, LineChart, Line
} from 'recharts';

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
const anoAtual = new Date().getFullYear();
const anos = Array.from({ length: anoAtual - 2020 + 1 }, (_, i) => 2020 + i);

const tiposRelatorio = [
  { value: 'horas', label: 'Horas Trabalhadas por Dia' },
  { value: 'horarios', label: 'Horário Médio de Entrada/Saída' },
];

const DashboardsPage = () => {
  const [funcionarioId, setFuncionarioId] = useState('');
  const [funcionarioNome, setFuncionarioNome] = useState('');
  const [funcionarios, setFuncionarios] = useState<{ id_funcionario: string, nome: string }[]>([]);
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [relatorio, setRelatorio] = useState<{ data: string, horas: number, minutos: number }[] | null>(null);
  const [nomeFuncionario, setNomeFuncionario] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState<number | null>(null);
  const [tipoRelatorio, setTipoRelatorio] = useState('horas');
  const [relatorioHorarios, setRelatorioHorarios] = useState<{ data: string, entrada: string|null, saida: string|null }[] | null>(null);

  const handleBuscarFuncionarios = async (nome: string) => {
    setFuncionarioNome(nome);
    setFuncionarioId('');
    setRelatorio(null);
    setRelatorioHorarios(null);
    setNomeFuncionario('');
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

  const handleSelectFuncionario = async (id: string, nome: string) => {
    setFuncionarioId(id);
    setFuncionarioNome(nome);
    setFuncionarios([]);
    setRelatorio(null);
    setRelatorioHorarios(null);
    setNomeFuncionario('');
    setCargaHoraria(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api.baseURL}/manager/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCargaHoraria(res.data.funcionario?.carga_horaria_diaria || null);
    } catch {
      setCargaHoraria(null);
    }
  };

  const handleChangeMes = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMes(e.target.value);
    setRelatorio(null);
    setRelatorioHorarios(null);
  };
  const handleChangeAno = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAno(e.target.value);
    setRelatorio(null);
    setRelatorioHorarios(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setRelatorio(null);
    setRelatorioHorarios(null);
    setNomeFuncionario('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (tipoRelatorio === 'horas') {
        const res = await axios.get(`${api.baseURL}/manager/employee/${funcionarioId}/report?mes=${mes}&ano=${ano}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRelatorio(res.data.relatorio || []);
        setNomeFuncionario(res.data.funcionario || funcionarioNome);
      } else if (tipoRelatorio === 'horarios') {
        const res = await axios.get(`${api.baseURL}/manager/employee/${funcionarioId}/horarios?mes=${mes}&ano=${ano}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRelatorioHorarios(res.data.relatorio || []);
        setNomeFuncionario(res.data.funcionario || funcionarioNome);
      }
    } catch (err: any) {
      setErro(err?.response?.data?.message || 'Erro ao buscar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const dadosGrafico = relatorio?.map((linha) => ({
    dia: parseInt(linha.data.split('-')[2], 10),
    horas: linha.horas + (linha.minutos / 60),
  })) || [];

  const dadosGraficoHorarios = relatorioHorarios?.map((linha) => {
    const dia = parseInt(linha.data.split('-')[2], 10);
    
    const toMin = (h: string|null) => h ? (parseInt(h.split(':')[0], 10) * 60 + parseInt(h.split(':')[1], 10)) : null;
    return {
      dia,
      entrada: toMin(linha.entrada),
      saida: toMin(linha.saida)
    };
  }) || [];

  const minToHora = (min: number|null) => {
    if (min === null) return '';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const tooltipHoraFormatter = (value: any) => {
    if (typeof value === 'number') return minToHora(value);
    if (typeof value === 'string' && !isNaN(Number(value))) return minToHora(Number(value));
    return '';
  };

  return (
    <div className="gestor-layout">
      <div className="menu-lateral">
        <div className="cargo">Gestor</div>
        <div className="nome">Dashboards</div>
        <div className="link" onClick={() => window.location.href='/solicitacoes'}>Solicitações</div>
        <div className="descricao">Gerir Abono e Ajustes</div>
        <div className="link ativo">Dashboards</div>
        <div className="descricao">Visualizar relatórios</div>
        <div className="link" onClick={() => window.location.href='/dados-funcionarios'}>Dados de funcionários</div>
        <div className="descricao">Visualizar e editar dados</div>
        <div className="link" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('perfil'); localStorage.removeItem('nome'); window.location.href='/login'; }}>Sair</div>
      </div>
      <div className="gestor-main">
        <h1 className="titulo-pagina">Dashboards</h1>
        <div className="painel-gestor">
          <div className="relatorio-select-group">
            <label htmlFor="tipoRelatorio" className="relatorio-select-label">Tipo de relatório</label>
            <select id="tipoRelatorio" className="relatorio-select" value={tipoRelatorio} onChange={e => { setTipoRelatorio(e.target.value); setRelatorio(null); setRelatorioHorarios(null); setErro(''); }}>
              {tiposRelatorio.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <h2 className="titulo-relatorio">
            {tipoRelatorio === 'horas' ? 'Relatório de Horas por Funcionário' : 'Horários de Entrada e Saída por Funcionário'}
          </h2>
          <form className="form-relatorio" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group funcionario-autocomplete">
              <label>Funcionário</label>
              <input
                type="text"
                value={funcionarioNome}
                onChange={e => handleBuscarFuncionarios(e.target.value)}
                placeholder="Digite o nome do funcionário"
                autoComplete="off"
              />
              {funcionarios.length > 0 && (
                <ul className="autocomplete-list">
                  {funcionarios.map(f => (
                    <li key={f.id_funcionario} onClick={() => handleSelectFuncionario(f.id_funcionario, f.nome)}>
                      {f.nome}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-group">
              <label>Mês</label>
              <select value={mes} onChange={handleChangeMes} required>
                <option value="">Selecione o mês</option>
                {meses.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ano</label>
              <select value={ano} onChange={handleChangeAno} required>
                <option value="">Selecione o ano</option>
                {anos.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="form-group botao-group">
              <label className="invisivel"> </label>
              <button type="submit" className="botao-buscar" disabled={!funcionarioId || !mes || !ano || loading}>
                {loading ? 'Buscando...' : 'Buscar Relatório'}
              </button>
            </div>
          </form>
          {erro && <div className="error-message">{erro}</div>}
          {tipoRelatorio === 'horas' && relatorio && relatorio.length > 0 && (
            <div className="relatorio-tabela-container">
              <div className="relatorio-funcionario">
                Funcionário: <b>{nomeFuncionario}</b>
                {cargaHoraria && (
                  <span style={{ marginLeft: 18, color: '#d35400', fontWeight: 500, fontSize: '1rem' }}>
                    Carga Horária Diária: <b>{cargaHoraria}h</b>
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dadosGrafico} margin={{ top: 24, right: 24, left: 8, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -8 }} />
                  <YAxis domain={[0, 12]} label={{ value: 'Horas Trabalhadas', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip formatter={(v: number) => v.toFixed(2) + 'h'} labelFormatter={d => `Dia ${d}`} />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine y={8} stroke="#d32f2f" strokeDasharray="6 3" label={{ value: '8 horas (esperado)', position: 'top', fill: '#d32f2f', fontSize: 13 }} />
                  <Bar dataKey="horas" fill="#FFA726" name="Horas Trabalhadas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {tipoRelatorio === 'horarios' && relatorioHorarios && relatorioHorarios.length > 0 && (
            <div className="relatorio-tabela-container">
              <div className="relatorio-funcionario">Funcionário: <b>{nomeFuncionario}</b></div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={dadosGraficoHorarios} margin={{ top: 24, right: 24, left: 8, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -8 }} />
                  <YAxis domain={[420, 1140]} tickFormatter={minToHora} label={{ value: 'Horário', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip formatter={tooltipHoraFormatter} labelFormatter={d => `Dia ${d}`} />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="entrada" name="Horário Médio de Entrada" stroke="#FFA726" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="saida" name="Horário Médio de Saída" stroke="#d32f2f" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {((tipoRelatorio === 'horas' && relatorio && relatorio.length === 0) || (tipoRelatorio === 'horarios' && relatorioHorarios && relatorioHorarios.length === 0)) && !erro && (
            <div className="error-message">Nenhum dado encontrado para o período selecionado.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardsPage; 