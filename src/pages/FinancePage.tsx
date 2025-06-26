import { useEffect, useState, useMemo, type FC } from "react";
import type { FinancialItem, PageProps } from "../interface/types";
import { collection, db, deleteDoc, doc, onSnapshot } from "../services/firebase";
import { ConfirmModal } from "../components/ConfirmModal";
import { FinanceModal } from "../components/FinanceModal";
import { Edit, Plus, Trash2 } from "lucide-react";

// Constante para o número de itens por página
const ITEMS_PER_PAGE = 10;

export const FinancePage: FC<PageProps> = ({ userId, appId }) => {
    const [financials, setFinancials] = useState<FinancialItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<FinancialItem | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // --- NOVOS ESTADOS PARA FILTRO E PAGINAÇÃO ---
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);

    const financialsCollectionPath = `artifacts/${appId}/users/${userId}/financials`;

    useEffect(() => {
        if (!userId) return;
        const unsubscribe = onSnapshot(collection(db, financialsCollectionPath), snapshot => {
            const data = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as FinancialItem))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setFinancials(data);
        });
        return () => unsubscribe();
    }, [userId, appId, financialsCollectionPath]);

    // --- LÓGICA DE FILTRO E PAGINAÇÃO ---

    // 1. Filtra os itens com base no mês e ano selecionados
    const filteredFinancials = useMemo(() => {
        return financials.filter(item => {
            // Adiciona T12:00:00Z para evitar problemas de fuso horário
            const itemDate = new Date(item.date + 'T12:00:00Z');
            return itemDate.getFullYear() === selectedMonth.getFullYear() &&
                   itemDate.getMonth() === selectedMonth.getMonth();
        });
    }, [financials, selectedMonth]);
    
    // 2. Reseta para a primeira página sempre que o filtro mudar
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedMonth]);


    // 3. Pega a lista filtrada e aplica a paginação
    const paginatedFinancials = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredFinancials.slice(startIndex, endIndex);
    }, [filteredFinancials, currentPage]);

    // Calcula o número total de páginas
    const totalPages = Math.ceil(filteredFinancials.length / ITEMS_PER_PAGE);

    // Funções para navegar entre as páginas
    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };
    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    // Função para lidar com a mudança do input de mês
    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Adiciona '-02' para garantir que a data seja criada corretamente no fuso local
        const date = new Date(e.target.value + '-02T00:00:00');
        setSelectedMonth(date);
    };

    const getStatusPill = (item: FinancialItem) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const itemDate = new Date(item.date + 'T12:00:00Z');

        if (item.status === 'paid') {
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Pago</span>;
        }
        if (item.status === 'pending') {
            if (itemDate < today) {
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Atrasado</span>;
            }
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pendente</span>;
        }
        return null;
    };

    const handleOpenModal = (item: FinancialItem | null = null) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if(itemToDelete) {
            await deleteDoc(doc(db, financialsCollectionPath, itemToDelete));
        }
        setShowConfirm(false);
        setItemToDelete(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Controle Financeiro</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-blue-500 cursor-pointer text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors">
                    <Plus size={20} className="mr-2" />
                    Adicionar Lançamento
                </button>
            </div>
            
            {/* --- UI DO FILTRO DE MÊS --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center space-x-4">
                <label htmlFor="month-filter" className="font-semibold text-gray-700">Filtrar por Mês:</label>
                <input
                    type="month"
                    id="month-filter"
                    value={selectedMonth.toISOString().slice(0, 7)} // Formato YYYY-MM
                    onChange={handleMonthChange}
                    className="p-2 border rounded-lg"
                />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <table className="w-full table-auto">
                    <thead className="text-left text-gray-600 border-b">
                        <tr>
                            <th className="p-3">Descrição</th>
                            <th className="p-3">Valor</th>
                            <th className="p-3">Tipo</th>
                            <th className="p-3">Vencimento</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* --- MAPEIA OS DADOS PAGINADOS --- */}
                        {paginatedFinancials.map(item => (
                            <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-3 font-medium">{item.description}</td>
                                <td className={`p-3 font-semibold ${item.type.includes('income') ? 'text-green-600' : 'text-red-600'}`}>
                                    R$ {(typeof item.amount === 'number' ? item.amount : 0).toFixed(2)}
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        item.type === 'income-company' ? 'bg-blue-100 text-blue-800' :
                                        item.type === 'income-client' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {item.type === 'income-company' ? 'Salário Empresa' : item.type === 'income-client' ? 'Cliente (Agência)' : 'Despesa'}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-600">{item.date ? new Date(item.date + 'T12:00:00Z').toLocaleDateString('pt-BR') : 'N/A'}</td>
                                <td className="p-3 text-center">{getStatusPill(item)}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => handleOpenModal(item)} className="text-gray-500 cursor-pointer hover:text-blue-500 p-2">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(item.id)} className="text-gray-500 cursor-pointer hover:text-red-500 p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* --- CONTROLES DE PAGINAÇÃO --- */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-600">
                        Mostrando {paginatedFinancials.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} a {(currentPage - 1) * ITEMS_PER_PAGE + paginatedFinancials.length} de {filteredFinancials.length} itens
                    </span>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={goToPreviousPage} 
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages > 0 ? totalPages : 1}
                        </span>
                        <button 
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>
            {showConfirm && <ConfirmModal message="Tem certeza que deseja excluir este item?" onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)} />}
            {isModalOpen && <FinanceModal item={currentItem} onClose={() => setIsModalOpen(false)} collectionPath={financialsCollectionPath} />}
        </div>
    );
};