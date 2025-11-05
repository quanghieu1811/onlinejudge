import React, { useState } from 'react';
import { Problem, Difficulty } from '../types';
import { generateProblem } from '../services/geminiService';
import ProblemView from './ProblemView';

interface GenerateProblemAIModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (problemData: Omit<Problem, 'id'>) => void;
}

const GenerateProblemAIModal: React.FC<GenerateProblemAIModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedProblem, setGeneratedProblem] = useState<Omit<Problem, 'id'> | null>(null);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Chủ đề không được để trống.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedProblem(null);
        try {
            const problemData = await generateProblem(topic, difficulty);
            setGeneratedProblem(problemData);
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi không mong muốn.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (generatedProblem) {
            onCreate(generatedProblem);
            // Reset state for next time
            setTopic('');
            setDifficulty('Easy');
            setGeneratedProblem(null);
        }
    };

    const handleClose = () => {
        // Reset state on close
        setTopic('');
        setDifficulty('Easy');
        setGeneratedProblem(null);
        setError(null);
        setIsLoading(false);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={handleClose}>
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-accent flex justify-between items-center">
                    <h2 className="text-xl font-bold text-highlight">Tạo bài toán bằng AI</h2>
                    <button onClick={handleClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                    {!generatedProblem && !isLoading && (
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="problem-topic" className="block text-sm font-medium text-text-secondary mb-1">Chủ đề hoặc ý tưởng</label>
                                <input 
                                    id="problem-topic"
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Ví dụ: Sắp xếp, Đệ quy, Mảng hai chiều..."
                                    className="w-full bg-accent text-text-primary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight"
                                />
                            </div>
                            <div>
                                <label htmlFor="problem-difficulty-ai" className="block text-sm font-medium text-text-secondary mb-1">Độ khó</label>
                                <select
                                    id="problem-difficulty-ai"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                                    className="w-full bg-accent text-text-primary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight"
                                >
                                    <option value="Easy">Dễ</option>
                                    <option value="Medium">Trung bình</option>
                                    <option value="Hard">Khó</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                             <svg className="animate-spin h-10 w-10 text-highlight" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-text-secondary">AI đang sáng tạo... Vui lòng chờ trong giây lát.</p>
                        </div>
                    )}
                    {error && !isLoading && <p className="text-red-400 text-center">{error}</p>}
                    {generatedProblem && !isLoading && (
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary mb-4">Xem trước bài toán đã tạo:</h3>
                            {/* We can reuse ProblemView for a consistent look */}
                            <div className="h-[50vh] border border-accent rounded-lg">
                               <ProblemView problem={{...generatedProblem, id: 'preview'}} currentUser={null} onManageTestCases={() => {}} />
                            </div>
                        </div>
                    )}
                </div>
                 
                <div className="p-4 border-t border-accent flex justify-end items-center">
                    <button onClick={handleClose} className="mr-2 bg-accent text-text-secondary font-semibold px-4 py-2 rounded-md hover:bg-opacity-80">
                        {generatedProblem ? "Hủy" : "Đóng"}
                    </button>
                    {generatedProblem ? (
                         <button onClick={handleSave} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-500">
                            Lưu bài toán
                        </button>
                    ) : (
                        <button onClick={handleGenerate} disabled={isLoading} className="bg-highlight text-white font-semibold px-4 py-2 rounded-md hover:bg-red-500 disabled:bg-gray-500">
                            {isLoading ? 'Đang tạo...' : 'Tạo bài'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateProblemAIModal;