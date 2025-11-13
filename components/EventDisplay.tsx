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

// Helper to interpret dates in DD/MM/AAAA format safely
const parseBrDate = (dateString: string): Date => {
  if (!dateString || typeof dateString !== 'string') return new Date(0);
  const parts = dateString.split('/');
  if (parts.length !== 3) return new Date(0);
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1970) return new Date(0);
  // O mês é 0-indexado no construtor de Date do JS
  return new Date(year, month - 1, day);
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
  
  const groupedByMonth = useMemo(() => {
    if (!filteredEvents) return {};

    return filteredEvents.reduce<Record<string, Event[]>>((acc, event) => {
        const date = parseBrDate(event.data);
        if (isNaN(date.getTime()) || date.getFullYear() < 1971) return acc; // Ignora datas inválidas
        
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(event);
        return acc;
    }, {});
  }, [filteredEvents]);
  
  const sortedMonthKeys = useMemo(() => Object.keys(groupedByMonth).sort(), [groupedByMonth]);

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
      {/* A condição foi alterada de > 2 para > 1 para mostrar o filtro mesmo com um único tipo de evento. */}
      {eventTypes.length > 1 && (
         <div className="mb-8 max-w-sm mx-auto">
            <label htmlFor="event-type-filter" className="block mb-2 text-sm font-medium text-gray-300 text-center">
                Filtrar por tipo de evento
            </label>
            <select
                id="event-type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-afya-pink focus:border-afya-pink transition duration-150 ease-in-out appearance-none"
            >
                {eventTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-800">{type}</option>
                ))}
            </select>
        </div>
      )}

      {(!filteredEvents || filteredEvents.length === 0) ? (
        <div className="text-center text-gray-400 p-8 bg-gray-800/50 rounded-2xl">
            <p className="text-lg text-white">Nenhum evento do tipo "{selectedType}" foi encontrado.</p>
            <p className="text-sm text-gray-500 mt-1">Tente selecionar outra categoria no filtro acima.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedMonthKeys.map((monthKey, index) => {
            const eventsInMonth = groupedByMonth[monthKey];
            const [year, month] = monthKey.split('-').map(Number);
            const monthDate = new Date(year, month - 1, 1);
            
            const monthName = new Intl.DateTimeFormat('pt-BR', {
                month: 'long',
                year: 'numeric',
                timeZone: 'America/Sao_Paulo'
            }).format(monthDate);

            return (
              <div key={monthKey} className="animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <h3 className="text-2xl font-bold text-afya-pink mb-4 capitalize pl-2 border-l-4 border-afya-pink">
                    {monthName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {eventsInMonth.map((event, eventIndex) => (
                          <div key={`${event.disciplina}-${event.data}-${eventIndex}`} className="transition-transform duration-300 hover:scale-[1.02]">
                              <EventCard event={event} />
                          </div>
                      ))}
                  </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventDisplay;