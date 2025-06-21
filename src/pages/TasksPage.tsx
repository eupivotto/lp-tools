import { useEffect, useState, useMemo, type FC } from "react";
import type { PageProps, TaskItem } from "../interface/types";
import { addDoc, collection, db, deleteDoc, doc, onSnapshot, updateDoc } from "../services/firebase";
import { Trash2 } from "lucide-react";

export const TasksPage: FC<PageProps> = ({ userId, appId }) => {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [newTask, setNewTask] = useState('');
    // 👇 1. Novo estado para a prioridade da nova tarefa
    const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>('media');
    const tasksCollectionPath = `artifacts/${appId}/users/${userId}/tasks`;

    useEffect(() => {
        if (!userId) return;
        const unsubscribe = onSnapshot(collection(db, tasksCollectionPath), snapshot => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskItem)));
        });
        return () => unsubscribe();
    }, [userId, appId, tasksCollectionPath]);

    const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newTask.trim() === '') return;
        // 👇 2. Adiciona o campo 'priority' ao novo documento
        await addDoc(collection(db, tasksCollectionPath), {
            text: newTask,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: priority, 
        });
        setNewTask('');
        setPriority('media'); // Reseta a prioridade para o padrão
    };

    const toggleTask = async (task: TaskItem) => {
        await updateDoc(doc(db, tasksCollectionPath, task.id), { completed: !task.completed });
    };

    const deleteTask = async (id: string) => {
        await deleteDoc(doc(db, tasksCollectionPath, id));
    };

    // 👇 3. Função auxiliar para exibir a "pílula" de prioridade
    const getPriorityPill = (priority: 'baixa' | 'media' | 'alta') => {
        const styles = {
            baixa: 'bg-green-100 text-green-800',
            media: 'bg-yellow-100 text-yellow-800',
            alta: 'bg-red-100 text-red-800',
        };
        const text = {
            baixa: 'Baixa',
            media: 'Média',
            alta: 'Alta',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[priority]}`}>
                {text[priority]}
            </span>
        );
    };

    // 👇 4. Ordenação inteligente usando useMemo para performance
    const sortedTasks = useMemo(() => {
        const priorityOrder = { alta: 3, media: 2, baixa: 1 };
        return [...tasks].sort((a, b) => {
            // Se a prioridade for diferente, ordena por ela (maior primeiro)
            const priorityA = priorityOrder[a.priority] || 1;
            const priorityB = priorityOrder[b.priority] || 1;
            if (priorityA !== priorityB) {
                return priorityB - priorityA;
            }
            // Se a prioridade for igual, ordena por data (mais recente primeiro)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [tasks]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Lista de Tarefas</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Adicionar nova tarefa..."
                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {/* 👇 5. Seletor de prioridade no formulário */}
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as 'baixa' | 'media' | 'alta')}
                        className="p-3 border rounded-lg cursor-pointer bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="baixa">Baixa</option>
                    </select>
                    <button type="submit" className="bg-blue-500 cursor-pointer text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-colors">
                        Adicionar
                    </button>
                </form>
                <div>
                    {/* 👇 6. Mapeia a lista já ordenada */}
                    {sortedTasks.map(task => (
                        <div key={task.id} className={`flex items-center p-3 rounded-lg mb-2 transition-all ${task.completed ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}>
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={`flex-1 ml-4 ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
                            {/* 👇 7. Exibe a pílula de prioridade */}
                            {getPriorityPill(task.priority)}
                            <button onClick={() => deleteTask(task.id)} className="text-gray-400 cursor-pointer hover:text-red-500 p-2 ml-4">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
