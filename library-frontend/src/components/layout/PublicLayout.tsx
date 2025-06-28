'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaSearch, FaBars, FaTimes, FaEllipsisV, FaSignOutAlt, FaInfoCircle } from 'react-icons/fa';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Visualizar Catálogo Digital', href: '/public/catalogo', icon: '📖' },
    { name: 'Jornal Notícias', href: '/public/noticias', icon: '📰' },
    { name: 'Notificações', href: '/public/notificacoes', icon: '🔔' },
    { name: 'Contactos', href: '/public/contactos', icon: '📞' },
    { name: 'Localização', href: '/public/localizacao', icon: '📍' },
    { name: 'Repositórios Científicos', href: '/public/repositorios', icon: '🔬' },
    { name: 'Pergunte ao Bibliotecário Virtual', href: '/public/virtual-librarian', icon: '🤖' },
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className={`bg-white text-gray-800 w-72 fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 shadow-lg md:relative md:translate-x-0 md:shadow-none`}>
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-blue-600">Menu Principal</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1">
            <FaTimes className="text-gray-600 h-5 w-5"/>
          </button>
        </div>
        <nav className="p-4">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} onClick={() => setIsSidebarOpen(false)} className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-all duration-200 text-base font-medium ${pathname === item.href ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-100'}`}>
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white text-gray-800 p-4 flex justify-between items-center border-b shadow-sm">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 mr-4 md:hidden">
              <FaBars className="h-6 w-6"/>
            </button>
            <h1 className="text-2xl font-bold text-blue-600 hidden sm:block">Biblioteca Nacional de Moçambique</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="search" placeholder="Pesquisar..." className="pl-10 pr-4 py-2 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 w-48 lg:w-64" />
            </div>

            {/* Three-dot menu */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-100">
                <FaEllipsisV className="text-gray-600 h-5 w-5"/>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                  <Link href="/public/sobre" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FaInfoCircle/> Sobre
                  </Link>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t">
                    <FaSignOutAlt/> Sair
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-200 text-gray-600 text-center p-4 text-sm border-t">
          <p>&copy; {new Date().getFullYear()} Biblioteca Nacional de Moçambique. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicLayout; 