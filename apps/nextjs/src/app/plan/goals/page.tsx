"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Target, BarChart3, Filter, Check, Circle, X, Calendar, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Progress } from '~/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog';




export interface KeyResult {
    id: string;
    description: string;
    completed: boolean;
    progress: number; // 0-100
}

export interface OKR {
    id: string;
    objective: string;
    keyResults: KeyResult[];
    quarter: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOKRData {
    objective: string;
    keyResults: string[];
    quarter: string;
}

function App() {
    const [okrs, setOkrs] = useState<OKR[]>([
        {
            id: '1',
            objective: 'Launch innovative mobile app that delights users and drives business growth',
            keyResults: [
                {
                    id: 'kr1',
                    description: 'Achieve 10,000 app downloads in the first month',
                    completed: false,
                    progress: 75,
                },
                {
                    id: 'kr2',
                    description: 'Maintain 4.5+ star rating on app stores',
                    completed: true,
                    progress: 100,
                },
                {
                    id: 'kr3',
                    description: 'Generate $50K in revenue from premium features',
                    completed: false,
                    progress: 30,
                },
            ],
            quarter: 'Q1 2025',
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-15'),
        },
        {
            id: '2',
            objective: 'Build a high-performance engineering team culture',
            keyResults: [
                {
                    id: 'kr4',
                    description: 'Hire 5 senior engineers by end of quarter',
                    completed: false,
                    progress: 60,
                },
                {
                    id: 'kr5',
                    description: 'Implement weekly code review process',
                    completed: true,
                    progress: 100,
                },
            ],
            quarter: 'Q1 2025',
            createdAt: new Date('2025-01-05'),
            updatedAt: new Date('2025-01-20'),
        },
    ]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingOKR, setEditingOKR] = useState<OKR | null>(null);
    const [deletingOKR, setDeletingOKR] = useState<OKR | null>(null);
    const [quarterFilter, setQuarterFilter] = useState<string>('All');

    const handleCreateOKR = (data: CreateOKRData) => {
        const newOKR: OKR = {
            id: `okr-${Date.now()}`,
            objective: data.objective,
            keyResults: data.keyResults.map((description, index) => ({
                id: `kr-${Date.now()}-${index}`,
                description,
                completed: false,
                progress: 0,
            })),
            quarter: data.quarter,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setOkrs([newOKR, ...okrs]);
    };

    const handleEditOKR = (okr: OKR) => {
        setEditingOKR(okr);
        setIsEditModalOpen(true);
    };

    const handleUpdateOKR = (updatedOKR: OKR) => {
        setOkrs(okrs.map(okr => okr.id === updatedOKR.id ? updatedOKR : okr));
    };

    const handleDeleteOKR = (okr: OKR) => {
        setDeletingOKR(okr);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteOKR = () => {
        if (deletingOKR) {
            setOkrs(okrs.filter(okr => okr.id !== deletingOKR.id));
            setDeletingOKR(null);
            setIsDeleteModalOpen(false);
        }
    };

    const handleToggleKeyResult = (okrId: string, keyResultId: string) => {
        setOkrs(okrs.map(okr => {
            if (okr.id === okrId) {
                return {
                    ...okr,
                    keyResults: okr.keyResults.map(kr => {
                        if (kr.id === keyResultId) {
                            return {
                                ...kr,
                                completed: !kr.completed,
                                progress: !kr.completed ? 100 : kr.progress,
                            };
                        }
                        return kr;
                    }),
                    updatedAt: new Date(),
                };
            }
            return okr;
        }));
    };

    const handleUpdateKeyResultProgress = (okrId: string, keyResultId: string, progress: number) => {
        setOkrs(okrs.map(okr => {
            if (okr.id === okrId) {
                return {
                    ...okr,
                    keyResults: okr.keyResults.map(kr => {
                        if (kr.id === keyResultId) {
                            return {
                                ...kr,
                                progress,
                                completed: progress === 100,
                            };
                        }
                        return kr;
                    }),
                    updatedAt: new Date(),
                };
            }
            return okr;
        }));
    };

    const quarters = ['All', ...Array.from(new Set(okrs.map(okr => okr.quarter)))];
    const filteredOKRs = quarterFilter === 'All'
        ? okrs
        : okrs.filter(okr => okr.quarter === quarterFilter);

    const totalOKRs = okrs.length;
    const completedOKRs = okrs.filter(okr =>
        okr.keyResults.every(kr => kr.completed)
    ).length;
    const averageProgress = okrs.length > 0
        ? okrs.reduce((acc, okr) => {
            const okrProgress = okr.keyResults.length > 0
                ? okr.keyResults.reduce((krAcc, kr) => krAcc + (kr.completed ? 100 : kr.progress), 0) / okr.keyResults.length
                : 0;
            return acc + okrProgress;
        }, 0) / okrs.length
        : 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">OKR Dashboard</h1>
                                <p className="text-sm text-muted-foreground">Objectives and Key Results Management</p>
                            </div>
                        </div>

                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus size={20} />
                            <span>Create OKR</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total OKRs</p>
                                    <p className="text-2xl font-bold text-foreground">{totalOKRs}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Target className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold text-foreground">{completedOKRs}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                                    <p className="text-2xl font-bold text-foreground">{Math.round(averageProgress)}%</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Filter by Quarter:</span>
                    </div>
                    <Select
                        value={quarterFilter}
                        onValueChange={setQuarterFilter}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {quarters.map(quarter => (
                                <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* OKR Grid */}
                {filteredOKRs.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredOKRs.map((okr) => (
                            <OKRCard
                                key={okr.id}
                                okr={okr}
                                onEdit={handleEditOKR}
                                onDelete={() => handleDeleteOKR(okr)}
                                onToggleKeyResult={handleToggleKeyResult}
                                onUpdateKeyResultProgress={handleUpdateKeyResultProgress}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {quarterFilter === 'All' ? 'No OKRs yet' : `No OKRs for ${quarterFilter}`}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {quarterFilter === 'All'
                                ? 'Get started by creating your first OKR to track objectives and key results.'
                                : `Create an OKR for ${quarterFilter} or select a different quarter.`
                            }
                        </p>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            size="lg"
                        >
                            <Plus size={20} />
                            <span>Create Your First OKR</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateOKRModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateOKR}
            />

            <EditOKRModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingOKR(null);
                }}
                onSubmit={handleUpdateOKR}
                okr={editingOKR}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingOKR(null);
                }}
                onConfirm={confirmDeleteOKR}
                objectiveName={deletingOKR?.objective || ''}
            />
        </div>
    );
}

export default App;











interface CreateOKRModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateOKRData) => void;
}

