


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
}

export interface ActivityLog {
    id:string;
    activities: string;
    date: string;
}

export interface PageProps {
    userId: string;
    appId: string;
}