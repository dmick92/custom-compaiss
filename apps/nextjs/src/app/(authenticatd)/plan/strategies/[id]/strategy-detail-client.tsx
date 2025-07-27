'use client';

import { useState, useEffect } from 'react';
import { Strategy, Document } from '~/types/strategy';
import { mockDocuments } from '~/app/lib/mock-data';
import { DocumentCard } from '~/app/_components/strategies/documents/card';
import { DocumentForm } from '~/app/_components/strategies/documents/form';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '~/components/ui/alert-dialog';
import { ArrowLeft, Plus, Calendar, User, Tag, FileText, Table, Brain } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    completed: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    archived: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
};

const priorityColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
    high: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
};

const documentTypeIcons = {
    word: FileText,
    spreadsheet: Table,
    mindmap: Brain
};

interface StrategyDetailClientProps {
    strategy: Strategy;
    initialDocuments: Document[];
    strategyId: string;
}

export default function StrategyDetailClient({ strategy, initialDocuments, strategyId }: StrategyDetailClientProps) {
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

    const handleCreateDocument = () => {
        setEditingDocument(null);
        setIsDocumentFormOpen(true);
    };

    const handleEditDocument = (document: Document) => {
        setEditingDocument(document);
        setIsDocumentFormOpen(true);
    };

    const handleSaveDocument = (documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingDocument) {
            // Update existing document
            const updatedDocument: Document = {
                ...editingDocument,
                ...documentData,
                updatedAt: new Date(),
                size: '1.2 MB' // Mock size
            };
            setDocuments(prev => prev.map(d => d.id === editingDocument.id ? updatedDocument : d));
        } else {
            // Create new document
            const newDocument: Document = {
                ...documentData,
                id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date(),
                updatedAt: new Date(),
                size: '1.2 MB' // Mock size
            };
            setDocuments(prev => [newDocument, ...prev]);
        }
    };

    const handleDeleteDocument = (id: string) => {
        setDocumentToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteDocument = () => {
        if (documentToDelete) {
            setDocuments(prev => prev.filter(d => d.id !== documentToDelete));
            setDocumentToDelete(null);
        }
        setDeleteDialogOpen(false);
    };

    const documentStats = {
        total: documents.length,
        word: documents.filter(d => d.type === 'word').length,
        spreadsheet: documents.filter(d => d.type === 'spreadsheet').length,
        mindmap: documents.filter(d => d.type === 'mindmap').length
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/plan/strategies">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Strategies
                            </Button>
                        </Link>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{strategy.title}</h1>
                            <p className="text-muted-foreground text-lg mb-4">{strategy.description}</p>

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Badge className={statusColors[strategy.status]}>
                                        {strategy.status}
                                    </Badge>
                                    <Badge variant="outline" className={priorityColors[strategy.priority]}>
                                        {strategy.priority} priority
                                    </Badge>
                                </div>

                                <Separator orientation="vertical" className="h-6" />

                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>{strategy.owner}</span>
                                </div>

                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Updated {formatDistanceToNow(strategy.updatedAt, { addSuffix: true })}</span>
                                </div>
                            </div>

                            {strategy.tags.length > 0 && (
                                <div className="flex items-center gap-2 mb-6">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-wrap gap-2">
                                        {strategy.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Document Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{documentStats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                Word Docs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{documentStats.word}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Table className="h-4 w-4" />
                                Spreadsheets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{documentStats.spreadsheet}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Brain className="h-4 w-4" />
                                Mind Maps
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{documentStats.mindmap}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Documents Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold">Documents</h2>
                            <p className="text-muted-foreground">Manage documents for this strategy</p>
                        </div>
                        <Button onClick={handleCreateDocument}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Document
                        </Button>
                    </div>

                    {documents.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <div className="text-muted-foreground mb-4">
                                    <FileText className="h-12 w-12 mx-auto" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Get started by creating your first document for this strategy
                                </p>
                                <Button onClick={handleCreateDocument}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Document
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documents.map((document) => (
                                <DocumentCard
                                    key={document.id}
                                    document={document}
                                    onEdit={handleEditDocument}
                                    onDelete={handleDeleteDocument}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Document Form Dialog */}
                <DocumentForm
                    document={editingDocument}
                    strategyId={strategyId}
                    open={isDocumentFormOpen}
                    onOpenChange={setIsDocumentFormOpen}
                    onSave={handleSaveDocument}
                />

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the document.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteDocument} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}