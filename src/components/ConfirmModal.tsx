import type { FC } from "react";


interface ConfirmModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: FC<ConfirmModalProps> = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">{message}</h3>
            <div className="flex justify-end gap-4">
                <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Confirmar</button>
            </div>
        </div>
    </div>
);
