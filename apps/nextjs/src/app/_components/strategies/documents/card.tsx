'use client';

import { Document } from '~/types/strategy';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { FileText, Table, Brain, Download, Edit, Trash2, MoreHorizontal, Calendar, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface DocumentCardProps {
    document: Document;
    onEdit: (document: Document) => void;
    onDelete: (id: string) => void;
}

const documentTypeIcons = {
    word: FileText,
    spreadsheet: Table,
    mindmap: Brain
};

const documentTypeLabels = {
    word: 'Word Document',
    spreadsheet: 'Spreadsheet',
    mindmap: 'Mind Map'
};

const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    published: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
};

export function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
    const IconComponent = documentTypeIcons[document.type];

    return (
        <Link href={`/plan/strategies/${document.strategyId}/${document.type}`}>
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm cursor-pointer">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <CardTitle className="text-base font-medium group-hover:text-primary transition-colors">
                                    {document.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{documentTypeLabels[document.type]}</span>
                                    {document.size && (
                                        <>
                                            <span>•</span>
                                            <span>{document.size}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {document.type === 'spreadsheet' && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/plan/strategies/${document.strategyId}/spreadsheet`}>
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Open in Spreadsheet
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit(document)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete(document.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                        <Badge className={statusColors[document.status]}>
                            {document.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDistanceToNow(document.updatedAt, { addSuffix: true })}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}