import { useState, type FC } from "react";
import { addDoc, collection, db, doc, updateDoc } from "../services/firebase";
import { type FinancialItem } from "../interface/types";



interface FinanceModalProps {
    item: FinancialItem | null;
    onClose: () => void;
    collectionPath: string;
}

export const FinanceModal: FC<FinanceModalProps> = ({ item, onClose, collectionPath }) => {
    const [formData, setFormData] = useState({
        description: item?.description || '',
        amount: item?.amount || '',
        type: item?.type || 'income-client',
        date: item?.date || new Date().toISOString().split('T')[0],
        status: item?.status || 'pending'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const dataToSave = { ...formData, amount: parseFloat(String(formData.amount)) || 0 };
        if (item) {
            await updateDoc(doc(db, collectionPath, item.id), dataToSave);
        } else {
            await addDoc(collection(db, collectionPath), dataToSave);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold mb-6">{item ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Descrição</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Valor (R$)</label>
                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full p-2 border rounded" required step="0.01" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Tipo</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                            <option value="income-client">Receita (Cliente)</option>
                            <option value="income-company">Receita (Empresa)</option>
                            <option value="expense">Despesa</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-1">Data de Vencimento</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">{item ? 'Salvar Alterações' : 'Adicionar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};