import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiMoreVertical, FiInfo, FiSettings, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function Topbar({ title }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSair = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <header className="bg-blue-600 text-white flex items-center justify-between px-6 py-3 relative shadow-md">
      <h1 className="text-xl font-bold">{title}</h1>
      
      <div className="flex items-center gap-2">
        {/* Search Bar */}
        <div className="flex items-center">
            <div className={`flex items-center transition-all duration-300 ease-in-out ${searchOpen ? 'w-64' : 'w-0'}`}>
                {searchOpen && (
                    <div className="flex items-center bg-white rounded-full px-3 py-1.5 w-full">
                        <FiSearch className="text-gray-400 mr-2" size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar obras..."
                            className="bg-transparent text-gray-700 placeholder-gray-400 outline-none w-full text-sm"
                            autoFocus
                            onBlur={() => setSearchOpen(false)}
                        />
                    </div>
                )}
            </div>
            <button 
                onClick={() => setSearchOpen(!searchOpen)} 
                className="p-2 rounded-full hover:bg-blue-700 focus:outline-none transition-colors"
            >
                <FiSearch size={22} />
            </button>
        </div>

        {/* Three Dots Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-blue-700 focus:outline-none transition-colors"
            aria-label="Abrir menu"
          >
            <FiMoreVertical size={24} />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-full w-48 bg-white rounded-lg shadow-lg py-2 mt-1 z-50">
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-2 text-gray-900 hover:bg-gray-100 w-full text-left"
              >
                <FiInfo className="mr-2" />
                Saiba Mais
              </button>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-2 text-gray-900 hover:bg-gray-100 w-full text-left"
              >
                <FiSettings className="mr-2" />
                Definições
              </button>
              <button
                onClick={handleSair}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
              >
                <FiLogOut className="mr-2" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
