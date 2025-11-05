import React, { useState, useEffect } from 'react';
import { Problem, TestCase } from '../types';

interface TestCaseManagerProps {
    problem: Problem | null;
    onClose: () => void;
    onSave: (problemId: string, testCases: TestCase[]) => void;
}

const TestCaseManager: React.FC<TestCaseManagerProps> = ({ problem, onClose, onSave }) => {
    const [testCases, setTestCases] = useState<TestCase[]>([]);

    useEffect(() => {
        if (problem) {
            // Deep copy to avoid mutating original state
            setTestCases(JSON.parse(JSON.stringify(problem.testCases)));
        }
    }, [problem]);

    if (!problem) return null;

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

    const handleSave = () => {
        onSave(problem.id, testCases);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-accent flex justify-between items-center">
                    <h2 className="text-xl font-bold text-highlight">Quản lý Test Case cho "{problem.title}"</h2>
                    <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                    {testCases.map((tc, index) => (
                        <div key={tc.id} className="bg-accent p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-text-primary">Test Case {index + 1}</h3>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor={`input-${index}`} className="block text-sm font-medium text-text-secondary mb-1">Đầu vào</label>
                                    <textarea 
                                        id={`input-${index}`}
                                        value={tc.input}
                                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                        rows={4}
                                        className="w-full bg-primary font-mono text-text-primary p-2 rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-highlight custom-scrollbar"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`output-${index}`} className="block text-sm font-medium text-text-secondary mb-1">Đầu ra</label>
                                    <textarea
                                        id={`output-${index}`}
                                        value={tc.output}
                                        onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                        rows={4}
                                        className="w-full bg-primary font-mono text-text-primary p-2 rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-highlight custom-scrollbar"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={addTestCase} className="w-full bg-accent text-text-primary font-semibold py-2 rounded-md hover:bg-highlight hover:text-white transition-colors mt-2">
                        + Thêm Test Case
                    </button>
                </div>
                 <div className="p-4 border-t border-accent flex justify-end">
                    <button onClick={onClose} className="mr-2 bg-accent text-text-secondary font-semibold px-4 py-2 rounded-md hover:bg-opacity-80">
                        Hủy
                    </button>
                    <button onClick={handleSave} className="bg-highlight text-white font-semibold px-4 py-2 rounded-md hover:bg-red-500">
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestCaseManager;
