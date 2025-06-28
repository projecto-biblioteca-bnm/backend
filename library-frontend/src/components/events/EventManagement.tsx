import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrashAlt, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaEye } from 'react-icons/fa';
import { api } from '../../lib/api';

interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    start_time?: string;
    end_time?: string;
    location: string;
    capacity?: number;
    status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
    created_by: number;
    User: {
        first_name: string;
        last_name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

interface EventFormData {
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    capacity: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
}

const initialFormData: EventFormData = {
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: '',
    status: 'Upcoming',
};

export default function EventManagement() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState<EventFormData>(initialFormData);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Fetch events from backend
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/event');
            setEvents(response.data);
            setError(null);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError('Erro ao carregar eventos: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData(initialFormData);
        setEditingEvent(null);
    };

    // Open modal for creating new event
    const handleAddEvent = () => {
        resetForm();
        setShowModal(true);
    };

    // Open modal for editing event
    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date.split('T')[0],
            start_time: event.start_time || '',
            end_time: event.end_time || '',
            location: event.location,
            capacity: event.capacity?.toString() || '',
            status: event.status,
        });
        setShowModal(true);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Convert date to proper format for Prisma
            const dateObj = new Date(formData.date);
            const isoDateString = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            const eventData = {
                ...formData,
                date: isoDateString,
                capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
                created_by: 1, // TODO: Get from auth context
            };

            if (editingEvent) {
                await api.patch(`/event/${editingEvent.id}`, eventData);
            } else {
                await api.post('/event', eventData);
            }

            setShowModal(false);
            resetForm();
            fetchEvents();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError('Erro ao salvar evento: ' + errorMessage);
        }
    };

    // Handle event deletion
    const handleDeleteEvent = async (eventId: number) => {
        if (!confirm('Tem certeza que deseja eliminar este evento?')) return;

        try {
            await api.delete(`/event/${eventId}`);
            fetchEvents();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError('Erro ao eliminar evento: ' + errorMessage);
        }
    };

    // Show event details
    const handleViewDetails = (event: Event) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Upcoming': return 'bg-blue-100 text-blue-800';
            case 'Ongoing': return 'bg-green-100 text-green-800';
            case 'Completed': return 'bg-gray-100 text-gray-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status label in Portuguese
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Upcoming': return 'Próximo';
            case 'Ongoing': return 'Em Andamento';
            case 'Completed': return 'Concluído';
            case 'Cancelled': return 'Cancelado';
            default: return status;
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-full">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">A carregar eventos...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Gerir Eventos</h1>
                    <p className="text-gray-600">
                        Gerencie os eventos da biblioteca: adicione, edite e elimine.
                    </p>
                </div>
                <button
                    onClick={handleAddEvent}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <FaPlus /> Adicionar Evento
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Eventos ({events.length})</h2>
                </div>
                
                {events.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <FaCalendarAlt className="mx-auto text-4xl mb-4 text-gray-300" />
                        <p>Nenhum evento encontrado</p>
                        <p className="text-sm">Clique em &quot;Adicionar Evento&quot; para criar o primeiro evento</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Título
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Local
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Criado por
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(event.date)}
                                            {event.start_time && (
                                                <div className="text-xs text-gray-500">{event.start_time}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {event.location}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                                                {getStatusLabel(event.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {event.User.first_name} {event.User.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(event)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Ver detalhes"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditEvent(event)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Editar"
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Eliminar"
                                                >
                                                    <FaTrashAlt size={16} />
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

            {/* Add/Edit Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingEvent ? 'Editar Evento' : 'Adicionar Novo Evento'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hora de Início
                                    </label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hora de Fim
                                    </label>
                                    <input
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Local *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Capacidade
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Upcoming">Próximo</option>
                                        <option value="Ongoing">Em Andamento</option>
                                        <option value="Completed">Concluído</option>
                                        <option value="Cancelled">Cancelado</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {editingEvent ? 'Atualizar' : 'Criar'} Evento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Event Details Modal */}
            {showDetailsModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaCalendarAlt />
                                <span>{formatDate(selectedEvent.date)}</span>
                                {selectedEvent.start_time && (
                                    <>
                                        <FaClock />
                                        <span>{selectedEvent.start_time}</span>
                                        {selectedEvent.end_time && <span>- {selectedEvent.end_time}</span>}
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                                <FaMapMarkerAlt />
                                <span>{selectedEvent.location}</span>
                            </div>

                            {selectedEvent.capacity && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaUsers />
                                    <span>Capacidade: {selectedEvent.capacity} pessoas</span>
                                </div>
                            )}

                            <div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEvent.status)}`}>
                                    {getStatusLabel(selectedEvent.status)}
                                </span>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Descrição:</h3>
                                <p className="text-gray-700">{selectedEvent.description}</p>
                            </div>

                            <div className="text-sm text-gray-500">
                                <p>Criado por: {selectedEvent.User.first_name} {selectedEvent.User.last_name}</p>
                                <p>Criado em: {formatDate(selectedEvent.created_at)}</p>
                                {selectedEvent.updated_at !== selectedEvent.created_at && (
                                    <p>Atualizado em: {formatDate(selectedEvent.updated_at)}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    handleEditEvent(selectedEvent);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Editar Evento
                            </button>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 