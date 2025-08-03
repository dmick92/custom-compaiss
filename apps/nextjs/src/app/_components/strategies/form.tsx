'use client';

import { useEffect, useState } from 'react';
import { Strategy, StrategyStatus, StrategyPriority } from '~/types/strategy';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Badge } from '~/components/ui/badge';
import { X } from 'lucide-react';
import { mockProcesses } from '~/app/lib/mock-data';
import { useTRPC } from '~/trpc/react';
import { useQuery } from '@tanstack/react-query';

type OrgUser = { id: string; name?: string | null; email: string; image?: string | null };

interface StrategyFormProps {
    strategy?: Strategy | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Keep 'owner' to satisfy existing Strategy UI type, but we will not edit it directly anymore
    onSave: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'> & { ownerUserId?: string | null }) => void;
}

export function StrategyForm({ strategy, open, onOpenChange, onSave }: StrategyFormProps) {
    const trpc = useTRPC();
    const [formData, setFormData] = useState({
        title: strategy?.title || '',
        description: strategy?.description || '',
        status: (strategy?.status || 'draft') as StrategyStatus,
        priority: (strategy?.priority || 'medium') as StrategyPriority,
        ownerUserId: undefined as string | undefined,
        owner: strategy?.owner || '', // keep for type compatibility on submit payload
        tags: strategy?.tags || [],
        processId: strategy?.processId || ''
    });
    const [newTag, setNewTag] = useState('');

    // Load users for active org with standard tRPC react hook
    const usersQuery = useQuery(trpc.user.listByActiveOrg.queryOptions());
    //const usersQuery = (trpc.user.listByActiveOrg as any).useQuery?.() ?? { data: [], isLoading: false };

    // Keep form state in sync when editingStrategy changes or dialog opens
    useEffect(() => {
        // Try to pre-populate ownerUserId from the active-org user list by matching the current 'owner' string
        const users: OrgUser[] = (((usersQuery as any).data) ?? []) as OrgUser[];
        const matchedOwnerId =
            strategy?.owner
                ? users.find(
                    (u) =>
                        (u.name && u.name.toLowerCase() === strategy.owner.toLowerCase()) ||
                        (u.email && u.email.toLowerCase() === strategy.owner.toLowerCase())
                )?.id
                : undefined;

        setFormData({
            title: strategy?.title || '',
            description: strategy?.description || '',
            status: (strategy?.status || 'draft') as StrategyStatus,
            priority: (strategy?.priority || 'medium') as StrategyPriority,
            ownerUserId: matchedOwnerId, // pre-populate when editing if we can match by name/email
            owner: strategy?.owner || '',
            tags: strategy?.tags || [],
            processId: strategy?.processId || ''
        });
        setNewTag('');
        // include usersQuery.data so prefill happens once users load
    }, [strategy, open, (usersQuery as any).data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Provide owner (string) for type compatibility, but the server uses ownerUserId
        onSave({
            ...formData,
            owner: formData.owner ?? '',
        });
        onOpenChange(false);
        if (!strategy) {
            setFormData({
                title: '',
                description: '',
                status: 'draft',
                priority: 'medium',
                ownerUserId: undefined,
                owner: '',
                tags: [],
                processId: ''
            });
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {strategy ? 'Edit Strategy' : 'Create New Strategy'}
                    </DialogTitle>
                    <DialogDescription>
                        {strategy ? 'Update the strategy details below.' : 'Fill in the details to create a new strategy.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter strategy title"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter strategy description"
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: StrategyStatus) => setFormData(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: StrategyPriority) => setFormData(prev => ({ ...prev, priority: value }))}
                            >
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="ownerUserId">Owner</Label>
                            <Select
                                value={formData.ownerUserId ?? 'none'}
                                onValueChange={(value) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        ownerUserId: value === 'none' ? undefined : value
                                    }))
                                }
                            >
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue placeholder={usersQuery.isLoading ? 'Loading users...' : 'Select a user'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Unassigned</SelectItem>
                                    {(((usersQuery as any).data ?? []) as OrgUser[]).map((u: OrgUser) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.name ?? u.email ?? u.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {strategy && !formData.ownerUserId && ((usersQuery as any).data?.length ?? 0) > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tip: We couldn’t match the existing owner; please choose one.
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="process">Associated Process (Optional)</Label>
                            <Select
                                value={formData.processId}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, processId: value }))}
                            >
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue placeholder="Select a process to link" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">No process linked</SelectItem>
                                    {mockProcesses.map((process) => (
                                        <SelectItem key={process.id} value={process.id}>
                                            {process.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="tags">Tags</Label>
                            <div className="space-y-2 mt-1">
                                <Input
                                    id="tags"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Add tags (press Enter to add)"
                                />
                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-1 hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {strategy ? 'Update Strategy' : 'Create Strategy'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}