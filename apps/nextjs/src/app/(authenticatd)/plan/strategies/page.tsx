'use client';

import { useState } from 'react';
import { Strategy } from '~/types/strategy';
import { mockStrategies } from '~/app/lib/mock-data';
import { StrategyCard } from '~/app/_components/strategies/card';
import { StrategyForm } from '~/app/_components/strategies/form';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '~/components/ui/alert-dialog';
import { Plus, Search, Filter } from 'lucide-react';

export default function StrategiesPage() {
    const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
    const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>(mockStrategies);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null);

    // Filter strategies based on search and filters
    useState(() => {
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

        setFilteredStrategies(filtered);
    }, [strategies, searchTerm, statusFilter, priorityFilter]);

    const handleCreateStrategy = () => {
        setEditingStrategy(null);
        setIsFormOpen(true);
    };

    const handleEditStrategy = (strategy: Strategy) => {
        setEditingStrategy(strategy);
        setIsFormOpen(true);
    };

    const handleSaveStrategy = (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingStrategy) {
            // Update existing strategy
            const updatedStrategy: Strategy = {
                ...editingStrategy,
                ...strategyData,
                updatedAt: new Date()
            };
            setStrategies(prev => prev.map(s => s.id === editingStrategy.id ? updatedStrategy : s));
        } else {
            // Create new strategy
            const newStrategy: Strategy = {
                ...strategyData,
                id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setStrategies(prev => [newStrategy, ...prev]);
        }
    };

    const handleDeleteStrategy = (id: string) => {
        setStrategyToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (strategyToDelete) {
            setStrategies(prev => prev.filter(s => s.id !== strategyToDelete));
            setStrategyToDelete(null);
        }
        setDeleteDialogOpen(false);
    };

    return (
        <div className="">
            <div className="max-w-7xl mx-auto px-4 py-8">
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
                                    <SelectItem value="completed">Completed</SelectItem>
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
        </div>
    );
}