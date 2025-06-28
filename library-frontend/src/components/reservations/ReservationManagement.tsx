import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';

interface Reservation {
    id: number;
    book_item_id: number;
    reader_id: number;
    reserved_at: string;
    expiration_date: string | null;
    status: string;
    Reader?: { User: { first_name: string; last_name: string } };
    BookItem?: { Book: { title: string } };
}

interface Reader {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

interface BookItem {
    id: number;
    Book: { title: string };
}

export default function ReservationManagement() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [readers, setReaders] = useState<Reader[]>([]);
    const [bookItems, setBookItems] = useState<BookItem[]>([]);
    const [form, setForm] = useState({ reader_id: '', book_item_id: '', expiration_date: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpirationDate, setEditingExpirationDate] = useState<number | null>(null);
    const [tempExpirationDate, setTempExpirationDate] = useState('');

    useEffect(() => {
        fetchReservations();
        fetchReaders();
        fetchBookItems();
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/reservation');
            setReservations(res.data);
        } catch (err) {
            setError('Falha ao buscar reservas.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReaders = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/users');
            setReaders(res.data.filter((u: any) => u.user_type === 'Reader'));
        } catch (err) {
            setError('Falha ao buscar leitores.');
        }
    };

    const fetchBookItems = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/book');
            // Flatten all book items that are available
            const items: BookItem[] = [];
            res.data.forEach((book: any) => {
                if (book.BookItem) {
                    book.BookItem.forEach((item: any) => {
                        if (item.status === 'Available') {
                            items.push({ id: item.id, Book: { title: book.title } });
                        }
                    });
                }
            });
            setBookItems(items);
        } catch (err) {
            setError('Falha ao buscar exemplares de livros.');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleAddReservation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.reader_id || !form.book_item_id) {
            setError('Selecione o leitor e o exemplar do livro.');
            return;
        }
        try {
            await axios.post('http://localhost:3000/api/reservation', {
                reader_id: Number(form.reader_id),
                book_item_id: Number(form.book_item_id),
                expiration_date: form.expiration_date || null,
            });
            setForm({ reader_id: '', book_item_id: '', expiration_date: '' });
            setError('');
            setSuccess('Reserva criada com sucesso!');
            setShowForm(false);
            fetchReservations();
            fetchBookItems();
        } catch (err) {
            setError('Falha ao criar reserva.');
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await axios.patch(`http://localhost:3000/api/reservation/${id}`, { status: 'Active' });
            fetchReservations();
            setSuccess('Reserva aprovada!');
        } catch (err) {
            setError('Falha ao aprovar reserva.');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axios.patch(`http://localhost:3000/api/reservation/${id}`, { status: 'Canceled' });
            fetchReservations();
            setSuccess('Reserva rejeitada!');
        } catch (err) {
            setError('Falha ao rejeitar reserva.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja eliminar esta reserva?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/reservation/${id}`);
            fetchReservations();
            setSuccess('Reserva eliminada!');
        } catch (err) {
            setError('Falha ao eliminar reserva.');
        }
    };

    // Function to start editing expiration date
    const startEditExpirationDate = (reservation: Reservation) => {
        setEditingExpirationDate(reservation.id);
        setTempExpirationDate(reservation.expiration_date ? reservation.expiration_date.slice(0, 10) : '');
    };

    // Function to save expiration date edit
    const saveExpirationDateEdit = async () => {
        if (!editingExpirationDate) return;
        
        try {
            await axios.patch(`http://localhost:3000/api/reservation/${editingExpirationDate}`, {
                expiration_date: tempExpirationDate || null,
            });
            setSuccess('Data de expiração atualizada!');
            setEditingExpirationDate(null);
            setTempExpirationDate('');
            fetchReservations();
        } catch (err) {
            setError('Falha ao atualizar data de expiração.');
        }
    };

    // Function to cancel expiration date edit
    const cancelExpirationDateEdit = () => {
        setEditingExpirationDate(null);
        setTempExpirationDate('');
    };

