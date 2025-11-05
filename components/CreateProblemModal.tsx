import React, { useState } from 'react';
import { Problem, TestCase, Difficulty } from '../types';

interface CreateProblemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (problemData: Omit<Problem, 'id'>) => void;
}

const CreateProblemModal: React.FC<CreateProblemModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleTestCaseChange = (index: number, field: keyof TestCase, value: string | boolean) => {
        const newTestCases = [...testCases];
        (newTestCases[index] as any)[field] = value;
        setTestCases(newTestCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { id: `new-${Date.now()}`, input: '', output: '', isPublic: false }]);
    };
    
    const removeTestCase = (index: number) => {
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    const handleCreate = () => {
        if (!title.trim()) {
            setError('Tiêu đề là bắt buộc.');
            return;
        }
        if (!description.trim()) {
            setError('Mô tả là bắt buộc.');
            return;
        }
        setError(null);
        
        onCreate({
            title,
            description,
            difficulty,
            testCases,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-accent flex justify-between items-center">
                    <h2 className="text-xl font-bold text-highlight">Tạo bài toán mới</h2>
                    <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-4">
                    <div>
                        <label htmlFor="problem-title" className="block text-sm font-medium text-text-secondary mb-1">Tiêu đề</label>
                        <input 
                            id="problem-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-accent text-text-primary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight"
                        />
                    </div>
                    <div>
                        <label htmlFor="problem-difficulty" className="block text-sm font-medium text-text-secondary mb-1">Độ khó</label>
                        <select
                            id="problem-difficulty"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            className="w-full bg-accent text-text-primary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight"
                        >
                            <option value="Easy">Dễ</option>
                            <option value="Medium">Trung bình</option>
                            <option value="Hard">Khó</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="problem-description" className="block text-sm font-medium text-text-secondary mb-1">Mô tả (hỗ trợ Markdown)</label>
                        <textarea 
                            id="problem-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={8}
                            className="w-full bg-accent text-text-primary p-2 rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-highlight custom-scrollbar"
                        />
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Các Test Case</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                             {testCases.map((tc, index) => (
                                <div key={index} className="bg-accent p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-text-primary">Test Case {index + 1}</h4>
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center text-sm text-text-secondary cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={!!tc.isPublic}
                                                    onChange={(e) => handleTestCaseChange(index, 'isPublic', e.target.checked)}
                                                    className="mr-2 h-4 w-4 rounded bg-primary border-gray-600 text-highlight focus:ring-highlight"
                                                />
                                                Ví dụ công khai
                                            </label>
                                            <button onClick={() => removeTestCase(index)} className="text-red-500 hover:text-red-400">&times; Xóa</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <textarea value={tc.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} placeholder="Đầu vào" rows={3} className="w-full bg-primary font-mono text-text-primary p-2 rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-highlight custom-scrollbar"/>
                                        <textarea value={tc.output} onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} placeholder="Đầu ra" rows={3} className="w-full bg-primary font-mono text-text-primary p-2 rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-highlight custom-scrollbar"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addTestCase} className="w-full bg-accent text-text-primary font-semibold py-2 rounded-md hover:bg-highlight hover:text-white transition-colors mt-3">
                            + Thêm Test Case
                        </button>
                    </div>
                </div>
                 
                <div className="p-4 border-t border-accent flex justify-end items-center">
                    {error && <p className="text-red-400 text-sm mr-4">{error}</p>}
                    <button onClick={onClose} className="mr-2 bg-accent text-text-secondary font-semibold px-4 py-2 rounded-md hover:bg-opacity-80">
                        Hủy
                    </button>
                    <button onClick={handleCreate} className="bg-highlight text-white font-semibold px-4 py-2 rounded-md hover:bg-red-500">
                        Tạo bài toán
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProblemModal;
