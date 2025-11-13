
import React, { useState, useMemo } from 'react';
import type { Event } from '../types';
import { stringToColor } from '../services/colorService';
import NotFoundIcon from './icons/NotFoundIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';
import LocationIcon from './icons/LocationIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';

const EventInfo: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 text-sm text-gray-400">
    <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
    <span><strong className="font-medium text-gray-300">{label}:</strong> {value}</span>
  </div>
);

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const color = stringToColor(event.disciplina);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1970) {
        return dateString;
    }
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
        return dateString;
    }
    // Retorna apenas a data em formato curto para o card
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(date);
  };

  const formattedStartDate = formatDate(event.data);
  const formattedEndDate = formatDate(event.data_fim);

  let dateDisplay = formattedStartDate;
  // Mostra o intervalo apenas se a data final existir e for diferente da inicial
  if (formattedEndDate && formattedEndDate !== formattedStartDate) {
      dateDisplay = `de ${formattedStartDate} à ${formattedEndDate}`;
  }

  return (
    <div 
      className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-t border-r border-b border-gray-600 transition-shadow duration-300 hover:shadow-md hover:bg-gray-700 flex flex-col h-full"
      style={{ borderLeftColor: color }}
    >
      <p className="font-bold text-white mb-2">{event.disciplina}</p>
      <div className="space-y-1">
        {dateDisplay && <EventInfo icon={<CalendarIcon className="w-4 h-4" />} label="Período" value={dateDisplay} />}
        <EventInfo icon={<ClipboardListIcon className="w-4 h-4" />} label="Tipo" value={event.tipo} />
        <EventInfo icon={<ClockIcon className="w-4 h-4" />} label="Horário" value={event.horario} />
        <EventInfo icon={<LocationIcon className="w-4 h-4" />} label="Local" value={event.local} />
      </div>
    </div>
  );
};

const EventDisplay: React.FC<{ events: Event[] | null }> = ({ events }) => {
  const [selectedType, setSelectedType] = useState<string>('Todos');

  const eventTypes = useMemo(() => {
    if (!events) return [];
    const types = new Set(events.map(event => event.tipo));
    return ['Todos', ...Array.from(types).sort()];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!events) return null;
    if (selectedType === 'Todos') {
      return events;
    }
    return events.filter(event => event.tipo === selectedType);
  }, [events, selectedType]);

  if (!events || events.length === 0) {
    return (
      <div className="text-center text-gray-400 p-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
        <NotFoundIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
        <p className="text-xl font-semibold text-white">Nenhum evento encontrado.</p>
        <p className="text-md mt-1 text-gray-400">
           Não há eventos correspondentes aos filtros selecionados.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {eventTypes.length > 2 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                selectedType === type
                  ? 'bg-afya-pink text-white shadow-md'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {(!filteredEvents || filteredEvents.length === 0) ? (
        <div className="text-center text-gray-400 p-8 bg-gray-800/50 rounded-2xl">
            <p className="text-lg">Nenhum evento do tipo "{selectedType}" foi encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <div key={`${event.disciplina}-${event.data}-${index}`} className="animate-fade-in transition-transform duration-300 hover:scale-[1.02]" style={{ animationDelay: `${index * 100}ms` }}>
                <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventDisplay;
