import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../config/api';
import './GestorPage.css';

const SolicitacoesPage = () => {
  const navigate = useNavigate();
  const [abonos, setAbonos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const perfil = localStorage.getItem('perfil');
    if (!token || perfil !== 'gestor') {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchAbonos = async () => {
      setLoading(true);
      setErro('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${api.baseURL}/manager/abonos-pendentes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAbonos(res.data.abonos || []);
      } catch (err) {
        setErro('Erro ao buscar solicitações.');
      } finally {
        setLoading(false);
      }
    };
    fetchAbonos();
  }, []);

  const nome = localStorage.getItem('nome') || 'Gestor';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
    localStorage.removeItem('nome');
    navigate('/login');
  };

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
          ) : abonos.length === 0 ? (
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
                {abonos.map((abono) => (
                  <tr key={abono.id_abono} style={{ background: '#222', color: '#fff', borderRadius: 12, marginBottom: 8 }}>
                    <td>{new Date(abono.data_inicio).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</td>
                    <td>{abono.solicitacao?.funcionario?.nome || '-'}</td>
                    <td>{abono.status}</td>
                    <td>{abono.tipo_abono}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button title="Aceitar">✔️</button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button title="Recusar">&#10006;</button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button title="Visualizar">
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
    </div>
  );
};

export default SolicitacoesPage; 