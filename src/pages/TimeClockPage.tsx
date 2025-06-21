import { useState, type FC } from "react";





export const TimeClockPage: FC = () => {
    const [times, setTimes] = useState({ entry: '', lunchStart: '', lunchEnd: '' });
    const [exitTime, setExitTime] = useState('');
    const [error, setError] = useState('');

    const calculateExitTime = () => {
        const { entry, lunchStart, lunchEnd } = times;
        if (!entry || !lunchStart || !lunchEnd) {
            setError("Por favor, preencha todos os horários.");
            return;
        }
        setError('');
        const parseTime = (timeStr: string): Date => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
        };
        const entryDate = parseTime(entry);
        const lunchStartDate = parseTime(lunchStart);
        const lunchEndDate = parseTime(lunchEnd);
        const lunchDurationMs = lunchEndDate.getTime() - lunchStartDate.getTime();
        if(lunchDurationMs < 0) {
            setError("O horário de volta do almoço deve ser depois da saída.");
            return;
        }
        const totalWorkDurationMs = 8 * 60 * 60 * 1000;
        const exitDate = new Date(entryDate.getTime() + totalWorkDurationMs + lunchDurationMs);
        setExitTime(exitDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Calculadora de Ponto</h2>
            <div className="bg-white p-8 rounded-lg shadow-sm max-w-lg mx-auto">
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-700 mb-1">Entrada</label>
                        <input type="time" value={times.entry} onChange={e => setTimes({...times, entry: e.target.value})} className="w-full p-2 border rounded-lg" />
                    </div>
                     <div>
                        <label className="block text-gray-700 mb-1">Saída para Almoço</label>
                        <input type="time" value={times.lunchStart} onChange={e => setTimes({...times, lunchStart: e.target.value})} className="w-full p-2 border rounded-lg" />
                    </div>
                     <div>
                        <label className="block text-gray-700 mb-1">Volta do Almoço</label>
                        <input type="time" value={times.lunchEnd} onChange={e => setTimes({...times, lunchEnd: e.target.value})} className="w-full p-2 border rounded-lg" />
                    </div>
                </div>
                <button onClick={calculateExitTime} className="w-full bg-blue-500 cursor-pointer text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors">
                    Calcular Horário de Saída
                </button>
                {exitTime && !error && (
                    <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-center">
                        <p className="text-lg text-gray-700">Seu horário de saída é:</p>
                        <p className="text-4xl font-bold text-blue-600 mt-2">{exitTime}</p>
                    </div>
                )}
            </div>
        </div>
    );
};