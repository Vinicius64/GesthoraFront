import { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '../../config/api';
import './GerenciarEmpresaPage.css';
import { useNavigate } from 'react-router-dom';

interface Empresa {
  id_empresa?: number;
  nome: string;
  tipo: string;
  telefone: string;
  cnpj: string;
  endereco: string;
  cep: string;
}

export default function GerenciarEmpresaPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState<Empresa>({ nome: '', tipo: '', telefone: '', cnpj: '', endereco: '', cep: '' });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 5;

  async function buscarEmpresas(nome?: string, paginaBusca = 1) {
    try {
      const token = localStorage.getItem('token');
      let query = [];
      if (nome) query.push(`nome=${encodeURIComponent(nome)}`);
      query.push(`pagina=${paginaBusca}`);
      query.push(`limite=${itensPorPagina}`);
      const url = `${api.baseURL}${api.endpoints.companies}?${query.join('&')}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setEmpresas(res.data.empresas);
      setTotalPaginas(res.data.totalPaginas || 1);
      setPagina(paginaBusca);
    } catch (err: any) {
      setErro('Erro ao buscar empresas');
    }
  }

  function formatarCEP(valor: string) {
    return valor.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{0,3})/, (m, p1, p2) => p2 ? `${p1}-${p2}` : p1);
  }

  function formatarCNPJ(valor: string) {
    return valor
      .replace(/\D/g, '')
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  function formatarTelefone(valor: string) {
    valor = valor.replace(/\D/g, '').slice(0, 11);
    if (valor.length <= 10) {
      return valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else {
      return valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === 'cep') {
      setForm({ ...form, cep: formatarCEP(value) });
    } else if (name === 'cnpj') {
      setForm({ ...form, cnpj: formatarCNPJ(value) });
    } else if (name === 'telefone') {
      setForm({ ...form, telefone: formatarTelefone(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function selecionarEmpresa(empresa: Empresa) {
    setEditandoId(empresa.id_empresa!);
    setMensagem('');
    setErro('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api.baseURL}/company/${empresa.id_empresa}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ ...res.data.empresa });
    } catch (err: any) {
      setErro('Erro ao buscar dados da empresa.');
    } finally {
      setLoading(false);
    }
  }

  function limparFormulario() {
    setEditandoId(null);
    setForm({ nome: '', tipo: '', telefone: '', cnpj: '', endereco: '', cep: '' });
    setMensagem('');
    setErro('');
  }

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    buscarEmpresas(busca, 1);
  }

  function avancarPagina() {
    if (pagina < totalPaginas) buscarEmpresas(busca, pagina + 1);
  }
  function voltarPagina() {
    if (pagina > 1) buscarEmpresas(busca, pagina - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem('');
    setErro('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editandoId) {
        await axios.put(`${api.baseURL}/edit-company/${editandoId}`, { ...form, cep: form.cep.replace(/\D/g, ''), cnpj: form.cnpj.replace(/\D/g, ''), telefone: form.telefone.replace(/\D/g, '') }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensagem('Empresa atualizada com sucesso!');
      } else {
        await axios.post(`${api.baseURL}/create-company`, { ...form, cep: form.cep.replace(/\D/g, ''), cnpj: form.cnpj.replace(/\D/g, ''), telefone: form.telefone.replace(/\D/g, '') }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensagem('Empresa criada com sucesso!');
      }
      limparFormulario();
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao salvar empresa');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gerenciar-empresa-container">
      <div className="menu-lateral">
        <div className="cargo">Administrador</div>
        <div className="nome">Gerenciar Empresa</div>
        <div className="link" onClick={() => navigate('/criar-usuario')}>Criar Usuários</div>
        <div className="descricao">Adicionar Usuários</div>
        <div className="link" onClick={() => navigate('/editar-usuario')}>Editar Usuários</div>
        <div className="descricao">Altera informações de Usuários</div>
        <div className="link ativo">Gerenciar Empresa</div>
        <div className="descricao">Gerência empresas</div>
        <div className="link" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Sair</div>
      </div>
      <div className="conteudo-principal">
        <h1 className="titulo-pagina">Gerenciar Empresas</h1>
        <form className="formulario-usuario" onSubmit={handleBuscar} style={{ marginBottom: 32 }}>
          <div className="form-grid-duas-colunas">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="busca">Buscar empresa pelo nome</label>
              <input className="form-input" type="text" id="busca" placeholder="Buscar empresa pelo nome" value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
          </div>
          <button className="botao-salvar" type="submit">Buscar</button>
        </form>
        <div className="lista-empresas">
          {empresas.map(empresa => (
            <div key={empresa.id_empresa} className={`empresa-item${editandoId === empresa.id_empresa ? ' selecionada' : ''}`} onClick={() => selecionarEmpresa(empresa)}>
              {empresa.nome}
            </div>
          ))}
          {empresas.length === 0 && <div style={{textAlign: 'center', color: '#888'}}>Nenhuma empresa encontrada.</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <button type="button" className="botao-salvar" style={{ width: 120 }} onClick={voltarPagina} disabled={pagina === 1}>Anterior</button>
          <span style={{ alignSelf: 'center', fontWeight: 600 }}>Página {pagina} de {totalPaginas}</span>
          <button type="button" className="botao-salvar" style={{ width: 120 }} onClick={avancarPagina} disabled={pagina === totalPaginas}>Próxima</button>
        </div>
        {erro && <div className="error-message">{erro}</div>}
        {mensagem && <div className="success-message">{mensagem}</div>}
        <form className="formulario-usuario" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{editandoId ? 'Editar Empresa' : 'Criar Nova Empresa'}</h2>
          <div className="form-grid-duas-colunas">
            <div className="form-group col-span-2">
              <label className="form-label" htmlFor="nome">Nome</label>
              <input className="form-input" type="text" id="nome" name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required maxLength={55} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tipo">Tipo</label>
              <input className="form-input" type="text" id="tipo" name="tipo" placeholder="Tipo" value={form.tipo} onChange={handleChange} required maxLength={30} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="telefone">Telefone</label>
              <input className="form-input" type="text" id="telefone" name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} required maxLength={20} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cnpj">CNPJ</label>
              <input className="form-input" type="text" id="cnpj" name="cnpj" placeholder="CNPJ" value={form.cnpj} onChange={handleChange} required maxLength={18} />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label" htmlFor="endereco">Endereço</label>
              <input className="form-input" type="text" id="endereco" name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} required maxLength={55} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cep">CEP</label>
              <input className="form-input" type="text" id="cep" name="cep" placeholder="CEP" value={form.cep} onChange={handleChange} required maxLength={10} />
            </div>
          </div>
          <div className="botoes-empresa">
            <button className="botao-salvar" type="submit" disabled={loading}>{loading ? 'Salvando...' : (editandoId ? 'Salvar Alterações' : 'Criar Empresa')}</button>
            {editandoId && <button className="botao-cancelar" type="button" onClick={limparFormulario}>Cancelar</button>}
          </div>
        </form>
      </div>
    </div>
  );
} 