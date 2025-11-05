import React from 'react';
import { Problem, User, Difficulty } from '../types';

interface ProblemListProps {
  problems: Problem[];
  selectedProblemId: string | null;
  onSelectProblem: (problemId: string) => void;
  onDeleteProblem: (problemId:string) => void;
  currentUser: User;
  activeFilter: Difficulty | 'All';
  onFilterChange: (filter: Difficulty | 'All') => void;
  isLoading: boolean;
}

const getDifficultyClass = (difficulty: Difficulty, selected: boolean) => {
  if (selected) return '';
  switch (difficulty) {
    case 'Easy': return 'border-l-4 border-green-500';
    case 'Medium': return 'border-l-4 border-yellow-500';
    case 'Hard': return 'border-l-4 border-red-500';
    default: return 'border-l-4 border-transparent';
  }
};

const ProblemList: React.FC<ProblemListProps> = ({ problems, selectedProblemId, onSelectProblem, onDeleteProblem, currentUser, activeFilter, onFilterChange, isLoading }) => {
  const filters: (Difficulty | 'All')[] = ['All', 'Easy', 'Medium', 'Hard'];
  const filterNames: { [key: string]: string } = {
      All: "Tất cả",
      Easy: "Dễ",
      Medium: "Trung bình",
      Hard: "Khó"
  }

  const SkeletonLoader = () => (
    <div className="p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-accent h-10 rounded-md"></div>
        ))}
    </div>
  );
  
  return (
    <div className="bg-secondary rounded-lg h-full flex flex-col">
      <div className="p-4 border-b border-accent">
        <h2 className="text-xl font-bold text-text-primary mb-3">
          Danh sách bài
        </h2>
        <div className="flex space-x-2">
            {filters.map(filter => (
                <button 
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition ${activeFilter === filter ? 'bg-highlight text-white' : 'bg-accent text-text-secondary hover:bg-opacity-80'}`}
                >
                    {filterNames[filter]}
                </button>
            ))}
        </div>
      </div>
      <div className="overflow-y-auto custom-scrollbar flex-grow">
        {isLoading ? (
            <SkeletonLoader />
        ) : problems.length > 0 ? (
          <ul>
            {problems.map((problem) => (
              <li key={problem.id} className={`flex items-center justify-between group transition-all duration-200 ease-in-out ${getDifficultyClass(problem.difficulty, selectedProblemId === problem.id)} ${selectedProblemId === problem.id ? 'bg-highlight' : 'hover:bg-accent hover:translate-x-1'}`}>
                <button
                  onClick={() => onSelectProblem(problem.id)}
                  className={`flex-grow text-left p-4 ${selectedProblemId === problem.id ? 'text-white' : 'text-text-secondary group-hover:text-text-primary'}`}
                >
                  {problem.title}
                </button>
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProblem(problem.id);
                    }}
                    className="p-2 mr-2 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                    title="Xóa bài toán"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-text-secondary">Không có bài toán nào khớp với bộ lọc.</p>
        )}
      </div>
    </div>
  );
};

export default ProblemList;