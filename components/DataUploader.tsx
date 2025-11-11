import React, { useState, useRef } from 'react';
import { updateDataFromExcel } from '../services/scheduleService';
import UploadIcon from './icons/UploadIcon';
import DownloadIcon from './icons/DownloadIcon';
import type { AulaEntry, Event } from '../types';

interface DataUploaderProps {
  onUploadSuccess: (data: { aulasData: AulaEntry[], eventsData: Event[] }) => void;
}

// Senha para proteger o upload. Em uma aplicação real, isso deveria ser mais seguro.
const ADMIN_PASSWORD = "afyaadmin2024";

const DataUploader: React.FC<DataUploaderProps> = ({ onUploadSuccess }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [generatedFiles, setGeneratedFiles] = useState<{ aulas: string; eventos: string; } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setStatus('idle');
        setMessage('');
        setGeneratedFiles(null);
    };

    const downloadJson = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setGeneratedFiles(null);

        const password = window.prompt("Acesso Restrito: Digite a senha para processar a planilha.");
        
        if (password !== ADMIN_PASSWORD) {
            if (password !== null) { // Usuário digitou algo e clicou OK
                setStatus('error');
                setMessage('Senha incorreta. Upload cancelado.');
                setTimeout(resetState, 3000);
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setStatus('loading');
        setMessage('Processando planilha...');

        try {
            const parsedData = await updateDataFromExcel(file);
            onUploadSuccess(parsedData); // Chama o callback com os novos dados
            
            setGeneratedFiles({
                aulas: JSON.stringify(parsedData.aulasData, null, 2),
                eventos: JSON.stringify(parsedData.eventsData, null, 2),
            });

            setStatus('success');
            setMessage('Planilha carregada! A pré-visualização foi atualizada em sua tela.');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Falha ao processar o arquivo. Verifique o formato e tente novamente.');
             setTimeout(resetState, 5000);
        } finally {
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const getStatusColor = () => {
        switch(status) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'loading': return 'text-blue-400';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
                aria-hidden="true"
            />
            <button
                onClick={handleButtonClick}
                disabled={status === 'loading'}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 border border-gray-600 disabled:opacity-50 disabled:cursor-wait"
            >
                <UploadIcon className="w-4 h-4" />
                Atualizar Dados via Planilha
            </button>
            {message && <p className={`text-sm text-center ${getStatusColor()}`} role="status">{message}</p>}

            {status === 'success' && generatedFiles && (
                <div className="w-full mt-2 p-4 bg-gray-900/50 rounded-lg border border-gray-600 text-center space-y-4">
                     <div>
                        <h4 className="font-semibold text-white mb-1">Atualização para Todos os Usuários</h4>
                        <p className="text-xs text-gray-400">Para disponibilizar estes dados para todos, baixe os arquivos e substitua os existentes na pasta <code>/public</code> do projeto.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button 
                            onClick={() => downloadJson(generatedFiles.aulas, 'aulas.json')}
                            className="flex items-center justify-center gap-2 bg-afya-blue hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Baixar aulas.json
                        </button>
                        <button 
                            onClick={() => downloadJson(generatedFiles.eventos, 'eventos.json')}
                            className="flex items-center justify-center gap-2 bg-afya-pink hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Baixar eventos.json
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataUploader;