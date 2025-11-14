
import React, { useMemo } from 'react';
import type { ModuleSelection, AulaEntry } from '../types';
import { getUniqueGroupsForModule } from '../services/scheduleService';

interface ScheduleFormProps {
  periodo: string;
  setPeriodo: (value: string) => void;
  availablePeriods: string[];
  selections: ModuleSelection[];
  availableModules: string[];
  allAulas: AulaEntry[];
  addSelection: () => void;
  removeSelection: (id: number) => void;
  updateSelection: (id: number, field: 'modulo' | 'grupo', value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  availableEletivas: string[];
  selectedEletivas: string[];
  addEletiva: () => void;
  removeEletiva: (disciplina: string) => void;
  eletivaToAdd: string;
  setEletivaToAdd: (value: string) => void;
}

const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | { value: string; label: string; disabled?: boolean })[];
  id: string;
  disabled?: boolean;
}> = ({ label, value, onChange, options, id, disabled = false }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="mb-2 text-sm font-medium text-gray-300">{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-afya-blue focus:border-afya-blue transition duration-150 ease-in-out appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {options.length === 0 && <option>Nenhuma opção disponível</option>}
      {options.map(option => {
        if (typeof option === 'string') {
          return <option key={option} value={option} className="bg-gray-800">{option}</option>
        }
        return <option key={option.value} value={option.value} disabled={option.disabled} className="bg-gray-800 disabled:text-gray-500">{option.label}</option>
      })}
    </select>
  </div>
);

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  periodo,
  setPeriodo,
  availablePeriods,
  selections,
  availableModules,
  allAulas,
  addSelection,
  removeSelection,
  updateSelection,
  onSearch,
  isLoading,
  availableEletivas,
  selectedEletivas,
  addEletiva,
  removeEletiva,
  eletivaToAdd,
  setEletivaToAdd,
}) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const selectedModules = useMemo(() => selections.map(s => s.modulo), [selections]);
  
  const eletivaOptions = useMemo(() => {
    const available = availableEletivas
        .filter(e => !selectedEletivas.includes(e))
        .sort();
    return [
      { value: '', label: 'Selecione a disciplina', disabled: true },
      ...available.map(e => ({ value: e, label: e }))
    ];
  }, [availableEletivas, selectedEletivas]);


  return (
    <div className="bg-gray-800/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700/50">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <SelectInput
              id="periodo"
              label="Período"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              options={availablePeriods}
              disabled={availablePeriods.length === 0}
            />
        </div>
        
        <hr className="my-6 border-gray-700" />
        
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Módulos e Grupos</h3>
        <div className="space-y-4">
          {selections.map((selection, index) => {
            const moduleOptions = availableModules.filter(
              mod => !selectedModules.includes(mod) || mod === selection.modulo
            ).sort();
            
            const groupOptions = getUniqueGroupsForModule(periodo, selection.modulo, allAulas);
            const isLastSelection = index === selections.length - 1;

            return (
              <div key={selection.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="md:col-span-4">
                  <SelectInput
                    id={`modulo-${selection.id}`}
                    label={`Módulo ${index + 1}`}
                    value={selection.modulo}
                    onChange={(e) => updateSelection(selection.id, 'modulo', e.target.value)}
                    options={moduleOptions}
                    disabled={availableModules.length === 0}
                  />
                </div>
                <div className="md:col-span-4">
                  <SelectInput
                    id={`grupo-${selection.id}`}
                    label={`Grupo ${index + 1}`}
                    value={selection.grupo}
                    onChange={(e) => updateSelection(selection.id, 'grupo', e.target.value)}
                    options={groupOptions}
                    disabled={!selection.modulo || groupOptions.length === 0}
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="mb-2 hidden md:block text-sm font-medium text-transparent select-none">&nbsp;</label>
                  <div className="flex gap-2 w-full">
                    {selections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSelection(selection.id)}
                        className="w-full bg-afya-pink text-white font-semibold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors duration-200"
                        aria-label={`Remover seleção ${index + 1}`}
                      >
                        Remover
                      </button>
                    )}
                    {isLastSelection && (
                       <button
                        type="button"
                        onClick={addSelection}
                        disabled={selectedModules.length >= availableModules.length}
                        className="w-full bg-gray-700 border border-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + Módulo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {availableEletivas.length > 0 && (
          <>
            <hr className="my-6 border-gray-700" />
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Disciplinas Eletivas (Opcional)</h3>

            <div className="flex items-end gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex-grow">
                    <SelectInput
                        id="eletiva-select"
                        label="Selecione a disciplina"
                        value={eletivaToAdd}
                        onChange={(e) => setEletivaToAdd(e.target.value)}
                        options={eletivaOptions}
                        disabled={eletivaOptions.length <= 1}
                    />
                </div>
                <div>
                    <label className="mb-2 hidden md:block text-sm font-medium text-transparent select-none">&nbsp;</label>
                    <button
                        type="button"
                        onClick={addEletiva}
                        disabled={!eletivaToAdd}
                        className="w-full bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Adicionar disciplina eletiva"
                    >
                        Adicionar
                    </button>
                </div>
            </div>

            {selectedEletivas.length > 0 && (
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Eletivas selecionadas:</h4>
                    <div className="flex flex-wrap gap-2">
                    {selectedEletivas.map(eletiva => (
                        <div key={eletiva} className="flex items-center gap-2 bg-afya-blue/80 text-white text-sm font-medium pl-3 pr-2 py-1 rounded-full animate-fade-in" style={{ animationDuration: '0.3s' }}>
                        <span>{eletiva}</span>
                        <button
                            type="button"
                            onClick={() => removeEletiva(eletiva)}
                            className="text-blue-200 hover:text-white hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            aria-label={`Remover ${eletiva}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        </div>
                    ))}
                    </div>
                </div>
            )}
          </>
        )}
        
        <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading || selections.some(s => !s.modulo || !s.grupo)}
              className="w-full flex justify-center items-center bg-afya-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-afya-blue transition-all duration-200 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Buscando...' : 'Buscar Cronograma'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;
