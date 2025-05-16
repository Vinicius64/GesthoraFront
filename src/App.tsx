import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ResetarSenhaPage from './pages/ResetarSenhaPage';
import BaterPontoPage from './pages/BaterPontoPage';
import RotaPrivada from './components/RotaPrivada';
import UsuarioPage from './pages/UsuarioPage';
import CriarUsuarioPage from './pages/CriarUsuarioPage';

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
          <Route path="/resetar-senha" element={<ResetarSenhaPage />} />
          <Route
            path="/baterponto"
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
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<div>Home Page</div>} />
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
