import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarChefeDepartamento from '../../components/layout/SidebarChefeDepartamento';
import Topbar from '../../components/Topbar';
import Footer from '../../components/Footer';

// Re-used components
import ReaderManagement from '../../components/readers/ReaderManagement';
import BookManagement from '../../components/books/BookManagement';
import CategoryManagement from '../../components/categories/CategoryManagement';
import PublisherManagement from '../../components/publishers/PublisherManagement';
import LoanManagement from '../../components/loans/LoanManagement';
import ReservationManagement from '../../components/reservations/ReservationManagement';
import RequestManagement from '../../components/requests/RequestManagement';
import CatalogView from '../../components/catalog/CatalogView';
import BookSearch from '../../components/books/BookSearch';
import EventCalendar from '../../components/events/EventCalendar';
import ChangePassword from '../../components/auth/ChangePassword';
import VirtualLibrarian from '../../components/virtual-librarian/VirtualLibrarian';
import EventManagement from '../../components/events/EventManagement';
import ReportsAndStatistics from '../../components/reports/ReportsAndStatistics';

// Placeholder component for unimplemented views
const Placeholder = ({ title }) => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <div className="bg-white p-8 rounded-lg shadow border">
            <p className="text-center text-gray-500">
                O conteúdo para esta secção está em construção.
            </p>
        </div>
    </div>
);


export default function ChefeDepartamentoDashboard() {
    const [activeKey, setActiveKey] = useState('welcome');
    const router = useRouter();

    const handleSelect = (key) => {
        if (key === 'perfis') {
            router.push('/select-profile');
        } else {
            setActiveKey(key);
        }
    };

    const renderContent = () => {
        switch (activeKey) {
            // Shared with Chefe de Repartição
            case 'leitores': return <ReaderManagement />;
            case 'obras': return <BookManagement />;
            case 'categorias': return <CategoryManagement />;
            case 'editoras': return <PublisherManagement />;
            case 'emprestimos': return <LoanManagement />;
            case 'reservas': return <ReservationManagement />;
            case 'pedidos': return <RequestManagement />;
            case 'catalogo': return <CatalogView />;
            case 'pesquisar': return <BookSearch />;
            case 'consultar_eventos': return <EventCalendar />;
            case 'senha': return <ChangePassword />;
            case 'pergunta': return <VirtualLibrarian />;

            // New/Unique for Chefe de Departamento
            case 'gerir_eventos': return <EventManagement />;
            case 'relatorios': return <ReportsAndStatistics />;

            case 'welcome':
            default:
                return (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2 text-gray-900">
                                Bem-vindo ao Sistema de Gestão da BNM!
                            </h2>
                            <p className="mb-6 text-gray-600">
                                Por favor, selecione um perfil de acesso na barra lateral para visualizar as funcionalidades disponíveis.
                            </p>
                            <div className="bg-gray-100 rounded-lg p-8 text-2xl font-semibold text-gray-500 text-center">
                                Sistema de Gestão
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Topbar title="Sistema de Gestão da BNM - Chefe de Departamento" />
            <div className="flex flex-1">
                <SidebarChefeDepartamento activeKey={activeKey} onSelect={handleSelect} />
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
            <Footer />
        </div>
    );
} 