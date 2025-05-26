import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Layout from './components/Layout';
import LoginPage from './pages/Login/LoginPage';
import ResetarSenhaPage from './pages/ResetarSenha/ResetarSenhaPage';
import BaterPontoPage from './pages/BaterPonto/BaterPontoPage';
import RotaPrivada from './components/RotaPrivada';
import UsuarioPage from './pages/Usuario/UsuarioPage';
import CriarUsuarioPage from './pages/CriarUsuario/CriarUsuarioPage';
import ConfirmarCodigoPage from './pages/ResetarSenha/ConfirmarCodigoPage';
import AlterarSenhaPage from './pages/ResetarSenha/AlterarSenhaPage';
import EditarUsuarioPage from './pages/EditarUsuario/EditarUsuarioPage';
import GerenciarEmpresaPage from './pages/GerenciarEmpresa/GerenciarEmpresaPage';
import SolicitacoesPage from './pages/Gestor/GestorPage';
import DashboardsPage from './pages/Gestor/DashboardsPage';
import EditarFuncionarioGestorPage from './pages/Gestor/EditarFuncionarioGestorPage';
import PontosFuncionarioPage from './pages/Funcionario/PontosFuncionarioPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/solicitacoes" element={<SolicitacoesPage />} />
                <Route path="/dashboards" element={<DashboardsPage />} />
                <Route path="/resetar-senha" element={<ResetarSenhaPage />} />
                <Route
                  path="/bater-ponto"
                  element={
                    <RotaPrivada>
                      <BaterPontoPage />
                    </RotaPrivada>
                  }
                />
                <Route path="/dados" element={<UsuarioPage />} />
                <Route
                  path="/criar-usuario"
                  element={
                    <RotaPrivada>
                      <CriarUsuarioPage />
                    </RotaPrivada>
                  }
                />
                <Route
                  path="/editar-usuario"
                  element={
                    <RotaPrivada>
                      <EditarUsuarioPage />
                    </RotaPrivada>
                  }
                />
                <Route path="/confirmar-codigo" element={<ConfirmarCodigoPage />} />
                <Route path="/alterar-senha" element={<AlterarSenhaPage />} />
                <Route
                  path="/gerenciar-empresa"
                  element={
                    <RotaPrivada>
                      <GerenciarEmpresaPage />
                    </RotaPrivada>
                  }
                />
                <Route
                  path="/dados-funcionarios"
                  element={
                    <RotaPrivada>
                      <EditarFuncionarioGestorPage />
                    </RotaPrivada>
                  }
                />
                <Route
                  path="/meus-pontos"
                  element={
                    <RotaPrivada>
                      <PontosFuncionarioPage />
                    </RotaPrivada>
                  }
                />
                {/* Add more routes here */}
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
