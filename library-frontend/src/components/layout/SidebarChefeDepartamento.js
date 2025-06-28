import React from 'react';
import {
  FaArrowLeft, FaUsers, FaBook, FaTags, FaBuilding, FaExchangeAlt, FaBookmark, FaBoxOpen, FaCalendar,
  FaBookOpen, FaSearch, FaCalendarAlt, FaKey, FaQuestionCircle, FaChartLine
} from 'react-icons/fa';

const sidebarItems = [
    { key: 'leitores', label: 'Gerir Leitores', icon: <FaUsers /> },
    { key: 'obras', label: 'Gerir Obras', icon: <FaBook /> },
    { key: 'categorias', label: 'Gerir Categorias', icon: <FaTags /> },
    { key: 'editoras', label: 'Gerir Editoras', icon: <FaBuilding /> },
    { key: 'emprestimos', label: 'Gerir Empréstimos', icon: <FaExchangeAlt /> },
    { key: 'reservas', label: 'Gerir Reservas', icon: <FaBookmark /> },
    { key: 'pedidos', label: 'Gerir Pedidos', icon: <FaBoxOpen /> },
    { key: 'gerir_eventos', label: 'Gerir Eventos', icon: <FaCalendar /> },
    { key: 'catalogo', label: 'Visualizar Catálogo', icon: <FaBookOpen /> },
    { key: 'pesquisar', label: 'Pesquisar Obra', icon: <FaSearch /> },
    { key: 'consultar_eventos', label: 'Consultar Eventos', icon: <FaCalendarAlt /> },
    { key: 'senha', label: 'Alterar Senha', icon: <FaKey /> },
    { key: 'pergunta', label: 'Pergunte ao Bibliotecário Virtual', icon: <FaQuestionCircle /> },
    { key: 'relatorios', label: 'Relatórios e Estatísticas', icon: <FaChartLine /> },
];

export default function SidebarChefeDepartamento({ activeKey, onSelect }) {
  return (
    <aside className="w-64 bg-white p-4 flex flex-col gap-2 shadow-lg">
      <button
        className="mb-4 px-4 py-2.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
        onClick={() => onSelect('perfis')}
      >
        <FaArrowLeft className="text-white" />
        Voltar aos Perfis
      </button>
      
      <div className="flex flex-col gap-2">
        {sidebarItems.map(item => (
          <button
            key={item.key}
            className={`flex items-center gap-3 px-4 py-2.5 rounded font-medium transition-all duration-200 text-sm
              ${activeKey === item.key
                ? item.key === 'pergunta'
                  ? 'bg-purple-600 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-gray-100'
              } 
              ${item.key === 'pergunta' 
                ? 'text-gray-700 hover:bg-purple-600 hover:text-white' 
                : 'text-gray-700 hover:bg-blue-600 hover:text-white'}`}
            onClick={() => onSelect(item.key)}
          >
            <span className="w-5 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
} 