const CreateOKRModal: React.FC<CreateOKRModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [objective, setObjective] = useState('');
    const [keyResults, setKeyResults] = useState(['']);
    const [quarter, setQuarter] = useState('Q1 2025');

    const handleAddKeyResult = () => {
        setKeyResults([...keyResults, '']);
    };

    const handleRemoveKeyResult = (index: number) => {
        setKeyResults(keyResults.filter((_, i) => i !== index));
    };

    const handleKeyResultChange = (index: number, value: string) => {
        const updated = keyResults.map((kr, i) => (i === index ? value : kr));
        setKeyResults(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validKeyResults = keyResults.filter(kr => kr.trim() !== '');

        if (objective.trim() && validKeyResults.length > 0) {
            onSubmit({
                objective: objective.trim(),
                keyResults: validKeyResults,
                quarter,
            });

            // Reset form
            setObjective('');
            setKeyResults(['']);
            setQuarter('Q1 2025');
            onClose();
        }
    };

    const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New OKR">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label className="mb-2">
                        Objective
                    </Label>
                    <Textarea
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        rows={3}
                        placeholder="Enter a clear, inspirational objective..."
                        required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Make it qualitative and inspiring - something your team can rally behind
                    </p>
                </div>

                <div>
                    <Label className="mb-2">
                        Quarter
                    </Label>
                    <Select
                        value={quarter}
                        onValueChange={setQuarter}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {quarters.map(q => (
                                <SelectItem key={q} value={q}>{q}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>
                            Key Results
                        </Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddKeyResult}
                        >
                            <Plus size={16} />
                            <span>Add Key Result</span>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {keyResults.map((keyResult, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <Input
                                    type="text"
                                    value={keyResult}
                                    onChange={(e) => handleKeyResultChange(index, e.target.value)}
                                    placeholder={`Key Result ${index + 1}...`}
                                />
                                {keyResults.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveKeyResult(index)}
                                    >
                                        <X size={16} />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Make them specific, measurable, and achievable within the quarter
                    </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                    >
                        Create OKR
                    </Button>
                </div>
            </form>
        </Modal>
    );
};









interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    objectiveName: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    objectiveName,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete OKR">
            <div className="text-center">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>

                <h3 className="text-lg font-medium text-foreground mb-2">
                    Are you sure you want to delete this OKR?
                </h3>

                <p className="text-sm text-muted-foreground mb-2">
                    "{objectiveName}"
                </p>

                <p className="text-sm text-muted-foreground mb-6">
                    This action cannot be undone. All progress data will be permanently lost.
                </p>

                <div className="flex items-center justify-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                    >
                        Delete OKR
                    </Button>
                </div>
            </div>
        </Modal>
    );
};










interface EditOKRModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (okr: OKR) => void;
    okr: OKR | null;
}

const EditOKRModal: React.FC<EditOKRModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    okr,
}) => {
    const [objective, setObjective] = useState('');
    const [keyResults, setKeyResults] = useState<string[]>([]);
    const [quarter, setQuarter] = useState('Q1 2025');

    useEffect(() => {
        if (okr) {
            setObjective(okr.objective);
            setKeyResults(okr.keyResults.map(kr => kr.description));
            setQuarter(okr.quarter);
        }
    }, [okr]);

    const handleAddKeyResult = () => {
        setKeyResults([...keyResults, '']);
    };

    const handleRemoveKeyResult = (index: number) => {
        setKeyResults(keyResults.filter((_, i) => i !== index));
    };

    const handleKeyResultChange = (index: number, value: string) => {
        const updated = keyResults.map((kr, i) => (i === index ? value : kr));
        setKeyResults(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validKeyResults = keyResults.filter(kr => kr.trim() !== '');

        if (objective.trim() && validKeyResults.length > 0 && okr) {
            const updatedOKR: OKR = {
                ...okr,
                objective: objective.trim(),
                keyResults: validKeyResults.map((description, index) => {
                    const existingKR = okr.keyResults[index];
                    return existingKR && existingKR.description === description
                        ? existingKR
                        : {
                            id: existingKR?.id || `kr-${Date.now()}-${index}`,
                            description,
                            completed: existingKR?.completed || false,
                            progress: existingKR?.progress || 0,
                        };
                }),
                quarter,
                updatedAt: new Date(),
            };

            onSubmit(updatedOKR);
            onClose();
        }
    };

    const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

    if (!okr) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit OKR">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label className="mb-2">
                        Objective
                    </Label>
                    <Textarea
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        rows={3}
                        placeholder="Enter a clear, inspirational objective..."
                        required
                    />
                </div>

                <div>
                    <Label className="mb-2">
                        Quarter
                    </Label>
                    <Select
                        value={quarter}
                        onValueChange={setQuarter}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {quarters.map(q => (
                                <SelectItem key={q} value={q}>{q}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>
                            Key Results
                        </Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddKeyResult}
                        >
                            <Plus size={16} />
                            <span>Add Key Result</span>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {keyResults.map((keyResult, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <Input
                                    type="text"
                                    value={keyResult}
                                    onChange={(e) => handleKeyResultChange(index, e.target.value)}
                                    placeholder={`Key Result ${index + 1}...`}
                                />
                                {keyResults.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveKeyResult(index)}
                                    >
                                        <X size={16} />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                    >
                        Update OKR
                    </Button>
                </div>
            </form>
        </Modal>
    );
};








interface KeyResultItemProps {
    keyResult: KeyResult;
    onToggle: (id: string) => void;
    onProgressChange: (id: string, progress: number) => void;
    isEditable?: boolean;
}

const KeyResultItem: React.FC<KeyResultItemProps> = ({
    keyResult,
    onToggle,
    onProgressChange,
    isEditable = true,
}) => {
    return (
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <button
                onClick={() => onToggle(keyResult.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${keyResult.completed
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground hover:border-primary'
                    }`}
                disabled={!isEditable}
            >
                {keyResult.completed ? <Check size={12} /> : <Circle size={12} className="opacity-0" />}
            </button>

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${keyResult.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {keyResult.description}
                </p>

                {isEditable && !keyResult.completed && (
                    <div className="mt-2 flex items-center space-x-2">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={keyResult.progress}
                            onChange={(e) => onProgressChange(keyResult.id, parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <span className="text-xs font-medium text-muted-foreground w-12">{keyResult.progress}%</span>
                    </div>
                )}

                {!isEditable && (
                    <div className="mt-1">
                        <Progress
                            value={keyResult.completed ? 100 : keyResult.progress}
                            className="h-1.5"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};






interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};








interface OKRCardProps {
    okr: OKR;
    onEdit: (okr: OKR) => void;
    onDelete: (id: string) => void;
    onToggleKeyResult: (okrId: string, keyResultId: string) => void;
    onUpdateKeyResultProgress: (okrId: string, keyResultId: string, progress: number) => void;
}

const OKRCard: React.FC<OKRCardProps> = ({
    okr,
    onEdit,
    onDelete,
    onToggleKeyResult,
    onUpdateKeyResultProgress,
}) => {
    const completedKeyResults = okr.keyResults.filter(kr => kr.completed).length;
    const totalProgress = okr.keyResults.length > 0
        ? okr.keyResults.reduce((acc, kr) => acc + (kr.completed ? 100 : kr.progress), 0) / okr.keyResults.length
        : 0;

    return (
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-foreground leading-tight mb-2">
                                {okr.objective}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                                <Calendar className="w-4 h-4 mr-1" />
                                <Badge variant="outline" className="mr-2">{okr.quarter}</Badge>
                                <span className="mx-2">•</span>
                                <span>{completedKeyResults}/{okr.keyResults.length} Key Results</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(okr)}
                        >
                            <Edit2 size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(okr.id)}
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>Overall Progress</span>
                        <span className="font-medium">{Math.round(totalProgress)}%</span>
                    </div>
                    <ProgressBar progress={totalProgress} />
                </div>

                <div className="space-y-2">
                    {okr.keyResults.map((keyResult) => (
                        <KeyResultItem
                            key={keyResult.id}
                            keyResult={keyResult}
                            onToggle={(keyResultId) => onToggleKeyResult(okr.id, keyResultId)}
                            onProgressChange={(keyResultId, progress) =>
                                onUpdateKeyResultProgress(okr.id, keyResultId, progress)
                            }
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};






interface ProgressBarProps {
    progress: number;
    className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
    return (
        <Progress
            value={Math.min(progress, 100)}
            className={`h-2 ${className}`}
        />
    );
};