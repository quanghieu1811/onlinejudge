import React, { useState } from 'react';
import { Submission, Problem, Verdict } from '../types';
import ResultDisplay from './ResultDisplay';

interface SubmissionsViewProps {
  submissions: Submission[];
  problems: Problem[];
}

const getVerdictClass = (verdict: Verdict) => {
  switch (verdict) {
    case Verdict.Accepted: return 'bg-green-500/20 text-green-400';
    case Verdict.WrongAnswer: return 'bg-red-500/20 text-red-400';
    case Verdict.TimeLimitExceeded: return 'bg-yellow-500/20 text-yellow-400';
    default: return 'bg-orange-500/20 text-orange-400';
  }
};

const Modal: React.FC<{ submission: Submission | null; onClose: () => void }> = ({ submission, onClose }) => {
    if (!submission) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-accent flex justify-between items-center">
                    <h2 className="text-xl font-bold text-highlight">Chi tiết bài nộp</h2>
                    <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <p><strong className="text-text-secondary">Người dùng:</strong> {submission.userId}</p>
                        <p><strong className="text-text-secondary">Ngôn ngữ:</strong> {submission.language}</p>
                        <p><strong className="text-text-secondary">Bài toán:</strong> {submission.problemTitle}</p>
                        <p><strong className="text-text-secondary">Thời gian:</strong> {new Date(submission.timestamp).toLocaleString()}</p>
                    </div>
                    <ResultDisplay result={submission.result} />
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Mã nguồn đã nộp</h3>
                        <pre className="bg-primary p-4 rounded-md text-sm font-mono text-text-primary max-h-80 overflow-y-auto custom-scrollbar">
                            <code>{submission.code}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SubmissionsView: React.FC<SubmissionsViewProps> = ({ submissions }) => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  return (
    <div className="bg-secondary p-6 rounded-lg h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold text-highlight mb-6">Lịch sử nộp bài</h2>
      
      {submissions.length === 0 ? (
        <p className="text-text-secondary">Chưa có bài nộp nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-accent">
            <thead className="bg-accent">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Học viên</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Bài toán</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Kết quả</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Thời gian</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Chi tiết</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-secondary divide-y divide-accent">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{sub.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{sub.problemTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerdictClass(sub.result.verdict)}`}>
                        {sub.result.verdict}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(sub.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setSelectedSubmission(sub)} className="text-highlight hover:underline">Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
    </div>
  );
};

export default SubmissionsView;
