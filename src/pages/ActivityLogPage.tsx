import { useEffect, useState, type FC } from "react";
import type { ActivityLog, PageProps } from "../interface/types";
import { addDoc, collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Edit, Trash2 } from "lucide-react"; // Adicionando ícones para botões

// Estado inicial para o formulário de um novo log
const initialLogState = {
    title: '',
    project: '',
    responsible: '',
    timeSpent: '',
    details: '',
    date: new Date().toISOString().split('T')[0],
};

export const ActivityLogPage: FC<PageProps> = ({ userId, appId }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    // --- ESTADO MODIFICADO PARA O FORMULÁRIO ESTRUTURADO ---
    const [newLogData, setNewLogData] = useState<Omit<ActivityLog, 'id'>>(initialLogState);
    
    // --- ESTADOS PARA EDIÇÃO E EXCLUSÃO ---
    const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    
    const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
    const logsCollectionPath = `artifacts/${appId}/users/${userId}/activityLogs`;

    useEffect(() => {
        if (!userId) return;
        const unsubscribe = onSnapshot(collection(db, logsCollectionPath), snapshot => {
            const data = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setLogs(data);
        });
        return () => unsubscribe();
    }, [userId, appId, logsCollectionPath]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // --- FUNÇÃO DE INPUT GENÉRICA PARA O FORMULÁRIO ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Se estiver editando, atualiza o estado de edição, senão, o de novo log
        if (editingLog) {
            setEditingLog({ ...editingLog, [name]: value });
        } else {
            setNewLogData({ ...newLogData, [name]: value });
        }
    };

    // --- LÓGICA DE SALVAR MODIFICADA ---
    const handleSaveLog = async () => {
        const dataToSave = editingLog ? { ...editingLog } : { ...newLogData };

        if (!dataToSave.title || !dataToSave.details) {
            showNotification('Título e Detalhes são campos obrigatórios.', 'error');
            return;
        }

        try {
            if (editingLog) {
                // Atualiza um log existente
                const logDocRef = doc(db, logsCollectionPath, editingLog.id);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...logToUpdate } = editingLog; // Remove o ID do objeto a ser salvo
                await updateDoc(logDocRef, logToUpdate);
                showNotification('Registro atualizado com sucesso!');
                setEditingLog(null); // Sai do modo de edição
            } else {
                // Adiciona um novo log
                await addDoc(collection(db, logsCollectionPath), dataToSave);
                showNotification('Atividade registrada com sucesso!');
                setNewLogData(initialLogState); // Limpa o formulário
            }
        } catch (error) {
            showNotification('Ocorreu um erro ao salvar o registro.', 'error');
            console.error("Erro ao salvar documento: ", error);
        }
    };

    // --- FUNÇÕES PARA EDIÇÃO E EXCLUSÃO ---
    const handleStartEdit = (log: ActivityLog) => {
        setEditingLog(log);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo para ver o formulário
    };

    const handleCancelEdit = () => {
        setEditingLog(null);
    };

    const handleDeleteLog = async () => {
        if (!itemToDelete) return;
        try {
            await deleteDoc(doc(db, logsCollectionPath, itemToDelete));
            showNotification('Registro excluído com sucesso!');
        } catch (error) {
            showNotification('Falha ao excluir o registro.', 'error');
        } finally {
            setItemToDelete(null); // Fecha o modal de confirmação (implícito)
        }
    };

    // Determina qual objeto de dados usar no formulário (novo ou em edição)
    const formDataSource = editingLog || newLogData;

    return (
        <div>
            {notification && (
                <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {notification.message}
                </div>
            )}
            
            {/* --- NOVO FORMULÁRIO DE INSERÇÃO/EDIÇÃO --- */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {editingLog ? 'Editar Registro de Atividade' : 'Adicionar Novo Registro'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campos do formulário */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input type="text" name="title" value={formDataSource.title} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Projeto</label>
                        <input type="text" name="project" value={formDataSource.project} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Responsável</label>
                        <input type="text" name="responsible" value={formDataSource.responsible} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tempo Investido (ex: 8h)</label>
                        <input type="text" name="timeSpent" value={formDataSource.timeSpent} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Data</label>
                        <input type="date" name="date" value={formDataSource.date} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Atividades Realizadas (Detalhes)</label>
                        <textarea name="details" value={formDataSource.details} onChange={handleInputChange} rows={10} className="mt-1 block w-full p-2 border rounded-md shadow-sm" />
                    </div>
                </div>
                <div className="mt-6 flex items-center gap-4">
                    <button onClick={handleSaveLog} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
                        {editingLog ? 'Salvar Alterações' : 'Salvar Atividade'}
                    </button>
                    {editingLog && (
                        <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-600 transition-colors">
                            Cancelar Edição
                        </button>
                    )}
                </div>
            </div>

            {/* --- NOVA EXIBIÇÃO EM FORMATO DE CARD --- */}
            <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Histórico de Atividades</h3>
                {logs.map(log => (
                    <div key={log.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-xl font-bold text-gray-900">{log.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    {new Date(log.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleStartEdit(log)} title="Editar" className="p-2 text-gray-500 hover:text-blue-600"><Edit size={18} /></button>
                                <button onClick={() => setItemToDelete(log.id)} title="Excluir" className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                                <p><strong className="font-semibold">Projeto:</strong> {log.project}</p>
                                <p><strong className="font-semibold">Responsável:</strong> {log.responsible}</p>
                                <p><strong className="font-semibold">Tempo:</strong> {log.timeSpent}</p>
                            </div>
                            <h5 className="font-semibold text-gray-800 mb-2">Detalhes da Atividade:</h5>
                            <p className="text-gray-700 whitespace-pre-wrap">{log.details}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Confirmação para Excluir (assumindo que você tem um componente ConfirmModal) */}
            {itemToDelete && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <h4 className="text-lg font-bold">Confirmar Exclusão</h4>
                        <p className="my-4">Tem certeza que deseja excluir este registro?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setItemToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                            <button onClick={handleDeleteLog} className="px-4 py-2 bg-red-600 text-white rounded-lg">Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};