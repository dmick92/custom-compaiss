import { priorities } from '~/app/_components/priority';

export interface KeyResult {
    id: string;
    description: string;
    completed: boolean;
    progress: number; // 0-100
    owner?: string;
    dueDate?: string;
    notes?: string;
}

export interface OKR {
    id: string;
    objective: string;
    keyResults: KeyResult[];
    quarter: string;
    createdAt: Date;
    updatedAt: Date;
    priority: (typeof priorities)[number];
    strategyId?: string; // Optional link to associated strategy
}

export interface CreateOKRData {
    objective: string;
    keyResults: string[];
    quarter: string;
    priority?: (typeof priorities)[number];
    strategyId?: string;
}