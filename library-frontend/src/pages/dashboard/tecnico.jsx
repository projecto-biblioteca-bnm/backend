import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Footer from '../../components/Footer';
import ReaderManagement from '../../components/readers/ReaderManagement';
import CatalogView from '../../components/catalog/CatalogView';
import BookSearch from '../../components/books/BookSearch';
import EventCalendar from '../../components/events/EventCalendar';
import ChangePassword from '../../components/auth/ChangePassword';
import VirtualLibrarian from '../../components/virtual-librarian/VirtualLibrarian';
import { FaLock } from 'react-icons/fa';

export default function DashboardTecnico() {
  const [allowed, setAllowed] = useState(null);
  const [activeMenu, setActiveMenu] = useState('welcome');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("user_type");

    if (!token) {
      setAllowed(false);
      return;
    }

    setAllowed(userType === "TechnicalStaff");
  }, []);

  const handleMenuSelect = (key) => {
    if (key === 'perfis') {
      router.push('/select-profile');
    } else {
      setActiveMenu(key);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'leitores':
        return <ReaderManagement />;
      case 'catalogo':
        return <CatalogView />;
      case 'pesquisar':
        return <BookSearch />;
      case 'eventos':
        return <EventCalendar />;
      case 'senha':
        return <ChangePassword />;
      case 'pergunta':
        return <VirtualLibrarian />;
      case 'welcome':
      default:
        return (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-center mb-2">
              Bem-vindo ao Sistema de Gestão da BNM!
            </h2>
            <p className="text-center text-gray-500 mb-8">
              Por favor, selecione um perfil de acesso na barra lateral para visualizar as funcionalidades disponíveis.
            </p>
            <div className="mx-auto w-72 h-40 bg-gray-100 rounded-lg flex items-center justify-center text-xl text-gray-500">
              Sistema de Gestão
            </div>
          </div>
        );
    }
  };

  if (allowed === null) return <div>Loading...</div>;

  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow flex flex-col items-center">
          <FaLock className="text-5xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Acesso Não Permitido</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar title="Sistema de Gestão da BNM - Funcionário Técnico" />
      <div className="flex flex-1 bg-gray-100">
        <Sidebar activeKey={activeMenu} onSelect={handleMenuSelect} />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
}