    // Function to complete a reservation
    const handleComplete = async (id: number) => {
        try {
            await axios.patch(`http://localhost:3000/api/reservation/${id}`, { status: 'Completed' });
            fetchReservations();
            setSuccess('Reserva marcada como concluída!');
        } catch (err) {
            setError('Falha ao marcar reserva como concluída.');
        }
    };

    // Function to extend reservation expiration
    const handleExtend = async (reservation: Reservation) => {
        const newExpirationDate = prompt(
            `Estender data de expiração para a reserva.\nData atual: ${formatDate(reservation.expiration_date)}\n\nDigite a nova data (YYYY-MM-DD):`,
            reservation.expiration_date ? reservation.expiration_date.slice(0, 10) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        );
        
        if (!newExpirationDate) return;
        
        try {
            await axios.patch(`http://localhost:3000/api/reservation/${reservation.id}`, {
                expiration_date: newExpirationDate,
            });
            setSuccess('Data de expiração estendida!');
            fetchReservations();
        } catch (err) {
            setError('Falha ao estender data de expiração.');
        }
    };

    // Function to check if a reservation is expired
    const isExpired = (expirationDate: string | null) => {
        if (!expirationDate) return false;
        const today = new Date();
        const expiration = new Date(expirationDate);
        return today > expiration;
    };

