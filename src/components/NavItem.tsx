import type { FC, ReactNode } from "react";

interface NavItemProps {
    icon: ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

export const NavItem: FC<NavItemProps> = ({ icon, label, active, onClick }) => (
    <li>
        <button
            onClick={onClick}
            className={`flex items-center w-full p-3 my-1 rounded-lg text-left transition-colors duration-200 ${
                active ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {icon}
            <span className="ml-4 font-medium">{label}</span>
        </button>
    </li>
);