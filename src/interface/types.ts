


export interface FinancialItem {
  id: string;
  description: string;
  amount: number;
  type: 'income-client' | 'income-company' | 'expense';
  date: string;
  status: 'paid' | 'pending';
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'baixa' | 'media' | 'alta'
}

// Em seu arquivo /interface/types.ts

export interface ActivityLog {
  id: string;
  title: string;       // Novo: "Análise do Repositório GetPostDataBank"
  project: string;     // Novo: "Análise de Repositórios — Invista"
  responsible: string; // Novo: "Seu nome ou cargo"
  timeSpent: string;   // Novo: "8h"
  details: string;     // O conteúdo principal, antes chamado de "activities"
  date: string;
}

// ... outras interfaces

export interface PageProps {
    userId: string;
    appId: string;
}