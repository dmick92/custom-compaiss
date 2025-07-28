'use client';

import { Strategy } from '~/types/strategy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, MoreHorizontal, Calendar, User, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface StrategyCardProps {
    strategy: Strategy;
    onEdit: (strategy: Strategy) => void;
    onDelete: (id: string) => void;
}

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

export function StrategyCard({ strategy, onEdit, onDelete }: StrategyCardProps) {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                            <Link href={`/plan/strategies/${strategy.id}`} className="hover:underline">
                                {strategy.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                            {strategy.description}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/plan/strategies/${strategy.id}`} className="flex items-center">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(strategy)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(strategy.id)}
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
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Badge className={statusColors[strategy.status]}>
                            {strategy.status}
                        </Badge>
                        <Badge variant="outline" className={priorityColors[strategy.priority]}>
                            {strategy.priority}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{strategy.owner}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(strategy.updatedAt, { addSuffix: true })}</span>
                    </div>
                </div>

                {strategy.processId && (
                    <div className="flex items-center gap-1 mt-3 text-sm">
                        <LinkIcon className="h-3 w-3 text-blue-500" />
                        <Link
                            href={`/plan/processes/${strategy.processId}`}
                            className="text-blue-500 hover:text-blue-600 hover:underline"
                        >
                            View Associated Process
                        </Link>
                    </div>
                )}

                {strategy.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {strategy.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {strategy.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                                +{strategy.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}