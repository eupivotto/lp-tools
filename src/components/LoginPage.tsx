import { Chrome } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../services/firebase';
import type { FC } from 'react';

export const LoginPage: FC = () => {
    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Erro ao fazer login com o Google:", error);
        }
    };
    
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg text-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Bem-vindo ao Portal!</h1>
                    <p className="mt-2 text-gray-600">Faça login para continuar</p>
                </div>
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center cursor-pointer justify-center gap-3 py-3 px-4 bg-blue-500 text-white rounded-lg font-semibold shadow-md hover:bg-blue-600 transition-all duration-300"
                >
                    <Chrome size={20} />
                    Entrar com o Google
                </button>
            </div>
        </div>
    );
};


