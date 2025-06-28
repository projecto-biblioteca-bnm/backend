import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaEdit } from 'react-icons/fa';
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

const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const getMonthMatrix = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const matrix = [];
  let week = new Array(7).fill(null);
  let dayIndex = firstDayOfMonth;

  daysInMonth.forEach(day => {
    week[dayIndex] = day.getDate();
    if (dayIndex === 6) {
      matrix.push(week);
      week = new Array(7).fill(null);
      dayIndex = 0;
    } else {
      dayIndex++;
    }
  });

  if (dayIndex > 0) {
    matrix.push(week);
  }

  return matrix;
};

const MonthCalendar = ({ 
  year, 
  month, 
  onDateClick, 
  events 
}: { 
  year: number; 
  month: number; 
  onDateClick: (event: Event) => void; 
  events: Event[];
}) => {
  const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'long' });
  const monthMatrix = getMonthMatrix(year, month);
  const weekDays = ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá'];

  // Create events map for this month
  const eventsByDate = events.reduce((acc, event) => {
    const eventDate = new Date(event.date);
    if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(event);
    }
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm">
      <h3 className="font-bold text-center mb-2 capitalize">{monthName}</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="mt-1">
        {monthMatrix.map((week, i) => (
          <div key={i} className="grid grid-cols-7 gap-1 text-center text-sm">
            {week.map((day, j) => {
              const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
              const dayEvents = day ? eventsByDate[dateStr] || [] : [];
              const hasEvents = dayEvents.length > 0;

              return (
                <div key={j} className="relative">
                  <button
                    onClick={() => hasEvents && dayEvents[0] && onDateClick(dayEvents[0])}
                    disabled={!hasEvents}
                    className={`w-6 h-6 flex items-center justify-center rounded-full ${
                      hasEvents 
                        ? 'cursor-pointer hover:bg-blue-100 bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-400'
                    }`}
                  >
                    {day}
                  </button>
                  {hasEvents && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                  )}
                  {dayEvents.length > 1 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {dayEvents.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showEventList, setShowEventList] = useState(false);

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

  // Get upcoming events (next 30 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= thirtyDaysFromNow && event.status !== 'Cancelled';
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">A carregar eventos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Consultar Eventos</h1>
          <p className="text-gray-600">
            Visualize todos os eventos da biblioteca no calendário anual.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentYear(prev => prev - 1)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            {currentYear - 1}
          </button>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium">
            {currentYear}
          </span>
          <button
            onClick={() => setCurrentYear(prev => prev + 1)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            {currentYear + 1}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Calendário de Eventos ({currentYear})</h2>
            <button
              onClick={() => setShowEventList(!showEventList)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {showEventList ? 'Ver Calendário' : 'Ver Lista de Próximos Eventos'}
            </button>
          </div>

          {showEventList ? (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">Próximos Eventos (30 dias)</h3>
              {getUpcomingEvents().length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum evento próximo encontrado</p>
              ) : (
                <div className="space-y-3">
                  {getUpcomingEvents().map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt />
                              {formatDate(event.date)}
                            </span>
                            {event.start_time && (
                              <span className="flex items-center gap-1">
                                <FaClock />
                                {event.start_time}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                          {getStatusLabel(event.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <MonthCalendar
                  key={i}
                  year={currentYear}
                  month={i}
                  onDateClick={setSelectedEvent}
                  events={events}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white p-4 rounded-lg shadow-sm sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Detalhes do Evento</h2>
            {selectedEvent ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-gray-800">{selectedEvent.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEvent.status)}`}>
                    {getStatusLabel(selectedEvent.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    <span>Data: {formatDate(selectedEvent.date)}</span>
                  </div>
                  
                  {selectedEvent.start_time && (
                    <div className="flex items-center gap-2">
                      <FaClock />
                      <span>
                        {selectedEvent.start_time}
                        {selectedEvent.end_time && ` - ${selectedEvent.end_time}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt />
                    <span>Local: {selectedEvent.location}</span>
                  </div>

                  {selectedEvent.capacity && (
                    <div className="flex items-center gap-2">
                      <FaUsers />
                      <span>Capacidade: {selectedEvent.capacity} pessoas</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Descrição:</h4>
                  <p className="text-gray-700 text-sm">{selectedEvent.description}</p>
                </div>

                <div className="text-xs text-gray-500 border-t pt-3">
                  <p>Criado por: {selectedEvent.User.first_name} {selectedEvent.User.last_name}</p>
                  <p>Criado em: {formatDate(selectedEvent.created_at)}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      // TODO: Navigate to edit event page or open edit modal
                      console.log('Edit event:', selectedEvent.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    <FaEdit size={12} />
                    Editar
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FaCalendarAlt className="mx-auto text-4xl mb-4 text-gray-300" />
                <p>Selecione uma data no calendário</p>
                <p className="text-sm">ou um evento da lista para ver os detalhes</p>
              </div>
            )}
          </div>

          {/* Event Statistics */}
          <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
            <h3 className="text-lg font-semibold mb-3">Estatísticas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total de Eventos:</span>
                <span className="font-semibold">{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Próximos:</span>
                <span className="font-semibold text-blue-600">
                  {events.filter(e => e.status === 'Upcoming').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Em Andamento:</span>
                <span className="font-semibold text-green-600">
                  {events.filter(e => e.status === 'Ongoing').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Concluídos:</span>
                <span className="font-semibold text-gray-600">
                  {events.filter(e => e.status === 'Completed').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cancelados:</span>
                <span className="font-semibold text-red-600">
                  {events.filter(e => e.status === 'Cancelled').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 