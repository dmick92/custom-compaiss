export interface Strategy {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    owner: string;
    processId?: string; // Optional link to associated process
}

export interface Document {
    id: string;
    strategyId: string;
    title: string;
    type: 'word' | 'spreadsheet' | 'mindmap';
    content?: any;
    createdAt: Date;
    updatedAt: Date;
    size?: string;
    status: 'draft' | 'published';
}

export type DocumentType = Document['type'];
export type StrategyStatus = Strategy['status'];
export type StrategyPriority = Strategy['priority'];