
import React, { useState, useEffect, useCallback } from 'react';
import { Problem, SubmissionResult, Verdict } from './types';
import { generateProblem, judgeCode } from './services/geminiService';
import { ProblemView } from './components/ProblemView';
import CodeEditor from './components/CodeEditor';
import ResultDisplay from './components/ResultDisplay';
import { SUPPORTED_LANGUAGES, DEFAULT_CODE } from './constants';

const App: React.FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>(DEFAULT_CODE[SUPPORTED_LANGUAGES[0]]);
  const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0]);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  
  const [isGeneratingProblem, setIsGeneratingProblem] = useState<boolean>(true);
  const [isJudging, setIsJudging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateProblem = useCallback(async () => {
    setIsGeneratingProblem(true);
    setError(null);
    setProblem(null);
    setSubmissionResult(null);
    try {
      const newProblem = await generateProblem();
      setProblem(newProblem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingProblem(false);
    }
  }, []);

  useEffect(() => {
    handleGenerateProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitCode = async () => {
    if (!problem) return;
    setIsJudging(true);
    setSubmissionResult({
        verdict: Verdict.Judging,
        explanation: "Your submission is being evaluated...",
        details: null
    });
    setError(null);
    try {
      const result = await judgeCode(problem, code, language);
      setSubmissionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during judging.');
      setSubmissionResult(null);
    } finally {
      setIsJudging(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-primary flex flex-col p-2 sm:p-4">
      <header className="flex items-center justify-between p-4 mb-4 bg-secondary rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-highlight" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Gemini Informatics Judge</h1>
        </div>
        <button
          onClick={handleGenerateProblem}
          disabled={isGeneratingProblem}
          className="bg-accent text-text-primary font-semibold px-4 py-2 rounded-md hover:bg-highlight hover:text-white transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isGeneratingProblem ? 'Generating...' : 'New Problem'}
        </button>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-100px)]">
        <div className="h-full">
            <ProblemView problem={problem} isLoading={isGeneratingProblem} />
        </div>
        <div className="flex flex-col gap-4 h-full">
            <div className="flex-grow h-3/5">
                <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                onSubmit={handleSubmitCode}
                isJudging={isJudging}
                canSubmit={!!problem}
                />
            </div>
            <div className="flex-shrink-0 h-2/5">
                {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-4">{error}</div>}
                <ResultDisplay result={submissionResult} />
            </div>
        </div>
      </main>

      <style jsx global>{`
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
      `}</style>
    </div>
  );
};

export default App;
