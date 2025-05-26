import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../config/api';
import './EditarUsuarioPage.css';

const diasSemanaOpcoes = [
  { value: 'seg', label: 'Segunda' },
  { value: 'ter', label: 'Terça' },
  { value: 'qua', label: 'Quarta' },
  { value: 'qui', label: 'Quinta' },
  { value: 'sex', label: 'Sexta' },
  { value: 'sab', label: 'Sábado' },
  { value: 'dom', label: 'Domingo' }
];

export default function EditarUsuarioPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('');
  const [usuario, setUsuario] = useState<any>(null);
  const [diasSemana, setDiasSemana] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);

  async function handleBuscarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setUsuario(null);
    setTipo('');
    setDiasSemana([]);
    setBuscando(true);
    try {
      const token = localStorage.getItem('token');
      if (!busca) {
        setErro('Informe email ou CPF para buscar.');
        setBuscando(false);
        return;
      }
      const params = new URLSearchParams();
      if (busca.includes('@')) {
        params.append('email', busca);
      } else {
        params.append('cpf', busca.replace(/\D/g, ''));
      }
      const res = await axios.get(`${api.baseURL}${api.endpoints.findUser}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipo(res.data.tipo);
      setUsuario(res.data.usuario);
      if (res.data.tipo === 'funcionario') {
        setDiasSemana(res.data.usuario.dias_semana.map((d: any) => d.dia));
      }
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Usuário não encontrado.');
    } finally {
      setBuscando(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === 'cep') {
      setUsuario({ ...usuario, cep: formatarCEP(value) });
    } else {
      setUsuario({ ...usuario, [name]: value });
    }
  }

  function handleDiasSemana(dia: string) {
    setDiasSemana((prev) =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem('');
    setErro('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...usuario,
        cpf: limparCPF(usuario.cpf),
        data_nascimento: paraDDMMAAAA(usuario.data_nascimento),
        dias_semana: tipo === 'funcionario' ? diasSemana : undefined,
        telefone: usuario.telefone,
        cep: usuario.cep.replace(/\D/g, ''),
      };
      await axios.put(`${api.baseURL}${api.endpoints.editUser}/${usuario.id_funcionario || usuario.id_gestor}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensagem('Usuário atualizado com sucesso!');
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="editar-usuario-container">
      <div className="menu-lateral">
        <div className="cargo">Admin</div>
        <div className="nome">Editar Usuário</div>
        <div className="link" onClick={() => navigate('/criar-usuario')}>Criar Usuários</div>
        <div className="descricao">Adicionar Usuários</div>
        <div className="link ativo">Editar Usuários</div>
        <div className="descricao">Alterar informações de Usuários</div>
        <div className="link" onClick={() => navigate('/gerenciar-empresa')}>Gerenciar Empresa</div>
        <div className="descricao">Gerência empresas</div>
        <div className="link" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Sair</div>
      </div>
      <div className="conteudo-principal">
        <h1 className="titulo-pagina">Editar Usuário</h1>
        <form className="formulario-usuario" onSubmit={handleBuscarUsuario} style={{ marginBottom: 32 }}>
          <div className="form-grid-duas-colunas">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="busca">Email ou CPF</label>
              <input className="form-input" type="text" id="busca" name="busca" value={busca} onChange={e => setBusca(e.target.value)} maxLength={55} placeholder="Digite o email ou CPF" />
            </div>
          </div>
          <button type="submit" className="botao-salvar" disabled={buscando}>{buscando ? 'Buscando...' : 'Buscar Usuário'}</button>
        </form>
        {erro && <div className="error-message">{erro}</div>}
        {mensagem && <div className="success-message">{mensagem}</div>}
        {usuario && (
          <form className="formulario-usuario" onSubmit={handleSubmit}>
            <div className="form-grid-duas-colunas">
              <div className="form-group col-span-2">
                <label className="form-label" htmlFor="nome">Nome</label>
                <input className="form-input" type="text" id="nome" name="nome" value={usuario.nome || ''} onChange={handleChange} required maxLength={55} />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label" htmlFor="email">Email</label>
                <input className="form-input" type="email" id="email" name="email" value={usuario.email || ''} onChange={handleChange} required maxLength={55} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cargo">Cargo</label>
                <input className="form-input" type="text" id="cargo" name="cargo" value={usuario.cargo || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="telefone">Telefone</label>
                <input className="form-input" type="text" id="telefone" name="telefone" value={formatarTelefone(usuario.telefone || '')} onChange={e => setUsuario({ ...usuario, telefone: formatarTelefone(e.target.value) })} maxLength={15} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cpf">CPF</label>
                <input className="form-input" type="text" id="cpf" name="cpf" value={formatarCPF(usuario.cpf || '')} onChange={e => setUsuario({ ...usuario, cpf: limparCPF(e.target.value) })} maxLength={14} />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label" htmlFor="endereco">Endereço</label>
                <input className="form-input" type="text" id="endereco" name="endereco" value={usuario.endereco || ''} onChange={handleChange} maxLength={55} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="data_nascimento">Data de Nascimento</label>
                <input className="form-input" type="date" id="data_nascimento" name="data_nascimento" value={paraInputDate(usuario.data_nascimento)} onChange={e => setUsuario({ ...usuario, data_nascimento: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="escolaridade">Escolaridade</label>
                <input className="form-input" type="text" id="escolaridade" name="escolaridade" value={usuario.escolaridade || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="genero">Gênero</label>
                <input className="form-input" type="text" id="genero" name="genero" value={usuario.genero || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cep">CEP</label>
                <input className="form-input" type="text" id="cep" name="cep" value={formatarCEP(usuario.cep || '')} onChange={handleChange} />
              </div>
              {/* Campo Carga Horária Diária só aparece se existir no usuário */}
              {usuario.carga_horaria_diaria !== undefined && usuario.carga_horaria_diaria !== null && (
                <div className="form-group">
                  <label className="form-label" htmlFor="carga_horaria_diaria">Carga Horária Diária</label>
                  <input className="form-input" type="text" id="carga_horaria_diaria" name="carga_horaria_diaria" value={usuario.carga_horaria_diaria || ''} onChange={handleChange} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="ativo">Status</label>
                <select className="form-input" id="ativo" name="ativo" value={usuario.ativo ? 'true' : 'false'} onChange={handleChange}>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
              {tipo === 'funcionario' && (
                <div className="form-group col-span-2">
                  <label className="form-label">Dias da Semana</label>
                  <div className="dias-semana">
                    {diasSemanaOpcoes.map(dia => (
                      <label key={dia.value} className="dia-checkbox">
                        <input
                          type="checkbox"
                          checked={diasSemana.includes(dia.value)}
                          onChange={() => handleDiasSemana(dia.value)}
                        />
                        {dia.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="botao-salvar" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          </form>
        )}
      </div>
    </div>
  );
} 