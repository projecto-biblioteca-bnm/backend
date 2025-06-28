'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../app/globals.css';
import { FaWhatsapp, FaInstagram, FaFacebook, FaUserCog, FaUserTie, FaUserShield, FaLock } from 'react-icons/fa';
import { FiMoreVertical, FiInfo, FiSettings, FiLogOut, FiMail, FiPhone } from 'react-icons/fi';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { createContext, useContext } from 'react';

const roles = [
  {
    key: 'TechnicalStaff',
    label: 'Funcionário Técnico (TI)',
    color: 'bg-green-500',
    icon: <FaUserCog size={24} />,
  },
  {
    key: 'ChefeDeReparticao',
    label: 'Chefe de Repartição',
    color: 'bg-orange-500',
    icon: <FaUserTie size={24} />,
  },
  {
    key: 'ChefeDeDepartamento',
    label: 'Chefe de Departamento',
    color: 'bg-red-500',
    icon: <FaUserShield size={24} />,
  },
];

export default function SelectProfile() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<'welcome' | 'about' | 'settings'>('welcome');
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const [accessDenied, setAccessDenied] = useState(false);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (roleKey: string) => {
    const userType = localStorage.getItem("user_type");
    if (!userType) {
      setAccessDenied(true);
      return;
    }
    
    console.log("User type from localStorage:", userType);
    console.log("Selected role:", roleKey);
    
    if (userType === roleKey) {
      console.log("Role matches, redirecting...");
      
      if (roleKey === "TechnicalStaff") {
        router.push("/dashboard/tecnico");
      } else if (roleKey === "ChefeDeReparticao") {
        router.push("/dashboard/chefe-reparticao");
      } else if (roleKey === "ChefeDeDepartamento") {
        router.push("/dashboard/chefe-departamento");
      }
    } else {
      console.log("Role mismatch, access denied");
      setAccessDenied(true);
    }
  };

  // Funções de menu
  const handleSaibaMais = () => {
    setView('about');
    setMenuOpen(false);
  };
  const handleDefinicoes = () => {
    setView('settings');
    setMenuOpen(false);
  };
  const handleSair = () => {
    // Limpa o localStorage/token se necessário
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="bg-blue-600 text-white p-4 text-xl font-bold relative rounded-t-2xl">
        Sistema de Gestão da Biblioteca BNM
        <div className="absolute top-4 right-4 z-50" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-full hover:bg-blue-700 focus:outline-none"
            aria-label="Abrir menu"
          >
            <FiMoreVertical size={24} color="white" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full w-48 bg-white rounded-lg shadow-lg py-2 flex flex-col">
              <button
                onClick={handleSaibaMais}
                className="flex items-center px-4 py-2 text-gray-900 hover:bg-gray-100"
              >
                <FiInfo className="mr-2" />
                Saiba Mais
              </button>
              <button
                onClick={handleDefinicoes}
                className="flex items-center px-4 py-2 text-gray-900 hover:bg-gray-100"
              >
                <FiSettings className="mr-2" />
                Definições
              </button>
              <button
                onClick={handleSair}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                <FiLogOut className="mr-2" />
                Sair
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 bg-white p-4 flex flex-col gap-4">
          {roles.map((role) => (
            <button
              key={role.key}
              className={`flex items-center gap-2 p-4 rounded text-white text-lg font-semibold shadow ${role.color} hover:opacity-80 transition`}
              onClick={() => handleSelect(role.key)}
            >
              {role.icon}
              {role.label}
            </button>
          ))}
        </aside>
        <main className="flex-1 flex flex-col items-center justify-center">
          {accessDenied && (
            <div className="bg-white border border-red-300 rounded-lg shadow p-8 mb-6 flex flex-col items-center">
              <FaLock className="text-5xl text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">Acesso Não Permitido</h2>
              <p className="text-gray-600">Você não tem permissão para acessar este perfil.</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setAccessDenied(false)}
              >
                Fechar
              </button>
            </div>
          )}
          <div className="bg-white rounded-lg shadow border p-8 w-full max-w-4xl text-left">
            {view === 'welcome' && (
              <>
                <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">
                  Bem-vindo ao Sistema de Gestão da BNM!
                </h2>
                <p className="mb-6 text-gray-600 text-center">
                  Por favor, selecione um perfil de acesso na barra lateral para visualizar as funcionalidades disponíveis.
                </p>
                <div className="bg-gray-100 rounded-lg p-8 text-2xl font-semibold text-gray-500 text-center">
                  Sistema de Gestão
                </div>
              </>
            )}
            {view === 'about' && (
              <>
                <h2 className="text-xl font-bold mb-2 text-gray-900">Saiba Mais sobre o Sistema</h2>
                <p className="mb-4 text-gray-900">
                  Bem-vindo à seção "Saiba Mais" do Sistema de Gestão da Biblioteca Nacional de Moçambique (BNM). Aqui, você pode encontrar informações adicionais sobre o nosso sistema, a missão da biblioteca e como estamos a trabalhar para melhorar a sua experiência.
                </p>
                <h3 className="font-bold mb-1 text-gray-900">Sobre o Sistema</h3>
                <p className="mb-4 text-gray-900">
                  Este sistema foi desenvolvido para otimizar a gestão do acervo da BNM, facilitando o registo, catalogação, empréstimo e devolução de obras. Com funcionalidades avançadas de pesquisa e relatórios, o nosso objetivo é tornar a gestão da biblioteca mais eficiente e acessível para todos os funcionários e leitores.
                </p>
                <h3 className="font-bold mb-1 text-gray-900">Nossa Missão</h3>
                <p className="mb-4 text-gray-900">
                  A missão da Biblioteca Nacional de Moçambique é preservar o património documental do país, promover a leitura e o acesso à informação, e apoiar a pesquisa e o desenvolvimento cultural. Acreditamos que um sistema de gestão moderno é essencial para cumprir esta missão na era digital.
                </p>
                <h3 className="font-bold mb-1 text-gray-900">Contactos</h3>
                <div className="flex items-center mb-1 text-gray-900"><FiMail className="mr-2" /> info@bnm.gov.mz</div>
                <div className="flex items-center text-gray-900"><FiPhone className="mr-2" /> +258 21 000 000</div>
              </>
            )}
            {view === 'settings' && (
              <>
                <h2 className="text-xl font-bold mb-2 text-gray-900">Definições do Sistema</h2>
                <p className="mb-4 text-gray-900">Aqui você pode ajustar as configurações do sistema para personalizar a sua experiência.</p>
                <form className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium text-gray-900">Idioma:</label>
                    <select
                      className="w-full border rounded p-2 text-gray-900 bg-white"
                      value={i18n.language}
                      onChange={e => i18n.changeLanguage(e.target.value)}
                    >
                      <option>Português</option>
                      <option>Inglês</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-900">Tema:</label>
                    <select
                      className="w-full border rounded p-2 text-gray-900 bg-white"
                      value={theme}
                      onChange={e => setTheme(e.target.value)}
                    >
                      <option>Claro</option>
                      <option>Escuro</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
                    onClick={() => alert(`Idioma: ${i18n.language}, Tema: ${theme}`)}
                  >
                    Guardar Definições
                  </button>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
      <footer className="bg-[#1a2233] text-white p-4 flex flex-col items-center text-xs">
        <div className="flex gap-4 mb-2">
          <a href="#" className="hover:text-gray-400" aria-label="WhatsApp">
            <FaWhatsapp size={20} />
          </a>
          <a href="#" className="hover:text-gray-400" aria-label="Instagram">
            <FaInstagram size={20} />
          </a>
          <a href="#" className="hover:text-gray-400" aria-label="Facebook">
            <FaFacebook size={20} />
          </a>
        </div>
        <div className="text-center">
          © 2025 Biblioteca Nacional de Moçambique. Todos os direitos reservados.<br />
          Desenvolvido com paixão pela leitura.
        </div>
      </footer>
    </div>
  );
}
