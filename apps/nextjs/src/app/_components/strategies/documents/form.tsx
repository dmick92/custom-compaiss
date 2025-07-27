'use client';

import { useState } from 'react';
import { Document, DocumentType } from '~/types/strategy';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { FileText, Table, Brain } from 'lucide-react';

interface DocumentFormProps {
    document?: Document | null;
    strategyId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const documentTypes = [
    { value: 'word' as DocumentType, label: 'Word Document', icon: FileText },
    { value: 'spreadsheet' as DocumentType, label: 'Spreadsheet', icon: Table },
    { value: 'mindmap' as DocumentType, label: 'Mind Map', icon: Brain }
];

export function DocumentForm({ document, strategyId, open, onOpenChange, onSave }: DocumentFormProps) {
    const [formData, setFormData] = useState({
        title: document?.title || '',
        type: (document?.type || 'word') as DocumentType,
        status: (document?.status || 'draft') as 'draft' | 'published'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            strategyId
        });
        onOpenChange(false);
        if (!document) {
            setFormData({
                title: '',
                type: 'word',
                status: 'draft'
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {document ? 'Edit Document' : 'Create New Document'}
                    </DialogTitle>
                    <DialogDescription>
                        {document ? 'Update the document details below.' : 'Fill in the details to create a new document.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter document title"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="type">Document Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value: DocumentType) => setFormData(prev => ({ ...prev, type: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {documentTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                            <type.icon className="h-4 w-4" />
                                            {type.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: 'draft' | 'published') => setFormData(prev => ({ ...prev, status: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {document ? 'Update Document' : 'Create Document'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}