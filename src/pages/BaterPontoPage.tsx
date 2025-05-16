/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, List, ListItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { api } from '../config/api';
// Importe o componente de mapa de sua preferência, aqui usarei um placeholder
// Para produção, use algo como @react-google-maps/api ou react-leaflet

function CentralizarMapa({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

const BaterPontoPage = () => {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [pontos, setPontos] = useState<any[]>([]);
  const [horasTrabalhadas, setHorasTrabalhadas] = useState('00:00');
  const [localizacao, setLocalizacao] = useState({
    lat: -21.9862,
    lng: -47.8797,
    endereco: 'Estrada Municipal Paulo Eduardo de Almeida, CEP: 13 - 565-820 - Prado, São Carlos - SP, 13565-820',
  });
  const [usuario, setUsuario] = useState<{ nome: string; cargo: string }>({ nome: '', cargo: '' });
  const navigate = useNavigate();

  // Função para buscar pontos do dia
  const carregarPontos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${api.baseURL}${api.endpoints.clockInToday}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.registroPonto && response.data.registroPonto.pontos) {
        setPontos(response.data.registroPonto.pontos);
      } else {
        setPontos([]);
      }
    } catch (error) {
      setPontos([]);
    }
  };

  // Função para buscar tempo trabalhado do dia
  const carregarTempoTrabalhado = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${api.baseURL}${api.endpoints.workTime}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const h = response.data.horasTrabalhadas?.toString().padStart(2, '0') || '00';
      const m = response.data.minutosTrabalhados !== undefined
        ? Math.floor(response.data.minutosTrabalhados).toString().padStart(2, '0')
        : '00';
      setHorasTrabalhadas(`${h}:${m}`);
    } catch (error) {
      setHorasTrabalhadas('00:00');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get(`${api.baseURL}${api.endpoints.employeeProfile}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsuario({
          nome: response.data.user.nome,
          cargo: response.data.user.cargo || ''
        });
      } catch (error) {
        setUsuario({ nome: '', cargo: '' });
      }
    };
    fetchUsuario();
    carregarPontos(); // Carrega pontos ao abrir a página
    carregarTempoTrabalhado(); // Carrega tempo trabalhado ao abrir a página
  }, []);

  const recarregarLocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Coordenadas:', lat, lng);

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            console.log('Endereço retornado:', data);
            setLocalizacao({
              lat,
              lng,
              endereco: data.display_name || `Lat: ${lat}, Lng: ${lng}`
            });

          } catch (error) {
            setLocalizacao({
              lat,
              lng,
              endereco: `Lat: ${lat}, Lng: ${lng}`
            });
          }
        },
        (error) => {
          alert('Não foi possível obter a localização: ' + error.message);
        }
      );
    } else {
      alert('Geolocalização não é suportada pelo seu navegador.');
    }
  };

  const baterPonto = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post(`${api.baseURL}${api.endpoints.clockIn}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await carregarPontos(); // Atualiza lista após bater ponto
      await carregarTempoTrabalhado(); // Atualiza tempo trabalhado após bater ponto
      alert('Ponto batido!');
    } catch (error) {
      alert('Erro ao bater ponto!');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#111' }}>
      {/* Menu lateral */}
      <Box sx={{ width: 220, bgcolor: '#3de6d1', p: 2, borderRadius: 3, m: 2, height: 'fit-content' }}>
        {usuario.cargo && (
          <Typography variant="subtitle2" sx={{ color: '#111', fontWeight: 700 }}>{usuario.cargo}</Typography>
        )}
        <Typography variant="subtitle1" sx={{ color: '#111', fontWeight: 700, mb: 0 }}>{usuario.nome}</Typography>
        <Typography variant="body2" sx={{ color: '#111', mb: 1, cursor: 'pointer' }} onClick={() => navigate('/dados')}>Usuário</Typography>
        <Typography variant="caption" sx={{ color: '#1e8888', mb: 1, ml: 1, display: 'block' }}>Ver meus dados de usuário.</Typography>
        <Typography variant="body2" sx={{ color: '#111', mb: 1, cursor: 'pointer' }}>Meus pontos</Typography>
        <Typography variant="caption" sx={{ color: '#1e8888', mb: 1, ml: 1, display: 'block' }}>Ver pontos/carga horária.</Typography>
        <Typography variant="body2" sx={{ color: '#111', mb: 1, cursor: 'pointer', fontWeight: 700 }}>Bater Ponto</Typography>
        <Typography variant="caption" sx={{ color: '#1e8888', mb: 1, ml: 1, display: 'block' }}>Marcar horário de entrada/saída</Typography>
        <Typography
          variant="body2"
          sx={{ color: '#111', mt: 2, cursor: 'pointer' }}
          onClick={logout}
        >
          Sair
        </Typography>
      </Box>

      {/* Centro - Mapa e localização */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Button
          variant="contained"
          sx={{ bgcolor: '#3de6d1', color: '#111', fontWeight: 700, mb: 3, boxShadow: 3, '&:hover': { bgcolor: '#2bc9b6' } }}
          onClick={recarregarLocalizacao}
        >
          Recarregar Localização
        </Button>
        <MapContainer center={[localizacao.lat, localizacao.lng]} zoom={16} style={{ height: 400, width: 400 }}>
          <CentralizarMapa lat={localizacao.lat} lng={localizacao.lng} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[localizacao.lat, localizacao.lng]}>
            <Popup>
              Você está aqui!
            </Popup>
          </Marker>
        </MapContainer>
        <Typography sx={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 700 }}>
          {localizacao.endereco}
        </Typography>
      </Box>

      {/* Direita - Bater ponto, horário, pontos batidos */}
      <Box sx={{ width: 350, bgcolor: '#3de6d1', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 500, mb: 2, textAlign: 'center' }}>
          Bem-vindo {usuario.nome}
        </Typography>
        {usuario.cargo && (
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 400, mb: 2, textAlign: 'center' }}>
            {usuario.cargo}
          </Typography>
        )}
        <Box sx={{ bgcolor: '#fff', color: '#111', borderRadius: 2, px: 2, py: 1, mb: 3, fontWeight: 700, fontSize: 18 }}>
          {horaAtual.toLocaleTimeString('pt-BR')}
        </Box>
        <Button
          variant="contained"
          sx={{ bgcolor: '#111', color: '#fff', fontWeight: 700, fontSize: 32, py: 2, boxShadow: 4, mb: 4, '&:hover': { bgcolor: '#222' } }}
          fullWidth
          onClick={baterPonto}
        >
          Bater Ponto
        </Button>
        <Typography sx={{ color: '#111', fontWeight: 500, mb: 1, mt: 2, fontSize: 18 }}>Pontos Batidos</Typography>
        <Paper elevation={6} sx={{ bgcolor: '#111', color: '#fff', borderRadius: 2, mb: 3, width: '100%', p: 2 }}>
          <List>
            {pontos.length === 0 && (
              <ListItem sx={{ color: '#fff', fontWeight: 400, fontSize: 16, p: 0, mb: 1 }}>
                Nenhum ponto registrado hoje.
              </ListItem>
            )}
            {pontos.map((p, i) => (
              <ListItem key={p.id_ponto || i} sx={{ color: '#fff', fontWeight: 700, fontSize: 16, p: 0, mb: 1 }}>
                {new Date(p.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {p.localizacao?.length > 25 ? p.localizacao.slice(0, 25) + '...' : p.localizacao}
              </ListItem>
            ))}
          </List>
        </Paper>
        <Typography sx={{ color: '#111', fontWeight: 500, mb: 1, fontSize: 18 }}>Horas Trabalhadas</Typography>
        <Paper elevation={6} sx={{ bgcolor: '#111', color: '#fff', borderRadius: 2, width: '100%', p: 2, textAlign: 'center', fontWeight: 700, fontSize: 22 }}>
          {horasTrabalhadas}
        </Paper>
      </Box>
    </Box>
  );
};

export default BaterPontoPage; 