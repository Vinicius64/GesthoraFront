/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { api } from '../../config/api';
import './BaterPontoPage.css';

function CentralizarMapa({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16);
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
    carregarPontos(); 
    carregarTempoTrabalhado(); 
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
      await axios.post(`${api.baseURL}${api.endpoints.clockIn}`, {
        localizacao: localizacao.endereco
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await carregarPontos(); 
      await carregarTempoTrabalhado(); 
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
    <div className="bater-ponto-container">
      {/* Menu lateral */}
      <div className="menu-lateral">
        {usuario.cargo && (
          <div className="cargo">{usuario.cargo}</div>
        )}
        <div className="nome">{usuario.nome}</div>
        <div className="link" onClick={() => navigate('/dados')}>Usuário</div>
        <div className="descricao">Ver meus dados de usuário.</div>
        <div className="link" onClick={() => navigate('/meus-pontos')}>Meus pontos</div>
        <div className="descricao">Ver pontos/carga horária.</div>
        <div className="link">Bater Ponto</div>
        <div className="descricao">Marcar horário de entrada/saída</div>
        <div className="link" onClick={logout}>Sair</div>
      </div>

      {/* Centro - Mapa e localização */}
      <div className="area-central">
        <button className="botao-localizacao" onClick={recarregarLocalizacao}>
          Recarregar Localização
        </button>
        <div className="mapa-container">
          <MapContainer style={{ height: '100%', width: '100%' }}>
            <CentralizarMapa lat={localizacao.lat} lng={localizacao.lng} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[localizacao.lat, localizacao.lng]}>
              <Popup>Você está aqui!</Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="endereco">{localizacao.endereco}</div>
      </div>

      {/* Direita - Bater ponto, horário, pontos batidos */}
      <div className="area-direita">
        <h1 className="titulo-bem-vindo">Bem-vindo {usuario.nome}</h1>
        {usuario.cargo && (
          <div className="subtitulo-cargo">{usuario.cargo}</div>
        )}
        <div className="relogio">{horaAtual.toLocaleTimeString('pt-BR')}</div>
        <button className="botao-bater-ponto" onClick={baterPonto}>
          Bater Ponto
        </button>
        <div className="titulo-secao">Pontos Batidos</div>
        <div className="lista-pontos">
          {pontos.length === 0 && (
            <div className="item-ponto">Nenhum ponto registrado hoje.</div>
          )}
          {pontos.map((p, i) => (
            <div key={p.id_ponto || i} className="item-ponto">
              {p.data_hora.split('T')[1]?.split('.')[0]?.substring(0, 5) || p.data_hora} - {p.localizacao?.length > 25 ? p.localizacao.slice(0, 25) + '...' : p.localizacao}
            </div>
          ))}
        </div>
        <div className="titulo-secao">Horas Trabalhadas</div>
        <div className="horas-trabalhadas">{horasTrabalhadas}</div>
      </div>
    </div>
  );
};

export default BaterPontoPage; 