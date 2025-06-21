import { useEffect, useState, type FC } from "react";
import type { PageProps, TaskItem } from "../interface/types";
import { addDoc, collection, db, deleteDoc, doc, onSnapshot, updateDoc } from "../services/firebase";
import { Trash2 } from "lucide-react";




export const TasksPage: FC<PageProps> = ({ userId, appId }) => {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [newTask, setNewTask] = useState('');
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
        await addDoc(collection(db, tasksCollectionPath), {
            text: newTask,
            completed: false,
            createdAt: new Date().toISOString()
        });
        setNewTask('');
    };

    const toggleTask = async (task: TaskItem) => {
        await updateDoc(doc(db, tasksCollectionPath, task.id), { completed: !task.completed });
    };

    const deleteTask = async (id: string) => {
        await deleteDoc(doc(db, tasksCollectionPath, id));
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Lista de Tarefas</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <form onSubmit={handleAddTask} className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Adicionar nova tarefa..."
                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-colors">
                        Adicionar
                    </button>
                </form>
                <div>
                    {tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(task => (
                        <div key={task.id} className={`flex items-center p-3 rounded-lg mb-2 transition-all ${task.completed ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}>
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={`flex-1 ml-4 ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
                            <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500 p-2">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};