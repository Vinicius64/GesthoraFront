import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Create a theme instance
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
                <Route path="/" element={<div>Home Page</div>} />
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
                <Route path="/confirmar-codigo" element={<ConfirmarCodigoPage />} />
                <Route path="/alterar-senha" element={<AlterarSenhaPage />} />
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
