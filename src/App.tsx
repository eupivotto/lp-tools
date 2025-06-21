import { useState, useEffect } from 'react';
import { Home, DollarSign, CheckSquare, Clock, ClipboardList, LogOut } from 'lucide-react';

// Importa os serviços e componentes
import { auth, onAuthStateChanged, signOut } from './services/firebase'; // Importa do ficheiro de serviço
import { LoginPage } from './components/LoginPage';
import {LoadingSpinner} from './components/LoadingSpinner';
import { NavItem } from './components/NavItem';

// Importa as Páginas
import {DashboardPage} from './pages/DashboardPage';
import { FinancePage } from './pages/FinancePage';
import { TasksPage } from './pages/TasksPage';
import { TimeClockPage} from './pages/TimeClockPage';
import { ActivityLogPage } from './pages/ActivityLogPage';

// Tipagem para o objeto de usuário do Firebase
// Tipagem para o objeto de usuário do Firebase
import type { User } from "firebase/auth";

const appId: string = 'meu-portal-pessoal'; 

export default function App() {
    const [activePage, setActivePage] = useState<string>('dashboard');
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // O onAuthStateChanged agora usa o 'auth' importado do serviço
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
            console.log("Estado de autenticação alterado. Usuário:", currentUser ? currentUser.uid : "Nenhum");
        });
        return () => unsubscribe();
    }, []);

    const renderPage = () => {
        if (!user) return null;
        const pageProps = { userId: user.uid, appId: appId };
        switch (activePage) {
            case 'dashboard': return <DashboardPage {...pageProps} />;
            case 'finance': return <FinancePage {...pageProps} />;
            case 'tasks': return <TasksPage {...pageProps} />;
            case 'time-clock': return <TimeClockPage />;
            case 'activities': return <ActivityLogPage {...pageProps} />;
            default: return <DashboardPage {...pageProps} />;
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <div className="flex h-full bg-gray-100 font-sans">
            <nav className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 text-center">
                    <img src={user.photoURL || ''} alt="Foto do Perfil" className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-blue-500" onError={(e) => { (e.target as HTMLImageElement).src="https://placehold.co/100x100/EBF8FF/3182CE?text=User"; }} />
                    <h1 className="text-md font-bold text-gray-800 truncate">{user.displayName}</h1>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <ul className="flex-1 p-2">
                    <NavItem icon={<Home size={20} />} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
                    <NavItem icon={<DollarSign size={20} />} label="Finanças" active={activePage === 'finance'} onClick={() => setActivePage('finance')} />
                    <NavItem icon={<CheckSquare size={20} />} label="Tarefas" active={activePage === 'tasks'} onClick={() => setActivePage('tasks')} />
                    <NavItem icon={<Clock size={20} />} label="Controle de Ponto" active={activePage === 'time-clock'} onClick={() => setActivePage('time-clock')} />
                    <NavItem icon={<ClipboardList size={20} />} label="Registro de Atividades" active={activePage === 'activities'} onClick={() => setActivePage('activities')} />
                </ul>
                 <div className="p-2 border-t border-gray-200">
                    <button onClick={() => signOut(auth)} className="flex items-center w-full p-3 my-1 rounded-lg text-left text-red-500 hover:bg-red-100 transition-colors duration-200">
                        <LogOut size={20} />
                        <span className="ml-4 font-medium">Sair</span>
                    </button>
                </div>
            </nav>
            <main className="flex-1 p-6 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
}
