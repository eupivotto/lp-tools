import { useEffect, useState, type FC } from "react";
import type { ActivityLog, PageProps } from "../interface/types";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";






export const ActivityLogPage: FC<PageProps> = ({ userId, appId }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [newLog, setNewLog] = useState('');
    const [notification, setNotification] = useState<{message: string; type: string} | null>(null);
    const logsCollectionPath = `artifacts/${appId}/users/${userId}/activityLogs`;
    
    useEffect(() => {
        if (!userId) return;
        const unsubscribe = onSnapshot(collection(db, logsCollectionPath), snapshot => {
            const data = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog))
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setLogs(data);
        });
        return () => unsubscribe();
    }, [userId, appId, logsCollectionPath]);

    const handleSaveLog = async () => {
        if (newLog.trim() === '') return;
        await addDoc(collection(db, logsCollectionPath), {
            activities: newLog,
            date: new Date().toISOString().split('T')[0]
        });
        setNewLog('');
        showNotification('Atividade registrada com sucesso!');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Atividades copiadas para a área de transferência!');
        }).catch(err => {
            showNotification('Falha ao copiar texto.', 'error');
            console.error('Falha ao copiar texto: ', err);
        });
    };

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
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
                <button onClick={handleSaveLog} className="bg-blue-500 cursor-pointer text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600">
                    Salvar Atividades
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-4 px-3">Histórico de Atividades</h3>
                 <table className="w-full table-auto">
                    <thead className="text-left text-gray-600 border-b">
                        <tr>
                            <th className="p-3">Data</th>
                            <th className="p-3">Atividades</th>
                            <th className="p-3 text-center">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-3 text-gray-600 align-top">{log.date ? new Date(log.date).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                <td className="p-3 whitespace-pre-wrap">{log.activities}</td>
                                <td className="p-3 text-center align-top">
                                    <button onClick={() => copyToClipboard(log.activities)} className="bg-gray-200 cursor-pointer text-gray-800 px-3 py-1 rounded hover:bg-gray-300">
                                        Copiar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};