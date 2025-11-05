import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Problem, User, Difficulty } from '../types';

interface ProblemViewProps {
  problem: Problem | null;
  currentUser: User | null;
  onManageTestCases: (problem: Problem) => void;
}

const ProblemView: React.FC<ProblemViewProps> = ({ problem, currentUser, onManageTestCases }) => {
  if (!problem) {
    return (
      <div className="bg-secondary rounded-lg h-full flex items-center justify-center">
        <p className="text-text-secondary">Chọn một bài toán để xem chi tiết.</p>
      </div>
    );
  }

  const difficultyNames: { [key in Difficulty]: string } = {
      Easy: "Dễ",
      Medium: "Trung bình",
      Hard: "Khó"
  }

  const publicTestCases = problem.testCases.filter(tc => tc.isPublic);

  return (
    <div className="bg-secondary rounded-lg h-full flex flex-col">
      <div className="p-4 md:p-6 border-b border-accent flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-highlight">{problem.title}</h1>
            <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
            }`}>
                {difficultyNames[problem.difficulty]}
            </span>
        </div>
        {currentUser?.role === 'admin' && (
            <button
                onClick={() => onManageTestCases(problem)}
                className="bg-accent text-text-primary font-semibold px-4 py-2 rounded-md hover:bg-highlight hover:text-white transition-colors text-sm"
            >
                Quản lý Test Case
            </button>
        )}
      </div>
      <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-grow">
        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed">
            <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>
        {publicTestCases.length > 0 && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3">Ví dụ mẫu</h3>
                {publicTestCases.map((tc, index) => (
                    <div key={tc.id} className="mb-4 bg-accent p-4 rounded-lg">
                        <p className="font-semibold text-text-secondary mb-1">Ví dụ {index + 1}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-mono text-sm text-text-secondary mb-1">Đầu vào:</h4>
                                <pre className="bg-primary p-3 rounded-md text-sm font-mono text-text-primary whitespace-pre-wrap">{tc.input}</pre>
                            </div>
                            <div>
                                <h4 className="font-mono text-sm text-text-secondary mb-1">Đầu ra:</h4>
                                <pre className="bg-primary p-3 rounded-md text-sm font-mono text-text-primary whitespace-pre-wrap">{tc.output}</pre>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default ProblemView;