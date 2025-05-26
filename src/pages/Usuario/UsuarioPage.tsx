import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../config/api';
import './UsuarioPage.css';

interface Usuario {
  nome: string;
  email: string;
  endereco: string;
  telefone: string;
  cpf: string;
  escolaridade: string;
  cep: string;
  genero: string;
  data_nascimento: string;
  cargo: string;
  carga_horaria_diaria: string;
}

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

function formatarCPF(valor: string) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarTelefone(valor: string) {
  valor = valor?.replace(/\D/g, '').slice(0, 11) || '';
  if (valor.length <= 10) {
    return valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  } else {
    return valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
}

function formatarCEP(valor: string) {
  return (valor || '').replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{0,3})/, (m, p1, p2) => p2 ? `${p1}-${p2}` : p1);
}

const UsuarioPage = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [error,setError] = useState('');
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
      } catch(error) {
        setError('Erro ao carregar dados do usuário');
      }
    };
    fetchUsuario();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!usuario) {
    return (
      <div className="usuario-container loading">
        <div className="loading-text">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="usuario-container">
      <div className="menu-lateral">
        {usuario.cargo && <div className="cargo">{usuario.cargo}</div>}
        <div className="nome">{usuario.nome}</div>
        <div className={`link${location.pathname === '/dados' ? ' ativo' : ''}`} onClick={() => navigate('/dados')}>Usuário</div>
        <div className="descricao">Ver meus dados de usuário.</div>
        <div className="link" onClick={() => navigate('/meus-pontos')}>Meus pontos</div>
        <div className="descricao">Ver pontos/carga horária.</div>
        <div className={`link${location.pathname === '/bater-ponto' ? ' ativo' : ''}`} onClick={() => navigate('/bater-ponto')}>Bater Ponto</div>
        <div className="descricao">Marcar horário</div>
        <div className="link" onClick={logout}>Sair</div>
      </div>
      <div className="conteudo-principal">
        <h1 className="titulo-pagina">Dados de Usuário</h1>
        <div className="painel-usuario">
          <div className="usuario-grid">
            {campos.map((campo) => (
              <div key={campo.key} className="usuario-campo">
                <div className="usuario-label">{campo.label}</div>
                <input
                  className="usuario-input"
                  value={
                    campo.key === 'data_nascimento' ? formatarData(usuario[campo.key as keyof Usuario]) :
                    campo.key === 'cpf' ? formatarCPF(usuario[campo.key as keyof Usuario] as string) :
                    campo.key === 'telefone' ? formatarTelefone(usuario[campo.key as keyof Usuario] as string) :
                    campo.key === 'cep' ? formatarCEP(usuario[campo.key as keyof Usuario] as string) :
                    usuario[campo.key as keyof Usuario] || ''
                  }
                  readOnly
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuarioPage; 