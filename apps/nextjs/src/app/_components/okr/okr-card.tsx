import React from 'react';
import { Calendar, Edit2, Trash2, Target } from 'lucide-react';
import { OKR } from '../types/okr';
import { ProgressBar } from './ProgressBar';
import { KeyResultItem } from './KeyResultItem';

interface OKRCardProps {
    okr: OKR;
    onEdit: (okr: OKR) => void;
    onDelete: (id: string) => void;
    onToggleKeyResult: (okrId: string, keyResultId: string) => void;
    onUpdateKeyResultProgress: (okrId: string, keyResultId: string, progress: number) => void;
}

export const OKRCard: React.FC<OKRCardProps> = ({
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
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
                            {okr.objective}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{okr.quarter}</span>
                            <span className="mx-2">•</span>
                            <span>{completedKeyResults}/{okr.keyResults.length} Key Results</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onEdit(okr)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(okr.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
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
        </div>
    );
};