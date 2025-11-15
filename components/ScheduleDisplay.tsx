import React, { useState } from 'react';
import type { Schedule, DiaDeAula, Aula, ModuleSelection } from '../types';
import ClockIcon from './icons/ClockIcon';
import LocationIcon from './icons/LocationIcon';
import NotFoundIcon from './icons/NotFoundIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import UserIcon from './icons/UserIcon';
import InfoIcon from './icons/InfoIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';
import CoffeeIcon from './icons/CoffeeIcon';
import BookIcon from './icons/BookIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import { stringToColor } from '../services/colorService';

// FIX: Declare global types for jspdf and html2canvas to resolve TypeScript errors for properties on the window object.
declare global {
  interface Window {
    jspdf: {
      jsPDF: new (options?: any) => any;
    };
  }
  const html2canvas: (
    element: HTMLElement,
    options?: any
  ) => Promise<HTMLCanvasElement>;
}

// Componente de helper para exibir uma linha de informação com ícone
const AulaInfo: React.FC<{ icon: React.ReactNode; label: string; text: string }> = ({ icon, label, text }) => (
  <div className="flex items-start gap-2 text-sm">
    <span className="text-afya-pink flex-shrink-0 w-3 h-3 mt-0.5">{icon}</span>
    <div className="text-gray-400">
      <span className="font-semibold text-gray-200">{label}:</span> {text}
    </div>
  </div>
);

// Card de aula redesenhado com mais detalhes
const AulaCard: React.FC<{ aula: Aula }> = ({ aula }) => {
  const color = stringToColor(aula.disciplina);
  return (
    <div 
      className="bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700 border-l-4 aula-card"
      style={{ borderLeftColor: color }}
    >
      <div className="flex justify-between items-start gap-2 mb-3">
        <h4 className="font-semibold text-gray-100 text-base leading-tight">
          {aula.disciplina}
        </h4>
        {aula.modulo === 'Eletiva' && (
          <span className="bg-afya-pink text-white text-xs font-bold px-3 py-1 rounded-full shrink-0 tracking-wider shadow-sm eletiva-tag">
            ELETIVA
          </span>
        )}
      </div>
      <div className="space-y-2">
        <AulaInfo icon={<ClockIcon />} label="Horário" text={aula.horario} />
        {aula.tipo && <AulaInfo icon={<ClipboardListIcon />} label="Tipo" text={aula.tipo} />}
        <AulaInfo icon={<LocationIcon />} label="Sala" text={aula.sala} />
        {aula.professor && <AulaInfo icon={<UserIcon />} label="Professor" text={aula.professor} />}
      </div>
      {aula.observacao && (
        <div className="mt-4 pt-3 border-t border-slate-700">
            <div className="flex items-start gap-3 text-sm text-amber-300 bg-amber-900/30 p-3 rounded-lg">
                <InfoIcon className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <p>{aula.observacao}</p>
            </div>
        </div>
      )}
    </div>
  );
};

// Card informativo para os intervalos livres - com estilo para dia inteiro
const FreeSlotCard: React.FC<{ horario: string, isFullDay?: boolean }> = ({ horario, isFullDay = false }) => (
  <div className={`rounded-lg border text-center p-3 flex flex-col items-center justify-center free-slot-card
    ${isFullDay 
      ? 'bg-emerald-950 border-emerald-800 text-emerald-400 flex-grow min-h-[200px]' 
      : 'bg-emerald-900/60 border-emerald-800 text-emerald-300'
    }`
  }>
    <div className={`flex items-center gap-2 ${isFullDay ? 'mb-2' : 'mb-1'}`}>
      <CoffeeIcon className={isFullDay ? 'w-6 h-6' : 'w-5 h-5'} />
      <BookIcon className={isFullDay ? 'w-6 h-6' : 'w-5 h-5'} />
    </div>
    <p className={`font-semibold ${isFullDay ? 'text-lg' : 'text-sm'}`}>Horário Livre</p>
    <p className={`${isFullDay ? 'text-sm' : 'text-xs'}`}>{horario}</p>
  </div>
);


