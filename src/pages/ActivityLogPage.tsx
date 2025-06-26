import { useEffect, useState, type FC } from "react";
import type { ActivityLog, PageProps } from "../interface/types";
// Importe as funções 'doc', 'updateDoc', e 'deleteDoc' do Firestore
import { addDoc, collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export const ActivityLogPage: FC<PageProps> = ({ userId, appId }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [newLog, setNewLog] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);

    // --- NOVOS ESTADOS PARA EDIÇÃO ---
    // Armazena o ID do log que está sendo editado
    const [editingLogId, setEditingLogId] = useState<string | null>(null); 
    // Armazena o texto do log que está sendo editado
    const [editingText, setEditingText] = useState(''); 

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

    const handleSaveNewLog = async () => {
        if (newLog.trim() === '') return;
        try {
            await addDoc(collection(db, logsCollectionPath), {
                activities: newLog,
                date: new Date().toISOString().split('T')[0]
            });
            setNewLog('');
            showNotification('Atividade registrada com sucesso!');
        } catch (error) {
            showNotification('Erro ao registrar atividade.', 'error');
            console.error("Erro ao adicionar documento: ", error);
        }
    };

    // --- NOVA FUNÇÃO PARA INICIAR A EDIÇÃO ---
    const handleStartEdit = (log: ActivityLog) => {
        setEditingLogId(log.id);
        setEditingText(log.activities);
    };

    // --- NOVA FUNÇÃO PARA CANCELAR A EDIÇÃO ---
    const handleCancelEdit = () => {
        setEditingLogId(null);
        setEditingText('');
    };

    // --- NOVA FUNÇÃO PARA SALVAR A ATUALIZAÇÃO ---
    const handleUpdateLog = async () => {
        if (!editingLogId || editingText.trim() === '') return;
        
        const logDocRef = doc(db, logsCollectionPath, editingLogId);

        try {
            await updateDoc(logDocRef, {
                activities: editingText
            });
            showNotification('Registro atualizado com sucesso!');
            handleCancelEdit(); // Reseta o estado de edição
        } catch (error) {
            showNotification('Falha ao atualizar o registro.', 'error');
            console.error("Erro ao atualizar o documento: ", error);
        }
    };

    // --- NOVA FUNÇÃO PARA EXCLUIR UM REGISTRO ---
    const handleDeleteLog = async (logId: string) => {
        // Confirmação antes de excluir é uma boa prática
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            const logDocRef = doc(db, logsCollectionPath, logId);
            try {
                await deleteDoc(logDocRef);
                showNotification('Registro excluído com sucesso!');
            } catch (error) {
                showNotification('Falha ao excluir o registro.', 'error');
                console.error("Erro ao excluir o documento: ", error);
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Atividades copiadas para a área de transferência!');
        }).catch(err => {
            showNotification('Falha ao copiar texto.', 'error');
            console.error('Falha ao copiar texto: ', err);
        });
    };

    return (
        <div>
            {notification && (
                <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {notification.message}
                </div>
            )}
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Registro de Atividades Diárias (Jira)</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h3 className="font-semibold text-lg mb-2">Adicionar novo registro</h3>
                <textarea
                    value={newLog}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewLog(e.target.value)}
                    placeholder="Liste as atividades que você fez hoje, uma por linha..."
                    className="w-full p-3 border rounded-lg h-32 mb-4"
                ></textarea>
                <button onClick={handleSaveNewLog} className="bg-blue-500 cursor-pointer text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600">
                    Salvar Atividades
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-4 px-3">Histórico de Atividades</h3>
                <table className="w-full table-auto">
                    <thead className="text-left text-gray-600 border-b">
                        <tr>
                            <th className="p-3 w-1/6">Data</th>
                            <th className="p-3 w-3/6">Atividades</th>
                            <th className="p-3 w-2/6 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-3 text-gray-600 align-top">
                                    {log.date ? new Date(log.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}
                                </td>
                                
                                {/* --- LÓGICA DE RENDERIZAÇÃO CONDICIONAL PARA EDIÇÃO --- */}
                                <td className="p-3 whitespace-pre-wrap align-top">
                                    {editingLogId === log.id ? (
                                        <textarea
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            className="w-full p-2 border rounded-lg h-24"
                                        />
                                    ) : (
                                        log.activities
                                    )}
                                </td>

                                <td className="p-3 text-center align-top">
                                    {editingLogId === log.id ? (
                                        // --- BOTÕES DE SALVAR/CANCELAR EM MODO DE EDIÇÃO ---
                                        <div className="flex flex-col space-y-2">
                                            <button onClick={handleUpdateLog} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                                Salvar
                                            </button>
                                            <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        // --- BOTÕES PADRÃO (EDITAR, EXCLUIR, COPIAR) ---
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => handleStartEdit(log)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">
                                                Editar
                                            </button>
                                            <button onClick={() => handleDeleteLog(log.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                                Excluir
                                            </button>
                                            <button onClick={() => copyToClipboard(log.activities)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300">
                                                Copiar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};