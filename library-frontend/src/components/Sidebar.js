import { useState } from 'react';
import { FaUser, FaSearch, FaCalendarAlt, FaKey, FaQuestion, FaArrowLeft, FaBook } from 'react-icons/fa';

const sidebarItems = [
  { key: 'leitores', label: 'Gerir Leitores', icon: <FaUser /> },
  { key: 'catalogo', label: 'Visualizar Catálogo', icon: <FaBook /> },
  { key: 'pesquisar', label: 'Pesquisar Obra', icon: <FaSearch /> },
  { key: 'eventos', label: 'Consultar Eventos', icon: <FaCalendarAlt /> },
  { key: 'senha', label: 'Alterar Senha', icon: <FaKey /> },
  { key: 'pergunta', label: 'Pergunte ao Bibliotecário Virtual', icon: <FaQuestion /> },
];

export default function Sidebar({ activeKey, onSelect }) {
  return (
    <aside className="w-64 bg-white p-4 flex flex-col gap-2">
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
            className={`flex items-center gap-3 px-4 py-2.5 rounded font-medium transition-all duration-200
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
            <span className={`${
              activeKey === item.key
                ? 'text-white'
                : item.key === 'pergunta'
                ? 'group-hover:text-white text-gray-500'
                : 'group-hover:text-white text-gray-500'
            }`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
