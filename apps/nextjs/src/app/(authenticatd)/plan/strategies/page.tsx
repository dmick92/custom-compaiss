'use client';

import { useEffect, useMemo, useState } from 'react';
import { Strategy } from '~/types/strategy';
import { StrategyCard } from '~/app/_components/strategies/card';
import { StrategyForm } from '~/app/_components/strategies/form';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '~/components/ui/alert-dialog';
import { Plus, Search, Filter } from 'lucide-react';
import { useTRPC } from '~/trpc/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { auth } from '~/auth/server';

export default function StrategiesPage() {
    const trpc = useTRPC();

    // Queries
    const strategiesQuery = useQuery(trpc.strategy.list.queryOptions());

    // Mutations
    const createStrategy = useMutation(trpc.strategy.create.mutationOptions({
        onSuccess: () => strategiesQuery.refetch(),
    }));
    const updateStrategy = useMutation(trpc.strategy.update.mutationOptions({
        onSuccess: () => strategiesQuery.refetch(),
    }));
    const deleteStrategy = useMutation(trpc.strategy.delete.mutationOptions({
        onSuccess: () => strategiesQuery.refetch(),
    }));

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null);

    // Map backend Strategy to UI Strategy type
    const strategies: Strategy[] = useMemo(() => {
        const rows = strategiesQuery.data ?? [];
        // Map backend enums to UI enums
        const mapStatus = (val: any): Strategy['status'] => {
            const s = String(val).toUpperCase();
            if (s === 'DRAFT') return 'draft';
            if (s === 'ACTIVE') return 'active';
            if (s === 'ARCHIVED') return 'archived';
            return 'draft';
        };
        const mapPriority = (val: any): Strategy['priority'] => {
            const p = String(val).toUpperCase();
            if (p === 'HIGH' || p === 'CRITICAL') return 'high';
            if (p === 'MEDIUM') return 'medium';
            if (p === 'LOW' || p === 'LOWEST') return 'low';
            return 'medium';
        };

        return rows.map((s: any) => ({
            id: s.id,
            title: s.name,
            description: s.description ?? '',
            status: mapStatus(s.status),
            priority: mapPriority(s.priority),
            createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
            updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
            tags: [], // not modeled in DB; keep empty
            owner: '', // not modeled in DB; keep empty
            processId: s.processId ?? undefined,
        }));
    }, [strategiesQuery.data]);

    const filteredStrategies = useMemo(() => {
        let filtered = strategies;

        if (searchTerm) {
            filtered = filtered.filter(strategy =>
                strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                strategy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                strategy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(strategy => strategy.status === statusFilter);
        }

        if (priorityFilter !== 'all') {
            filtered = filtered.filter(strategy => strategy.priority === priorityFilter);
        }

        return filtered;
    }, [strategies, searchTerm, statusFilter, priorityFilter]);

    const handleCreateStrategy = () => {
        setEditingStrategy(null);
        setIsFormOpen(true);
    };

    const handleEditStrategy = (strategy: Strategy) => {
        setEditingStrategy(strategy);
        setIsFormOpen(true);
    };

    const handleSaveStrategy = (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'> & { ownerUserId?: string | null }) => {
        // Map UI payload to API schema
        const payload = {
            name: strategyData.title,
            description: strategyData.description,
            status: (strategyData.status === 'completed' ? 'ACTIVE' : strategyData.status.toUpperCase()) as 'DRAFT' | 'ACTIVE' | 'ARCHIVED',
            priority: (strategyData.priority === 'low' ? 'Low' : strategyData.priority.charAt(0).toUpperCase() + strategyData.priority.slice(1)) as 'Lowest' | 'Low' | 'Medium' | 'High' | 'Critical',
            processId: strategyData.processId && strategyData.processId !== '0' ? strategyData.processId : undefined,
            ownerUserId: strategyData.ownerUserId ?? undefined,
        };

        if (editingStrategy) {
            updateStrategy.mutate({ id: editingStrategy.id, ...payload });
        } else {
            createStrategy.mutate(payload as any);
        }
    };

    const handleDeleteStrategy = (id: string) => {
        setStrategyToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (strategyToDelete) {
            deleteStrategy.mutate({ id: strategyToDelete });
            setStrategyToDelete(null);
        }
        setDeleteDialogOpen(false);
    };

    return (
        <div className="container mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Strategies</h1>
                        <p className="text-muted-foreground mt-1">Manage your strategic initiatives and plans</p>
                    </div>
                    <Button onClick={handleCreateStrategy}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Strategy
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search strategies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Strategy Grid */}
            {filteredStrategies.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                        <Filter className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No strategies found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by creating your first strategy'
                        }
                    </p>
                    {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                        <Button onClick={handleCreateStrategy} className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Strategy
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStrategies.map((strategy) => (
                        <StrategyCard
                            key={strategy.id}
                            strategy={strategy}
                            onEdit={handleEditStrategy}
                            onDelete={handleDeleteStrategy}
                        />
                    ))}
                </div>
            )}

            {/* Strategy Form Dialog */}
            <StrategyForm
                strategy={editingStrategy}
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSave={handleSaveStrategy}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the strategy and all associated documents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}