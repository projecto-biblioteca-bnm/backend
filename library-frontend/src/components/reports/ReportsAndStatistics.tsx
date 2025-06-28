import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaBook, FaUsers, FaTasks, FaChartBar, FaFileAlt, FaDownload, 
    FaClock, FaChartLine, FaChartPie, FaFileExport, FaSync
} from 'react-icons/fa';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    subtitle?: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle, color }) => (
    <div className={`p-6 rounded-lg shadow-lg bg-gradient-to-br ${color}`}>
        <div className="flex items-center">
            <div className="mr-4 text-white text-3xl">{icon}</div>
            <div>
                <p className="text-white text-lg font-semibold">{title}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
                {subtitle && <p className="text-white text-sm opacity-90">{subtitle}</p>}
            </div>
        </div>
    </div>
);

export default function ReportsAndStatistics() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalReaders: 0,
        activeLoans: 0,
        overdueLoans: 0,
        totalRequests: 0,
        pendingRequests: 0,
        totalReservations: 0,
        activeReservations: 0,
        availableCopies: 0,
        totalCopies: 0
    });
    const [loans, setLoans] = useState([]);
    const [books, setBooks] = useState([]);
    const [readers, setReaders] = useState([]);
    const [requests, setRequests] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [booksRes, readersRes, loansRes, requestsRes, reservationsRes] = await Promise.all([
                axios.get('http://localhost:3000/api/book'),
                axios.get('http://localhost:3000/api/users'),
                axios.get('http://localhost:3000/api/loan'),
                axios.get('http://localhost:3000/api/request'),
                axios.get('http://localhost:3000/api/reservation')
            ]);

            const booksData = booksRes.data;
            const readersData = readersRes.data.filter((u: any) => u.user_type === 'Reader');
            const loansData = loansRes.data;
            const requestsData = requestsRes.data;
            const reservationsData = reservationsRes.data;

            setBooks(booksData);
            setReaders(readersData);
            setLoans(loansData);
            setRequests(requestsData);
            setReservations(reservationsData);

            // Calculate statistics
            const totalCopies = booksData.reduce((sum: number, book: any) => 
                sum + (book.BookItem?.length || 0), 0);
            const availableCopies = booksData.reduce((sum: number, book: any) => 
                sum + (book.BookItem?.filter((item: any) => item.status === 'Available').length || 0), 0);
            const activeLoans = loansData.filter((loan: any) => loan.status === 'Loaned').length;
            const overdueLoans = loansData.filter((loan: any) => {
                if (loan.status !== 'Loaned') return false;
                return new Date(loan.due_date) < new Date();
            }).length;
            const pendingRequests = requestsData.filter((req: any) => req.status === 'Pending').length;

            setStats({
                totalBooks: booksData.length,
                totalReaders: readersData.length,
                activeLoans,
                overdueLoans,
                totalRequests: requestsData.length,
                pendingRequests,
                totalReservations: reservationsData.length,
                activeReservations: reservationsData.filter((r: any) => r.status === 'Active').length,
                availableCopies,
                totalCopies
            });

        } catch (err) {
            setError('Falha ao carregar os dados estatísticos.');
        } finally {
            setLoading(false);
        }
    };

    const getPopularCategories = () => {
        const categoryCount: { [key: string]: number } = {};
        books.forEach((book: any) => {
            if (book.Category?.name) {
                categoryCount[book.Category.name] = (categoryCount[book.Category.name] || 0) + 1;
            }
        });
        return Object.entries(categoryCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    };

    const getRecentActivity = () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const recentLoans = loans.filter((loan: any) => 
            new Date(loan.created_at) >= thirtyDaysAgo
        ).length;
        
        const recentRequests = requests.filter((req: any) => 
            new Date(req.created_at) >= thirtyDaysAgo
        ).length;
        
        const recentReservations = reservations.filter((res: any) => 
            new Date(res.created_at) >= thirtyDaysAgo
        ).length;

        return { recentLoans, recentRequests, recentReservations };
    };

    const generateReport = (reportType: string) => {
        setSelectedReport(reportType);
        setShowReportModal(true);
    };

    const exportReport = (format: string) => {
        alert(`Relatório "${selectedReport}" exportado em formato ${format.toUpperCase()}`);
        setShowReportModal(false);
    };

    const recentActivity = getRecentActivity();
    const popularCategories = getPopularCategories();

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-full">
                <div className="text-center py-12">
                    <div className="text-gray-500">Carregando estatísticas...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-50 min-h-full">
                <div className="text-center py-12">
                    <div className="text-red-500">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Relatórios e Estatísticas</h1>
                        <p className="text-gray-600">
                            Dashboard completo com análises e relatórios da biblioteca.
                        </p>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <FaSync />
                        Atualizar Dados
                    </button>
                </div>
            </div>

            {/* Main Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<FaBook />}
                    title="Total de Obras"
                    value={stats.totalBooks}
                    subtitle={`${stats.totalCopies} exemplares`}
                    color="from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={<FaUsers />}
                    title="Total de Leitores"
                    value={stats.totalReaders}
                    subtitle="Utilizadores registados"
                    color="from-green-500 to-green-600"
                />
                <StatCard
                    icon={<FaTasks />}
                    title="Empréstimos Ativos"
                    value={stats.activeLoans}
                    subtitle={`${stats.overdueLoans} em atraso`}
                    color="from-yellow-500 to-yellow-600"
                />
                <StatCard
                    icon={<FaFileAlt />}
                    title="Pedidos Pendentes"
                    value={stats.pendingRequests}
                    subtitle={`${stats.totalRequests} total`}
                    color="from-purple-500 to-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Availability Overview */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <FaChartBar className="mr-2" />
                        Visão Geral da Disponibilidade
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.availableCopies}</div>
                            <div className="text-sm text-green-600">Exemplares Disponíveis</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{stats.totalCopies - stats.availableCopies}</div>
                            <div className="text-sm text-red-600">Exemplares Emprestados</div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Taxa de Disponibilidade</span>
                            <span>{Math.round((stats.availableCopies / stats.totalCopies) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(stats.availableCopies / stats.totalCopies) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <FaClock className="mr-2" />
                        Atividade Recente (30 dias)
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Novos Empréstimos</span>
                            <span className="font-semibold">{recentActivity.recentLoans}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Novos Pedidos</span>
                            <span className="font-semibold">{recentActivity.recentRequests}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Novas Reservas</span>
                            <span className="font-semibold">{recentActivity.recentReservations}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Popular Categories */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <FaChartPie className="mr-2" />
                        Categorias Mais Populares
                    </h2>
                    <div className="space-y-4">
                        {popularCategories.map((category, index) => (
                            <div key={index} className="flex items-center">
                                <span className="text-lg font-semibold text-gray-700 w-8">{index + 1}.</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-md font-medium text-gray-800">{category.name}</span>
                                        <span className="text-sm font-semibold text-gray-600">{category.count} obras</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full" 
                                            style={{ width: `${(category.count / Math.max(...popularCategories.map(c => c.count))) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reports Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <FaFileExport className="mr-2" />
                        Gerar Relatórios
                    </h2>
                    <div className="space-y-3">
                        <button
                            onClick={() => generateReport('Relatório de Empréstimos')}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md"
                        >
                            <FaTasks className="inline mr-2 text-blue-500" />
                            Relatório de Empréstimos
                        </button>
                        <button
                            onClick={() => generateReport('Catálogo Completo')}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md"
                        >
                            <FaBook className="inline mr-2 text-green-500" />
                            Catálogo Completo
                        </button>
                        <button
                            onClick={() => generateReport('Atividade dos Leitores')}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md"
                        >
                            <FaUsers className="inline mr-2 text-purple-500" />
                            Atividade dos Leitores
                        </button>
                        <button
                            onClick={() => generateReport('Relatório Financeiro')}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md"
                        >
                            <FaChartBar className="inline mr-2 text-orange-500" />
                            Relatório Financeiro
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Export Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Exportar Relatório</h3>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <p className="text-gray-600 mb-4">
                            Selecione o formato para exportar o relatório "{selectedReport}":
                        </p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => exportReport('pdf')}
                                className="w-full flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                            >
                                <FaFileAlt />
                                Exportar como PDF
                            </button>
                            <button
                                onClick={() => exportReport('excel')}
                                className="w-full flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                            >
                                <FaDownload />
                                Exportar como Excel
                            </button>
                            <button
                                onClick={() => exportReport('csv')}
                                className="w-full flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                            >
                                <FaDownload />
                                Exportar como CSV
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}