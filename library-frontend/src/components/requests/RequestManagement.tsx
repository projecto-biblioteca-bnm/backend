import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaCheck, FaTimes, FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';

interface Request {
    id: number;
    reader_id: number;
    type: string;
    title: string;
    description: string;
    status: string;
    priority: string | null;
    notes: string | null;
    response: string | null;
    created_at: string;
    updated_at: string;
    Reader?: {
        User: {
            first_name: string;
            last_name: string;
            email: string;
        };
    };
}

interface Reader {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export default function RequestManagement() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [readers, setReaders] = useState<Reader[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRequest, setEditingRequest] = useState<Request | null>(null);
    const [showDetails, setShowDetails] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        reader_id: '',
        type: 'ReaderCard',
        title: '',
        description: '',
        priority: 'Medium',
        notes: ''
    });

    const requestTypes = [
        { value: 'ReaderCard', label: 'Cartão de Leitor' },
        { value: 'BookPurchase', label: 'Compra de Livro' },
        { value: 'FacilityAccess', label: 'Acesso a Instalações' },
        { value: 'SpecialPermission', label: 'Permissão Especial' },
        { value: 'Other', label: 'Outro' }
    ];

    const priorities = [
        { value: 'Low', label: 'Baixa' },
        { value: 'Medium', label: 'Média' },
        { value: 'High', label: 'Alta' }
    ];

    useEffect(() => {
        fetchRequests();
        fetchReaders();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/request');
            setRequests(res.data);
        } catch (err) {
            setError('Falha ao buscar pedidos.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReaders = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/users');
            const readerUsers = res.data.filter((u: any) => u.user_type === 'Reader');
            setReaders(readerUsers.map((user: any) => ({
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            })));
        } catch (err) {
            setError('Falha ao buscar leitores.');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.reader_id || !formData.title || !formData.description) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            await axios.post('http://localhost:3000/api/request', {
                reader_id: parseInt(formData.reader_id),
                type: formData.type,
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                notes: formData.notes || null
            });
            setSuccess('Pedido criado com sucesso!');
            setShowForm(false);
            setFormData({
                reader_id: '',
                type: 'ReaderCard',
                title: '',
                description: '',
                priority: 'Medium',
                notes: ''
            });
            fetchRequests();
        } catch (err: any) {
            let msg = 'Falha ao criar pedido.';
            if (err.response?.data?.message) {
                msg += ` ${err.response.data.message}`;
            }
            setError(msg);
        }
    };

    const handleUpdateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRequest) return;

        try {
            await axios.patch(`http://localhost:3000/api/request/${editingRequest.id}`, {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                notes: formData.notes || null
            });
            setSuccess('Pedido atualizado com sucesso!');
            setEditingRequest(null);
            setShowForm(false);
            setFormData({
                reader_id: '',
                type: 'ReaderCard',
                title: '',
                description: '',
                priority: 'Medium',
                notes: ''
            });
            fetchRequests();
        } catch (err: any) {
            let msg = 'Falha ao atualizar pedido.';
            if (err.response?.data?.message) {
                msg += ` ${err.response.data.message}`;
            }
            setError(msg);
        }
    };

    const handleStatusChange = async (requestId: number, newStatus: string, response?: string) => {
        try {
            const updateData: any = { status: newStatus };
            if (response) {
                updateData.response = response;
            }
            
            await axios.patch(`http://localhost:3000/api/request/${requestId}`, updateData);
            setSuccess(`Status do pedido atualizado para ${translateStatus(newStatus)}!`);
            fetchRequests();
        } catch (err) {
            setError('Falha ao atualizar status do pedido.');
        }
    };

    const handleDeleteRequest = async (requestId: number) => {
        if (!window.confirm('Tem certeza que deseja eliminar este pedido?')) return;
        
        try {
            await axios.delete(`http://localhost:3000/api/request/${requestId}`);
            setSuccess('Pedido eliminado com sucesso!');
            fetchRequests();
        } catch (err) {
            setError('Falha ao eliminar pedido.');
        }
    };

    const startEdit = (request: Request) => {
        setEditingRequest(request);
        setFormData({
            reader_id: request.reader_id.toString(),
            type: request.type,
            title: request.title,
            description: request.description,
            priority: request.priority || 'Medium',
            notes: request.notes || ''
        });
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    const cancelEdit = () => {
        setEditingRequest(null);
        setShowForm(false);
        setFormData({
            reader_id: '',
            type: 'ReaderCard',
            title: '',
            description: '',
            priority: 'Medium',
            notes: ''
        });
        setError('');
        setSuccess('');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const translateStatus = (status: string) => {
        switch (status) {
            case 'Pending': return 'Pendente';
            case 'Approved': return 'Aprovado';
            case 'Rejected': return 'Rejeitado';
            case 'InProgress': return 'Em Progresso';
            case 'Completed': return 'Concluído';
            default: return status;
        }
    };

    const translateType = (type: string) => {
        const typeObj = requestTypes.find(t => t.value === type);
        return typeObj ? typeObj.label : type;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'InProgress': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-2xl font-bold mb-2">Gerir Pedidos</h1>
            <p className="text-gray-600 mb-6">
                Gerencie os pedidos dos leitores (cartões, compras de livros, permissões especiais, etc.).
            </p>

            <div className="flex gap-4 mb-6">
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
                    onClick={() => setShowForm(!showForm)}
                >
                    <FaPlus /> Novo Pedido
                </button>
            </div>

            {/* Request Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
                    <div className="text-sm text-gray-600">Total de Pedidos</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-yellow-600">
                        {requests.filter(req => req.status === 'Pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pendentes</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">
                        {requests.filter(req => req.status === 'InProgress').length}
                    </div>
                    <div className="text-sm text-gray-600">Em Progresso</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-600">
                        {requests.filter(req => req.status === 'Completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Concluídos</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-red-600">
                        {requests.filter(req => req.status === 'Rejected').length}
                    </div>
                    <div className="text-sm text-gray-600">Rejeitados</div>
                </div>
            </div>

            {showForm && (
                <form onSubmit={editingRequest ? handleUpdateRequest : handleAddRequest} className="mb-6 bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingRequest ? 'Editar Pedido' : 'Novo Pedido'}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Leitor</label>
                            <select
                                name="reader_id"
                                value={formData.reader_id}
                                onChange={handleInputChange}
                                className="w-full border rounded px-3 py-2"
                                required
                                disabled={!!editingRequest}
                            >
                                <option value="">Selecione o Leitor</option>
                                {readers.map((reader) => (
                                    <option key={reader.id} value={reader.id}>
                                        {reader.first_name} {reader.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pedido</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full border rounded px-3 py-2"
                                required
                            >
                                {requestTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="w-full border rounded px-3 py-2"
                            >
                                {priorities.map((priority) => (
                                    <option key={priority.value} value={priority.value}>
                                        {priority.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            rows={3}
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            rows={2}
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            {editingRequest ? 'Atualizar' : 'Criar'} Pedido
                        </button>
                        <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={cancelEdit}>
                            Cancelar
                        </button>
                    </div>
                    
                    {error && <div className="text-red-600 mt-2">{error}</div>}
                    {success && <div className="text-green-600 mt-2">{success}</div>}
                </form>
            )}

            <h2 className="text-xl font-semibold mb-4">Lista de Pedidos</h2>
            {loading ? (
                <div className="text-gray-500">Carregando pedidos...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Leitor</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Prioridade</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">#{request.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {request.Reader?.User.first_name} {request.Reader?.User.last_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{translateType(request.type)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{request.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                                            {translateStatus(request.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority || 'Medium')}`}>
                                            {request.priority || 'Média'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(request.created_at)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowDetails(showDetails === request.id ? null : request.id)}
                                                className="text-gray-600 hover:text-gray-800"
                                                title="Ver Detalhes"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => startEdit(request)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Editar"
                                            >
                                                <FaEdit />
                                            </button>
                                            {request.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(request.id, 'Approved')}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Aprovar"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(request.id, 'Rejected')}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Rejeitar"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDeleteRequest(request.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Eliminar"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Request Details Modal */}
            {showDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Detalhes do Pedido</h2>
                            <button
                                onClick={() => setShowDetails(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {requests.find(r => r.id === showDetails) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ID do Pedido</label>
                                        <p className="text-gray-900">#{showDetails}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(requests.find(r => r.id === showDetails)?.status || '')}`}>
                                            {translateStatus(requests.find(r => r.id === showDetails)?.status || '')}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                        <p className="text-gray-900">{translateType(requests.find(r => r.id === showDetails)?.type || '')}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(requests.find(r => r.id === showDetails)?.priority || 'Medium')}`}>
                                            {requests.find(r => r.id === showDetails)?.priority || 'Média'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Leitor</label>
                                    <p className="text-gray-900">
                                        {requests.find(r => r.id === showDetails)?.Reader?.User.first_name} {requests.find(r => r.id === showDetails)?.Reader?.User.last_name}
                                    </p>
                                    <p className="text-sm text-gray-600">{requests.find(r => r.id === showDetails)?.Reader?.User.email}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Título</label>
                                    <p className="text-gray-900">{requests.find(r => r.id === showDetails)?.title}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                                    <p className="text-gray-900">{requests.find(r => r.id === showDetails)?.description}</p>
                                </div>
                                
                                {requests.find(r => r.id === showDetails)?.notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Notas</label>
                                        <p className="text-gray-900">{requests.find(r => r.id === showDetails)?.notes}</p>
                                    </div>
                                )}
                                
                                {requests.find(r => r.id === showDetails)?.response && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Resposta</label>
                                        <p className="text-gray-900">{requests.find(r => r.id === showDetails)?.response}</p>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                                        <p className="text-gray-900">{formatDate(requests.find(r => r.id === showDetails)?.created_at || '')}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
                                        <p className="text-gray-900">{formatDate(requests.find(r => r.id === showDetails)?.updated_at || '')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}