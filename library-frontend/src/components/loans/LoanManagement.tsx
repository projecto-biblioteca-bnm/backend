import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaUndo, FaCheck, FaTrashAlt } from 'react-icons/fa';

interface Loan {
    id: number;
    reader_id: number;
    book_item_id: number;
    start_date: string;
    due_date: string;
    return_date: string | null;
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

interface Book {
    id: number;
    title: string;
    BookItem?: Array<{
        id: number;
        status: string;
    }>;
}

export default function LoanManagement() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [readers, setReaders] = useState<Reader[]>([]);
    const [bookItems, setBookItems] = useState<Book[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newLoan, setNewLoan] = useState({ reader_id: '', book_item_id: '', start_date: '', due_date: '' });
    const [formError, setFormError] = useState<string | null>(null);
    const [listError, setListError] = useState('A carregar empréstimos...');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingReturnDate, setEditingReturnDate] = useState<number | null>(null);
    const [tempReturnDate, setTempReturnDate] = useState('');

    useEffect(() => {
        fetchLoans();
        fetchReaders();
        fetchBookItems();
    }, []);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/loan');
            setLoans(res.data);
            setListError('');
        } catch (err) {
            setListError('Falha ao buscar empréstimos.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReaders = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/users');
            // Filter users who are readers
            const readerUsers = res.data.filter((u: any) => u.user_type === 'Reader');
            setReaders(readerUsers.map((user: any) => ({
                id: user.id, // Use user.id as reader.id (they should be the same)
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username
            })));
        } catch (err) {
            setListError('Falha ao buscar leitores.');
        }
    };

    const fetchBookItems = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/book');
            // Filter books that have available copies
            const booksWithAvailableCopies = res.data.filter((book: any) => {
                const availableCopies = book.BookItem?.filter((item: any) => item.status === 'Available').length || 0;
                return availableCopies > 0;
            });
            setBookItems(booksWithAvailableCopies);
        } catch (err) {
            setListError('Falha ao buscar exemplares de livros.');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewLoan({ ...newLoan, [name]: value });
    };

    const handleAddLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSuccess('');

        if (!newLoan.reader_id || !newLoan.book_item_id || !newLoan.start_date || !newLoan.due_date) {
            setFormError('Por favor, preencha todos os campos.');
            return;
        }

        try {
            // Find an available book item for the selected book
            const selectedBook = bookItems.find(book => book.id === parseInt(newLoan.book_item_id, 10));
            if (!selectedBook) {
                setFormError('Livro não encontrado.');
                return;
            }

            const availableBookItem = selectedBook.BookItem?.find(item => item.status === 'Available');
            if (!availableBookItem) {
                setFormError('Não há cópias disponíveis deste livro.');
                return;
            }

            const payload = {
                reader_id: parseInt(newLoan.reader_id, 10),
                book_item_id: availableBookItem.id, // Use the actual book item ID
                start_date: newLoan.start_date,
                due_date: newLoan.due_date,
            };

            await axios.post('http://localhost:3000/api/loan', payload);
            setSuccess('Empréstimo criado com sucesso!');
            setShowForm(false);
            fetchLoans();
            fetchBookItems();
        } catch (err: any) {
            let detail = 'Ocorreu um erro inesperado.';

            if (err.response?.data) {
                const errorData = err.response.data;
                const message = errorData.message || errorData.error;

                if (typeof message === 'string') {
                    detail = message;
                } else if (Array.isArray(message)) {
                    detail = message.join(', ');
                } else if (typeof message === 'object' && message !== null) {
                    detail = JSON.stringify(message);
                }
            } else if (err.message) {
                detail = err.message;
            }
            
            setFormError(`Falha ao criar empréstimo. Detalhe: ${detail}`);
        }
    };

    const handleReturnLoan = async (loan: Loan) => {
        if (!window.confirm('Confirmar devolução deste empréstimo?')) return;
        try {
            await axios.patch(`http://localhost:3000/api/loan/${loan.id}`, {
                return_date: new Date().toISOString(),
                status: 'Returned',
            });
            setSuccess('Devolução registrada!');
            fetchLoans();
            fetchBookItems();
        } catch (err) {
            setListError('Falha ao registrar devolução.');
        }
    };

    const handleDeleteLoan = async (loan: Loan) => {
        if (!window.confirm('Tem certeza que deseja eliminar este empréstimo?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/loan/${loan.id}`);
            setSuccess('Empréstimo eliminado!');
            fetchLoans();
            fetchBookItems();
        } catch (err) {
            setListError('Falha ao eliminar empréstimo.');
        }
    };

    const hasFormError = formError && formError !== 'Erro ao carregar os empréstimos.';

    // Function to translate status to Portuguese
    const translateStatus = (status: string) => {
        switch (status) {
            case 'Loaned':
                return 'Emprestado';
            case 'Returned':
                return 'Devolvido';
            case 'Overdue':
                return 'Em Atraso';
            case 'Renewed':
                return 'Renovado';
            default:
                return status;
        }
    };

    // Function to handle manual return date editing
    const handleReturnDateChange = async (loanId: number, newReturnDate: string) => {
        try {
            await axios.patch(`http://localhost:3000/api/loan/${loanId}`, {
                return_date: newReturnDate,
                status: 'Returned',
            });
            setSuccess('Data de devolução atualizada!');
            setEditingReturnDate(null);
            setTempReturnDate('');
            fetchLoans();
            fetchBookItems();
        } catch (err) {
            setListError('Falha ao atualizar data de devolução.');
        }
    };

    // Function to start editing return date
    const startEditReturnDate = (loan: Loan) => {
        setEditingReturnDate(loan.id);
        setTempReturnDate(loan.return_date ? loan.return_date.slice(0, 10) : '');
    };

    // Function to save return date edit
    const saveReturnDateEdit = async () => {
        if (!editingReturnDate) return;
        
        try {
            await axios.patch(`http://localhost:3000/api/loan/${editingReturnDate}`, {
                return_date: tempReturnDate,
                status: 'Returned',
            });
            setSuccess('Data de devolução atualizada!');
            setEditingReturnDate(null);
            setTempReturnDate('');
            fetchLoans();
            fetchBookItems();
        } catch (err) {
            setListError('Falha ao atualizar data de devolução.');
        }
    };

    // Function to cancel return date edit
    const cancelReturnDateEdit = () => {
        setEditingReturnDate(null);
        setTempReturnDate('');
    };

    // Function to handle overdue return with custom date
    const handleOverdueReturn = async (loan: Loan) => {
        const customReturnDate = prompt(
            `Este empréstimo está em atraso. Data prevista: ${formatDate(loan.due_date)}\n\nDigite a data real de devolução (YYYY-MM-DD):`,
            new Date().toISOString().slice(0, 10)
        );
        
        if (!customReturnDate) return;
        
        try {
            await axios.patch(`http://localhost:3000/api/loan/${loan.id}`, {
                return_date: customReturnDate,
                status: 'Returned',
            });
            setSuccess('Devolução em atraso registrada!');
            fetchLoans();
            fetchBookItems();
        } catch (err) {
            setListError('Falha ao registrar devolução em atraso.');
        }
    };

    // Function to check if a loan is overdue
    const isOverdue = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        return today > due;
    };

    // Function to format date for display
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return dateString.slice(0, 10);
    };

    // Function to get status color
    const getStatusColor = (status: string, dueDate: string) => {
        if (status === 'Returned') return 'text-green-600';
        if (status === 'Overdue' || isOverdue(dueDate)) return 'text-red-600';
        if (status === 'Renewed') return 'text-blue-600';
        return 'text-gray-600';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-2xl font-bold mb-2">Gerir Empréstimos</h1>
            <p className="text-gray-600 mb-6">
                Gerencie os empréstimos de obras.
            </p>

            <div className="flex gap-4 mb-6">
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
                    onClick={() => setShowForm(!showForm)}
                >
                    <FaPlus /> Novo Empréstimo
                </button>
            </div>

            {/* Loan Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">{loans.length}</div>
                    <div className="text-sm text-gray-600">Total de Empréstimos</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-600">
                        {loans.filter(loan => loan.status === 'Returned').length}
                    </div>
                    <div className="text-sm text-gray-600">Devolvidos</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-red-600">
                        {loans.filter(loan => isOverdue(loan.due_date) && loan.status !== 'Returned').length}
                    </div>
                    <div className="text-sm text-gray-600">Em Atraso</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-yellow-600">
                        {loans.filter(loan => loan.status === 'Loaned' && !isOverdue(loan.due_date)).length}
                    </div>
                    <div className="text-sm text-gray-600">Ativos</div>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleAddLoan} className="mb-6 bg-white p-4 rounded shadow flex flex-col gap-4">
                    <div className="flex items-end gap-4">
                        <div className="flex flex-col flex-1">
                            <label htmlFor="reader_id" className="text-sm font-medium text-gray-700 mb-1">Leitor</label>
                            <select
                                id="reader_id"
                                name="reader_id"
                                value={newLoan.reader_id}
                                onChange={handleInputChange}
                                className="border rounded px-3 py-2"
                                required
                            >
                                <option value="">Selecione o Leitor</option>
                                {readers.map((reader) => (
                                    <option key={reader.id} value={reader.id}>
                                        {reader.first_name} {reader.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="book_item_id" className="text-sm font-medium text-gray-700 mb-1">Livro</label>
                            <select
                                id="book_item_id"
                                name="book_item_id"
                                value={newLoan.book_item_id}
                                onChange={handleInputChange}
                                className="border rounded px-3 py-2"
                                required
                            >
                                <option value="">Selecione o Livro</option>
                                {bookItems.map((book) => {
                                    const availableCopies = book.BookItem?.filter(item => item.status === 'Available').length || 0;
                                    return (
                                        <option key={book.id} value={book.id}>
                                            {book.title} ({availableCopies} cópias disponíveis)
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="start_date" className="text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                            <input
                                id="start_date"
                                type="date"
                                name="start_date"
                                value={newLoan.start_date}
                                onChange={handleInputChange}
                                className="border rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="due_date" className="text-sm font-medium text-gray-700 mb-1">Data de Devolução</label>
                            <input
                                id="due_date"
                                type="date"
                                name="due_date"
                                value={newLoan.due_date}
                                onChange={handleInputChange}
                                className="border rounded px-3 py-2"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Salvar</button>
                        <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={() => setShowForm(false)}>Cancelar</button>
                    </div>
                    {hasFormError && <div className="text-red-600 mt-2">{formError}</div>}
                    {success && <div className="text-green-600 mt-2">{success}</div>}
                </form>
            )}

            <h2 className="text-xl font-semibold mb-4">Empréstimos Ativos</h2>
            {loading ? (
                <div className="text-gray-500">Carregando empréstimos...</div>
            ) : listError ? (
                <div className="text-red-500">{listError}</div>
            ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Obra</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Leitor</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data Empréstimo</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data Devolução Prevista</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data Devolução Real</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                            {loans.map((loan) => (
                                <tr key={loan.id} className={`hover:bg-gray-50 ${isOverdue(loan.due_date) && loan.status !== 'Returned' ? 'bg-red-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{loan.BookItem?.Book.title || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{loan.Reader?.User.first_name} {loan.Reader?.User.last_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(loan.start_date)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${isOverdue(loan.due_date) && loan.status !== 'Returned' ? 'text-red-600 font-semibold' : ''}`}>
                                        {formatDate(loan.due_date)}
                                        {isOverdue(loan.due_date) && loan.status !== 'Returned' && (
                                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">EM ATRASO</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingReturnDate === loan.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="date"
                                                    value={tempReturnDate}
                                                    onChange={(e) => setTempReturnDate(e.target.value)}
                                                    className="border rounded px-2 py-1 text-sm"
                                                />
                                                <button
                                                    onClick={saveReturnDateEdit}
                                                    className="text-green-600 hover:text-green-800 text-sm"
                                                    title="Salvar"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={cancelReturnDateEdit}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                    title="Cancelar"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>{formatDate(loan.return_date)}</span>
                                                {loan.status === 'Returned' && (
                                                    <button
                                                        onClick={() => startEditReturnDate(loan)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                        title="Editar data de devolução"
                                                    >
                                                        ✏️
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${getStatusColor(loan.status, loan.due_date)}`}>
                                        {translateStatus(loan.status)}
                                        {isOverdue(loan.due_date) && loan.status !== 'Returned' && (
                                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">ATRASADO</span>
                                        )}
                                    </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        <div className="flex gap-2">
                                            {loan.status !== 'Returned' && (
                                                <button
                                                    className="flex flex-col items-center text-gray-600 hover:text-green-600"
                                                    title={isOverdue(loan.due_date) ? "Registrar Devolução em Atraso" : "Registrar Devolução"}
                                                    onClick={() => isOverdue(loan.due_date) ? handleOverdueReturn(loan) : handleReturnLoan(loan)}
                                                >
                                        <FaCheck />
                                                    <span className="text-xs">
                                                        {isOverdue(loan.due_date) ? 'Devolver (Atraso)' : 'Devolver'}
                                                    </span>
                                                </button>
                                            )}
                                            {loan.status === 'Returned' && (
                                                <button
                                                    className="flex flex-col items-center text-gray-600 hover:text-blue-600"
                                                    title="Editar Data de Devolução"
                                                    onClick={() => startEditReturnDate(loan)}
                                                >
                                                    <span className="text-lg">✏️</span>
                                                    <span className="text-xs">Editar Data</span>
                                                </button>
                                            )}
                                            <button
                                                className="flex flex-col items-center text-gray-600 hover:text-red-600"
                                                title="Eliminar Empréstimo"
                                                onClick={() => handleDeleteLoan(loan)}
                                            >
                                                <FaTrashAlt />
                                                <span className="text-xs">Eliminar</span>
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