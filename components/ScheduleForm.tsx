import React, { useMemo, useState, useEffect } from 'react';
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
  onEletivaChange: (eletiva: string, isChecked: boolean) => void;
}

const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
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
      {options.map(option => <option key={option} value={option} className="bg-gray-800">{option}</option>)}
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
  onEletivaChange,
}) => {
  const [eletivaToAdd, setEletivaToAdd] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const selectedModules = useMemo(() => selections.map(s => s.modulo), [selections]);

  const unselectedEletivas = useMemo(() =>
    availableEletivas.filter(e => !selectedEletivas.includes(e)),
    [availableEletivas, selectedEletivas]
  );
  
  useEffect(() => {
    // Define o valor padrão do dropdown para a primeira eletiva disponível
    if (unselectedEletivas.length > 0) {
      setEletivaToAdd(unselectedEletivas[0]);
    } else {
      setEletivaToAdd('');
    }
  }, [unselectedEletivas]);

  const handleAddEletiva = () => {
    if (eletivaToAdd) {
      onEletivaChange(eletivaToAdd, true);
    }
  };

  const handleRemoveEletiva = (eletiva: string) => {
    onEletivaChange(eletiva, false);
  };


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
        
        <div className="space-y-4 mb-6">
          {selections.map((selection, index) => {
            const moduleOptions = availableModules.filter(
              mod => !selectedModules.includes(mod) || mod === selection.modulo
            ).sort();
            
            const groupOptions = getUniqueGroupsForModule(periodo, selection.modulo, allAulas);

            return (
              <div key={selection.id} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end p-4 bg-gray-900/50 rounded-lg border border-gray-700">
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
                <div className="md:col-span-2">
                  <label className="mb-2 hidden md:block text-sm font-medium text-transparent select-none">&nbsp;</label>
                  {selections.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeSelection(selection.id)}
                      className="w-full bg-afya-pink text-white font-semibold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors duration-200"
                      aria-label={`Remover seleção ${index + 1}`}
                    >
                      Remover
                    </button>
                  ) : <div className="h-[50px]"></div>}
                </div>
              </div>
            );
          })}
        </div>
        
        {availableEletivas.length > 0 && (
          <>
            <hr className="my-6 border-gray-700" />
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 text-center">Disciplinas Eletivas (Opcional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-lg mx-auto">
                <div className="md:col-span-2">
                    <SelectInput
                        id="eletiva-select"
                        label="Selecione a disciplina"
                        value={eletivaToAdd}
                        onChange={(e) => setEletivaToAdd(e.target.value)}
                        options={unselectedEletivas}
                        disabled={unselectedEletivas.length === 0}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAddEletiva}
                    disabled={!eletivaToAdd}
                    className="w-full bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Adicionar
                </button>
              </div>

              {selectedEletivas.length > 0 && (
                  <div className="mt-4 max-w-lg mx-auto p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Disciplinas selecionadas:</h4>
                      <div className="flex flex-wrap gap-2">
                          {selectedEletivas.map(eletiva => (
                              <div key={eletiva} className="flex items-center gap-2 bg-afya-blue/80 text-white text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                                  <span>{eletiva}</span>
                                  <button
                                      type="button"
                                      onClick={() => handleRemoveEletiva(eletiva)}
                                      className="text-white/70 hover:text-white font-bold leading-none"
                                      aria-label={`Remover ${eletiva}`}
                                  >
                                      &times;
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <button
              type="button"
              onClick={addSelection}
              disabled={selectedModules.length >= availableModules.length}
              className="w-full bg-gray-700 border border-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Adicionar Módulo
            </button>

            <button
              type="submit"
              disabled={isLoading || selections.some(s => !s.modulo || !s.grupo)}
              className="w-full flex justify-center items-center bg-afya-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afya-blue transition-all duration-200 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? 'Buscando...' : 'Buscar Cronograma'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;