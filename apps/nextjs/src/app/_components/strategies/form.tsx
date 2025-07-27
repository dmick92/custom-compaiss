'use client';

import { useState } from 'react';
import { Strategy, StrategyStatus, StrategyPriority } from '~/types/strategy';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Badge } from '~/components/ui/badge';
import { X } from 'lucide-react';

interface StrategyFormProps {
    strategy?: Strategy | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function StrategyForm({ strategy, open, onOpenChange, onSave }: StrategyFormProps) {
    const [formData, setFormData] = useState({
        title: strategy?.title || '',
        description: strategy?.description || '',
        status: (strategy?.status || 'draft') as StrategyStatus,
        priority: (strategy?.priority || 'medium') as StrategyPriority,
        owner: strategy?.owner || '',
        tags: strategy?.tags || []
    });
    const [newTag, setNewTag] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onOpenChange(false);
        if (!strategy) {
            setFormData({
                title: '',
                description: '',
                status: 'draft',
                priority: 'medium',
                owner: '',
                tags: []
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
                            <Label htmlFor="owner">Owner</Label>
                            <Input
                                id="owner"
                                value={formData.owner}
                                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                                placeholder="Enter strategy owner"
                                required
                            />
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