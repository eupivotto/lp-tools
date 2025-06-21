import { useEffect, useState, type FC } from "react";
import type { FinancialItem, PageProps } from "../interface/types";
import { collection, db, deleteDoc, doc, onSnapshot } from "../services/firebase";
import { ConfirmModal } from "../components/ConfirmModal";
import { FinanceModal } from "../components/FinanceModal";
import { Edit, Plus, Trash2 } from "lucide-react";




export const FinancePage: FC<PageProps> = ({ userId, appId }) => {
    const [financials, setFinancials] = useState<FinancialItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<FinancialItem | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
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

    const getStatusPill = (item: FinancialItem) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const itemDate = new Date(item.date);

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
                <button onClick={() => handleOpenModal()} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors">
                    <Plus size={20} className="mr-2" />
                    Adicionar Lançamento
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <table className="w-full table-auto">
                    <thead className="text-left text-gray-600 border-b">
                        <tr>
                            <th className="p-3">Descrição</th>
                            <th className="p-3">Valor</th>
                            <th className="p-3">Tipo</th>
                            <th className="p-3">Vencimento</th>
                            <th className="p-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {financials.map(item => (
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
                                <td className="p-3 text-gray-600">{item.date ? new Date(item.date).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                <td className="p-3 text-center">{getStatusPill(item)}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => handleOpenModal(item)} className="text-gray-500 hover:text-blue-500 p-2">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(item.id)} className="text-gray-500 hover:text-red-500 p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showConfirm && <ConfirmModal message="Tem certeza que deseja excluir este item?" onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)} />}
            {isModalOpen && <FinanceModal item={currentItem} onClose={() => setIsModalOpen(false)} collectionPath={financialsCollectionPath} />}
        </div>
    );
};