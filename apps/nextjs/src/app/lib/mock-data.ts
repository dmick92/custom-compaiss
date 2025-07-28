import { Strategy, Document } from '~/types/strategy';

// Mock processes for linking with strategies
export const mockProcesses = [
    {
        id: 'process-1',
        name: 'Digital Transformation Process',
        description: 'End-to-end process for implementing digital transformation initiatives'
    },
    {
        id: 'process-2',
        name: 'Market Expansion Process',
        description: 'Systematic approach to expanding into new markets'
    },
    {
        id: 'process-3',
        name: 'Product Innovation Process',
        description: 'Structured process for product development and innovation'
    },
    {
        id: 'process-4',
        name: 'Customer Onboarding Process',
        description: 'Streamlined customer onboarding and activation process'
    }
];

export const mockStrategies: Strategy[] = [
    {
        id: '1',
        title: 'Digital Transformation Initiative',
        description: 'Comprehensive strategy to modernize our digital infrastructure and processes across all departments.',
        status: 'active',
        priority: 'high',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-15'),
        tags: ['digital', 'transformation', 'technology'],
        owner: 'Sarah Johnson',
        processId: 'process-1'
    },
    {
        id: '2',
        title: 'Market Expansion Strategy',
        description: 'Strategic plan to expand into new geographic markets and customer segments.',
        status: 'draft',
        priority: 'medium',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-12-10'),
        tags: ['expansion', 'market', 'growth'],
        owner: 'Michael Chen',
        processId: 'process-2'
    },
    {
        id: '3',
        title: 'Sustainability Implementation',
        description: 'Environmental and social sustainability strategy to reduce carbon footprint and improve ESG ratings.',
        status: 'completed',
        priority: 'high',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-11-30'),
        tags: ['sustainability', 'ESG', 'environment'],
        owner: 'Emma Williams'
    },
    {
        id: '4',
        title: 'Product Innovation Framework',
        description: 'Framework for accelerating product development and innovation processes.',
        status: 'active',
        priority: 'medium',
        createdAt: new Date('2024-04-05'),
        updatedAt: new Date('2024-12-12'),
        tags: ['innovation', 'product', 'development'],
        owner: 'David Rodriguez',
        processId: 'process-3'
    }
];

export const mockDocuments: Document[] = [
    {
        id: '1',
        strategyId: '1',
        title: 'Digital Transformation Roadmap',
        type: 'word',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-12-05'),
        size: '2.4 MB',
        status: 'published'
    },
    {
        id: '2',
        strategyId: '1',
        title: 'Technology Stack Analysis',
        type: 'spreadsheet',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-11-15'),
        size: '1.8 MB',
        status: 'published'
    },
    {
        id: '3',
        strategyId: '1',
        title: 'Implementation Mind Map',
        type: 'mindmap',
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-12-01'),
        size: '850 KB',
        status: 'draft'
    },
    {
        id: '4',
        strategyId: '2',
        title: 'Market Research Report',
        type: 'word',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-12-08'),
        size: '3.2 MB',
        status: 'published'
    },
    {
        id: '5',
        strategyId: '2',
        title: 'Competitive Analysis',
        type: 'spreadsheet',
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-11-20'),
        size: '2.1 MB',
        status: 'published'
    }
];