    // Function to format date for display
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return dateString.slice(0, 10);
    };

    // Function to get status color
    const getStatusColor = (status: string, expirationDate: string | null) => {
        if (status === 'Completed') return 'text-green-600';
        if (status === 'Canceled') return 'text-red-600';
        if (status === 'Expired' || isExpired(expirationDate)) return 'text-red-600';
        if (status === 'Active') return 'text-blue-600';
        return 'text-yellow-600'; // Pending
    };

    // Function to translate status to Portuguese
    const translateStatus = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'Pendente';
            case 'Active':
                return 'Ativa';
            case 'Completed':
                return 'Concluída';
            case 'Canceled':
                return 'Cancelada';
            case 'Expired':
                return 'Expirada';
            default:
                return status;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-2xl font-bold mb-2">Gerir Reservas</h1>
            <p className="text-gray-600 mb-6">Gerencie as reservas de obras.</p>

            <div className="flex gap-4 mb-6">
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
                    onClick={() => setShowForm(!showForm)}
                >
                    <FaPlus /> Nova Reserva
                </button>
            </div>

            {/* Reservation Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">{reservations.length}</div>
                    <div className="text-sm text-gray-600">Total de Reservas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-yellow-600">
                        {reservations.filter(res => res.status === 'Pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pendentes</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">
                        {reservations.filter(res => res.status === 'Active').length}
                    </div>
                    <div className="text-sm text-gray-600">Ativas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-600">
                        {reservations.filter(res => res.status === 'Completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Concluídas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-red-600">
                        {reservations.filter(res => 
                            res.status === 'Canceled' || 
                            res.status === 'Expired' || 
                            isExpired(res.expiration_date)
                        ).length}
                    </div>
                    <div className="text-sm text-gray-600">Canceladas/Expiradas</div>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleAddReservation} className="mb-6 bg-white p-4 rounded shadow flex flex-col gap-4">
                    <div className="flex gap-4">
                        <select
                            name="reader_id"
                            value={form.reader_id}
                            onChange={handleInputChange}
                            className="border rounded px-3 py-2 flex-1"
                            required
                        >
                            <option value="">Selecione o Leitor</option>
                            {readers.map((reader) => (
                                <option key={reader.id} value={reader.id}>
                                    {reader.first_name} {reader.last_name}
                                </option>
                            ))}
                        </select>
                        <select
                            name="book_item_id"
                            value={form.book_item_id}
                            onChange={handleInputChange}
                            className="border rounded px-3 py-2 flex-1"
                            required
                        >
                            <option value="">Selecione o Livro</option>
                            {bookItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.Book.title}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            name="expiration_date"
                            value={form.expiration_date}
                            onChange={handleInputChange}
                            className="border rounded px-3 py-2 flex-1"
                            placeholder="Data de Expiração (opcional)"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Salvar</button>
                        <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={() => setShowForm(false)}>Cancelar</button>
                    </div>
                    {error && <div className="text-red-600">{error}</div>}
                    {success && <div className="text-green-600">{success}</div>}
                </form>
            )}

            <h2 className="text-xl font-semibold mb-4">Reservas</h2>
            {loading ? (
                <div className="text-gray-500">Carregando reservas...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Obra</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Leitor</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data Reserva</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data Expiração</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reservations.map((reservation) => (
                                <tr key={reservation.id} className={`hover:bg-gray-50 ${isExpired(reservation.expiration_date) && reservation.status !== 'Completed' && reservation.status !== 'Canceled' ? 'bg-red-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{reservation.BookItem?.Book.title || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{reservation.Reader ? `${reservation.Reader.User.first_name} ${reservation.Reader.User.last_name}` : '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(reservation.reserved_at)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingExpirationDate === reservation.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="date"
                                                    value={tempExpirationDate}
                                                    onChange={(e) => setTempExpirationDate(e.target.value)}
                                                    className="border rounded px-2 py-1 text-sm"
                                                />
                                                <button
                                                    onClick={saveExpirationDateEdit}
                                                    className="text-green-600 hover:text-green-800 text-sm"
                                                    title="Salvar"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={cancelExpirationDateEdit}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                    title="Cancelar"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className={`${isExpired(reservation.expiration_date) && reservation.status !== 'Completed' && reservation.status !== 'Canceled' ? 'text-red-600 font-semibold' : ''}`}>
                                                    {formatDate(reservation.expiration_date)}
                                                    {isExpired(reservation.expiration_date) && reservation.status !== 'Completed' && reservation.status !== 'Canceled' && (
                                                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">EXPIRADA</span>
                                                    )}
                                                </span>
                                                {reservation.status !== 'Completed' && reservation.status !== 'Canceled' && (
                                                    <button
                                                        onClick={() => startEditExpirationDate(reservation)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                        title="Editar data de expiração"
                                                    >
                                                        ✏️
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status, reservation.expiration_date)}`}>
                                            {translateStatus(reservation.status)}
                                            {isExpired(reservation.expiration_date) && reservation.status !== 'Completed' && reservation.status !== 'Canceled' && (
                                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">EXPIRADA</span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            {reservation.status === 'Pending' && (
                                                <>
                                                    <button 
                                                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded-md shadow-sm hover:bg-green-600" 
                                                        onClick={() => handleApprove(reservation.id)}
                                                        title="Aprovar Reserva"
                                                    >
                                                        <FaCheck size={12} /> Aprovar
                                                    </button>
                                                    <button 
                                                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs rounded-md shadow-sm hover:bg-red-600" 
                                                        onClick={() => handleReject(reservation.id)}
                                                        title="Rejeitar Reserva"
                                                    >
                                                        <FaTimes size={12} /> Rejeitar
                                                    </button>
                                                </>
                                            )}
                                            {reservation.status === 'Active' && (
                                                <>
                                                    <button 
                                                        className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded-md shadow-sm hover:bg-blue-600" 
                                                        onClick={() => handleComplete(reservation.id)}
                                                        title="Marcar como Concluída"
                                                    >
                                                        ✓ Concluir
                                                    </button>
                                                    <button 
                                                        className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white text-xs rounded-md shadow-sm hover:bg-yellow-600" 
                                                        onClick={() => handleExtend(reservation)}
                                                        title="Estender Data de Expiração"
                                                    >
                                                        ⏰ Estender
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-md shadow-sm hover:bg-gray-400" 
                                                onClick={() => handleDelete(reservation.id)}
                                                title="Eliminar Reserva"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
} 