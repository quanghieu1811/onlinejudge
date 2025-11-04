import React from 'react';
import { Problem } from '../types';

interface ProblemListProps {
  problems: Problem[];
  selectedProblemId: string | null;
  onSelectProblem: (problemId: string) => void;
}

const ProblemList: React.FC<ProblemListProps> = ({ problems, selectedProblemId, onSelectProblem }) => {
  return (
    <div className="bg-secondary rounded-lg h-full flex flex-col">
      <h2 className="text-xl font-bold text-text-primary p-4 border-b border-accent">
        Danh sách bài
      </h2>
      <div className="overflow-y-auto custom-scrollbar flex-grow">
        {problems.length > 0 ? (
          <ul>
            {problems.map((problem) => (
              <li key={problem.id}>
                <button
                  onClick={() => onSelectProblem(problem.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    selectedProblemId === problem.id
                      ? 'bg-highlight text-white'
                      : 'text-text-secondary hover:bg-accent hover:text-text-primary'
                  }`}
                >
                  {problem.title}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-text-secondary">Chưa có bài toán nào.</p>
        )}
      </div>
    </div>
  );
};

export default ProblemList;
