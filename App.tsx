import React, { useState, useEffect, useCallback } from 'react';
import { Problem, SubmissionResult, Verdict, User } from './types';
import { generateProblem, judgeCode } from './services/geminiService';
import { ProblemView } from './components/ProblemView';
import CodeEditor from './components/CodeEditor';
import ResultDisplay from './components/ResultDisplay';
import { SUPPORTED_LANGUAGES, DEFAULT_CODE } from './constants';
import Auth from './components/Auth';
import ProblemList from './components/ProblemList';

// --- Mock User Service ---
// In a real app, this would be an API call to a backend.
const mockAuth = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem('users') || '[]'),
  saveUsers: (users: User[]) => localStorage.setItem('users', JSON.stringify(users)),
  getCurrentUser: (): User | null => JSON.parse(localStorage.getItem('currentUser') || 'null'),
  setCurrentUser: (user: User | null) => localStorage.setItem('currentUser', JSON.stringify(user)),
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>(DEFAULT_CODE[SUPPORTED_LANGUAGES[0]]);
  const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0]);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  const [isGeneratingProblem, setIsGeneratingProblem] = useState<boolean>(false);
  const [isJudging, setIsJudging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize app state from localStorage
  useEffect(() => {
    const user = mockAuth.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    let storedProblems = JSON.parse(localStorage.getItem('problems') || '[]');
    if (storedProblems.length === 0) {
      // Seed with an initial problem if none exist
        const seedProblem: Problem = {
            id: 'problem_seed',
            title: 'Bài toán khởi đầu: Tổng hai số',
            description: 'Viết chương trình đọc hai số nguyên A và B, sau đó in ra tổng của chúng.',
            inputFormat: 'Một dòng duy nhất chứa hai số nguyên A và B (0 <= A, B <= 1,000,000) cách nhau bởi một khoảng trắng.',
            outputFormat: 'In ra một số nguyên duy nhất là tổng của A và B.',
            constraints: ['A và B là các số nguyên không âm.'],
            samples: [{
                input: '5 8',
                output: '13',
                explanation: '5 + 8 = 13'
            }]
        };
        storedProblems = [seedProblem];
        localStorage.setItem('problems', JSON.stringify(storedProblems));
    }
    setProblems(storedProblems);

    let users = mockAuth.getUsers();
    if (users.length === 0) {
      // Seed with an admin account if no users exist
      const admin: User = { id: 'user_admin', username: 'admin', password: 'admin', role: 'admin' };
      mockAuth.saveUsers([admin]);
    }
  }, []);

  const handleLogin = (user: User) => {
    mockAuth.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    mockAuth.setCurrentUser(null);
    setCurrentUser(null);
    setSelectedProblem(null);
    setSubmissionResult(null);
  };

  const handleSelectProblem = (problemId: string) => {
    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      setSelectedProblem(problem);
      setSubmissionResult(null); // Clear previous result
    }
  };
  
  const handleCreateProblem = useCallback(async () => {
    if (currentUser?.role !== 'admin') return;
    setIsGeneratingProblem(true);
    setError(null);
    try {
      const newProblem = await generateProblem();
      const updatedProblems = [...problems, newProblem];
      setProblems(updatedProblems);
      localStorage.setItem('problems', JSON.stringify(updatedProblems));
      setSelectedProblem(newProblem); // Automatically select the new problem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingProblem(false);
    }
  }, [currentUser, problems]);

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setIsJudging(true);
    setSubmissionResult({
        verdict: Verdict.Judging,
        explanation: "Bài nộp của bạn đang được chấm...",
        details: null
    });
    setError(null);
    try {
      const result = await judgeCode(selectedProblem, code, language);
      setSubmissionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during judging.');
      setSubmissionResult(null);
    } finally {
      setIsJudging(false);
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} authService={mockAuth} />;
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col p-2 sm:p-4">
      <header className="flex items-center justify-between p-4 mb-4 bg-secondary rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-highlight" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Gemini Informatics Judge</h1>
        </div>
        <div className="flex items-center gap-4">
          {currentUser.role === 'admin' && (
            <button
              onClick={handleCreateProblem}
              disabled={isGeneratingProblem}
              className="bg-accent text-text-primary font-semibold px-4 py-2 rounded-md hover:bg-highlight hover:text-white transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isGeneratingProblem ? 'Đang tạo...' : 'Tạo bài mới'}
            </button>
          )}
          <span className="text-text-secondary">Chào, {currentUser.username}</span>
          <button onClick={handleLogout} className="text-highlight hover:underline">Đăng xuất</button>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-100px)]">
        <div className="lg:col-span-3 h-full">
            <ProblemList 
                problems={problems}
                selectedProblemId={selectedProblem?.id || null}
                onSelectProblem={handleSelectProblem}
            />
        </div>
        <div className="lg:col-span-4 h-full">
            <ProblemView problem={selectedProblem} isLoading={false} />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4 h-full">
            <div className="flex-grow min-h-0">
                <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                onSubmit={handleSubmitCode}
                isJudging={isJudging}
                canSubmit={!!selectedProblem}
                />
            </div>
            <div className="flex-shrink-0">
                {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-4">{error}</div>}
                <ResultDisplay result={submissionResult} />
            </div>
        </div>
      </main>

      {/* FIX: Removed non-standard `jsx` and `global` props from the style tag. This syntax is specific to libraries like styled-jsx and is not supported in a standard React setup, causing the TypeScript error. */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #16213e; /* secondary */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #0f3460; /* accent */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #e94560; /* highlight */
        }
        .prose-invert {
          --tw-prose-body: #a0a0a0;
          --tw-prose-headings: #dcdcdc;
        }
      `}</style>
    </div>
  );
};

export default App;
