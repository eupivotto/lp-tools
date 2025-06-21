import { useState, useEffect, useMemo, type FC } from 'react';
import { collection, db, onSnapshot } from '../services/firebase';
import type { FinancialItem, PageProps, TaskItem } from '../interface/types';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';




export const DashboardPage: FC<PageProps> = ({ userId, appId }) => {
    const [financials, setFinancials] = useState<FinancialItem[]>([]);
    const [tasks, setTasks] = useState<TaskItem[]>([]);

    useEffect(() => {
        if (!userId) return;
        const financialsCollectionPath = `artifacts/${appId}/users/${userId}/financials`;
        const tasksCollectionPath = `artifacts/${appId}/users/${userId}/tasks`;

        const unsubFinancials = onSnapshot(collection(db, financialsCollectionPath), snapshot => {
            setFinancials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialItem)));
        });
        const unsubTasks = onSnapshot(collection(db, tasksCollectionPath), snapshot => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskItem)));
        });

        return () => {
            unsubFinancials();
            unsubTasks();
        };
    }, [userId, appId]);

    const financialSummary = useMemo(() => {
        return financials.reduce((acc, item) => {
            const amount = typeof item.amount === 'number' ? item.amount : 0;
            if (item.type === 'income-company' || item.type === 'income-client') {
                acc.totalIncome += amount;
            } else {
                acc.totalExpense += amount;
            }
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });
    }, [financials]);

    const chartData = useMemo(() => {
        const dataByMonth: { [key: string]: { name: string, Receitas: number, Despesas: number } } = financials.reduce((acc, item) => {
            if (!item.date) return acc;
            const month = new Date(item.date).toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = { name: month, Receitas: 0, Despesas: 0 };
            }
            const amount = typeof item.amount === 'number' ? item.amount : 0;
            if (item.type.includes('income')) {
                acc[month].Receitas += amount;
            } else {
                acc[month].Despesas += amount;
            }
            return acc;
        }, {} as { [key: string]: { name: string, Receitas: number, Despesas: number } });
        return Object.values(dataByMonth).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [financials]);
    
    const incomeSourceData = useMemo(() => {
        const sources: { [key: string]: number } = financials
            .filter(item => item.type.includes('income'))
            .reduce((acc, item) => {
                const sourceName = item.type === 'income-company' ? 'Empresa' : 'Clientes';
                if (!acc[sourceName]) {
                    acc[sourceName] = 0;
                }
                const amount = typeof item.amount === 'number' ? item.amount : 0;
                acc[sourceName] += amount;
                return acc;
            }, {} as { [key: string]: number });
        return Object.entries(sources).map(([name, value]) => ({ name, value }));
    }, [financials]);

    const COLORS = ['#0088FE', '#FFBB28'];

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-600">Receita Total</h3>
                    <p className="text-3xl font-bold text-green-500">R$ {financialSummary.totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-600">Despesa Total</h3>
                    <p className="text-3xl font-bold text-red-500">R$ {financialSummary.totalExpense.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-600">Tarefas Pendentes</h3>
                    <p className="text-3xl font-bold text-yellow-500">{tasks.filter(t => !t.completed).length}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-4">Visão Geral Financeira Mensal</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="Receitas" fill="#22c55e" />
                            <Bar dataKey="Despesas" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-700 mb-4">Fontes de Receita</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={incomeSourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                            {incomeSourceData.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};