import React from 'react';
import { SubmissionResult, Verdict } from '../types';

interface ResultDisplayProps {
  result: SubmissionResult | null;
}

const getVerdictClass = (verdict: Verdict) => {
  switch (verdict) {
    case Verdict.Accepted:
      return 'text-green-400';
    case Verdict.WrongAnswer:
      return 'text-red-400';
    case Verdict.TimeLimitExceeded:
      return 'text-yellow-400';
    case Verdict.CompilationError:
    case Verdict.RuntimeError:
      return 'text-orange-400';
    default:
      return 'text-text-secondary';
  }
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (!result) {
    return (
        <div className="bg-secondary p-4 rounded-lg mt-4 text-center">
            <p className="text-text-secondary">Nộp bài của bạn để xem kết quả.</p>
        </div>
    );
  }

  return (
    <div className="bg-secondary p-4 md:p-6 rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Kết quả nộp bài</h2>
      <div className="bg-accent p-4 rounded-lg">
        <div className="flex items-center mb-3">
          <span className={`text-lg font-bold mr-3 ${getVerdictClass(result.verdict)}`}>
            {result.verdict}
          </span>
          <span className="text-text-secondary italic">{result.explanation}</span>
        </div>
        {result.details && (
          <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed custom-scrollbar overflow-y-auto max-h-48">
            <h3 className="text-text-primary !mb-2">Chi tiết:</h3>
            <pre className="bg-primary p-3 rounded-md whitespace-pre-wrap font-mono">{result.details}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