// Card do dia, que agrupa os cards de aula
const DiaCard: React.FC<{ diaDeAula: DiaDeAula }> = ({ diaDeAula }) => {
  const isFullDayFree = diaDeAula.aulas.length === 1 && diaDeAula.aulas[0].isFreeSlot;

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg flex flex-col h-full overflow-hidden border border-slate-700 dia-card">
      <h3 className="bg-afya-pink text-white font-bold p-3 text-center tracking-wide flex-shrink-0 text-lg">
        {diaDeAula.dia}
      </h3>
      <div className={`p-4 space-y-4 flex-grow flex flex-col ${isFullDayFree ? 'h-full' : ''}`}>
        {diaDeAula.aulas.map((aula, index) =>
          aula.isFreeSlot ? (
            <FreeSlotCard 
              key={`free-${diaDeAula.dia}-${index}`} 
              horario={aula.horario} 
              isFullDay={isFullDayFree} 
            />
          ) : (
            <AulaCard key={`${aula.disciplina}-${aula.horario}-${index}`} aula={aula} />
          )
        )}
      </div>
    </div>
  );
};

interface ScheduleDisplayProps {
  schedule: Schedule | null;
  periodo: string;
  selections: ModuleSelection[];
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ schedule, periodo, selections }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleViewPdf = async () => {
    const scheduleContent = document.getElementById('schedule-pdf-content');
    if (!scheduleContent) {
      console.error('Elemento do cronograma não encontrado para gerar o PDF.');
      return;
    }
  
    setIsGeneratingPdf(true);
  
    // 1. Create a container for rendering
    const pdfContainer = document.createElement('div');
    pdfContainer.className = 'pdf-export-container';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'pdf-header';
    
    const logo = document.createElement('img');
    logo.src = 'https://cdn.cookielaw.org/logos/309bef31-1bad-4222-a8de-b66feda5e113/e1bda879-fe71-4686-b676-cc9fbc711aee/fcb85851-ec61-4efb-bae5-e72fdeacac0e/AFYA-FACULDADEMEDICAS-logo.png';
    logo.alt = 'Logo Afya Ciências Médicas';
    logo.className = 'pdf-logo';
    header.appendChild(logo);

    const title = document.createElement('h1');
    title.textContent = 'Cronograma de Aulas e Eventos';
    header.appendChild(title);
    pdfContainer.appendChild(header);
    
    const scheduleTitle = document.createElement('h2');
    scheduleTitle.className = 'pdf-title';
    scheduleTitle.textContent = `Cronograma para ${periodo}`;
    pdfContainer.appendChild(scheduleTitle);

    const contentClone = scheduleContent.cloneNode(true) as HTMLElement;
    contentClone.removeAttribute('id');
    const grid = contentClone.querySelector('.grid');
    if (grid) {
      grid.className = 'pdf-export-grid';
    }
    pdfContainer.appendChild(contentClone);

    document.body.appendChild(pdfContainer);

    // Give the browser a moment to render the content before capturing
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const { jsPDF } = window.jspdf;

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const contentImgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a3',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(contentImgData);
      const contentHeightInPdfUnits = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = contentHeightInPdfUnits;
      let position = 0;

      // Add first page
      pdf.addImage(contentImgData, 'PNG', 0, position, pdfWidth, contentHeightInPdfUnits, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add subsequent pages if content is taller than one page
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(contentImgData, 'PNG', 0, position, pdfWidth, contentHeightInPdfUnits, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const pdfUrl = pdf.output('bloburl');
      window.open(pdfUrl, '_blank');

    } catch (e) {
      console.error('Erro ao gerar o PDF:', e);
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
    } finally {
      document.body.removeChild(pdfContainer);
      setIsGeneratingPdf(false);
    }
  };
  
  const hasClasses = schedule && schedule.some(dia => dia.aulas.some(aula => !aula.isFreeSlot));

  if (!hasClasses) {
    return (
      <div className="text-center p-8 bg-slate-800 rounded-lg shadow-lg border border-slate-700 animate-fade-in">
        <NotFoundIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
        <p className="text-xl font-semibold text-gray-200">Nenhuma aula encontrada</p>
        <p className="text-md mt-1 text-gray-400">
          Não há aulas correspondentes aos filtros selecionados para esta semana.
        </p>
      </div>
    );
  }

  return (
    <div>
       <div className="flex justify-end mb-6">
        <button
          onClick={handleViewPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 border border-slate-600 disabled:opacity-50 disabled:cursor-wait shadow-sm"
        >
          {isGeneratingPdf ? (
            <>
              <SpinnerIcon className="w-4 h-4" /> Gerando PDF...
            </>
          ) : (
            <>
              <ExternalLinkIcon className="w-4 h-4" /> Visualizar PDF
            </>
          )}
        </button>
      </div>
      <div id="schedule-pdf-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedule.map((dia, index) => (
            <div key={dia.dia} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <DiaCard diaDeAula={dia} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleDisplay;