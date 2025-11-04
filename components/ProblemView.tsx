
import React from 'react';
import { Problem } from '../types';

interface ProblemViewProps {
  problem: Problem | null;
  isLoading: boolean;
}

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-accent rounded-md w-3/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-accent rounded-md w-full"></div>
      <div className="h-4 bg-accent rounded-md w-full"></div>
      <div className="h-4 bg-accent rounded-md w-5/6"></div>
    </div>
    <div className="h-6 bg-accent rounded-md w-1/4"></div>
    <div className="h-4 bg-accent rounded-md w-1/2"></div>
    <div className="h-6 bg-accent rounded-md w-1/4"></div>
    <div className="h-4 bg-accent rounded-md w-1/2"></div>
    <div className="h-6 bg-accent rounded-md w-1/4"></div>
    <div className="bg-accent p-4 rounded-lg space-y-2">
       <div className="h-4 bg-secondary rounded-md w-1/3"></div>
       <div className="h-4 bg-secondary rounded-md w-1/2"></div>
    </div>
  </div>
);

export const ProblemView: React.FC<ProblemViewProps> = ({ problem, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-8 bg-secondary rounded-lg h-full overflow-y-auto">
        <SkeletonLoader />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="p-8 bg-secondary rounded-lg h-full flex items-center justify-center">
        <p className="text-text-secondary">Generate a problem to begin.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-secondary rounded-lg h-full overflow-y-auto custom-scrollbar">
      <h1 className="text-2xl md:text-3xl font-bold text-highlight mb-6 pb-4 border-b border-accent">{problem.title}</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Description</h2>
          <p className="text-text-secondary leading-relaxed">{problem.description}</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Input Format</h2>
          <p className="text-text-secondary leading-relaxed">{problem.inputFormat}</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Output Format</h2>
          <p className="text-text-secondary leading-relaxed">{problem.outputFormat}</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Constraints</h2>
          <ul className="list-disc list-inside text-text-secondary space-y-1">
            {problem.constraints.map((constraint, index) => (
              <li key={index}>{constraint}</li>
            ))}
          </ul>
        </div>

        <div>
           <h2 className="text-xl font-semibold text-text-primary mb-3">Sample Cases</h2>
           {problem.samples.map((sample, index) => (
             <div key={index} className="mb-4 last:mb-0">
               <h3 className="font-semibold text-text-primary mb-2">Sample {index + 1}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-accent p-4 rounded-lg">
                   <h4 className="font-mono text-sm text-text-secondary mb-2">Input:</h4>
                   <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap">{sample.input}</pre>
                 </div>
                 <div className="bg-accent p-4 rounded-lg">
                   <h4 className="font-mono text-sm text-text-secondary mb-2">Output:</h4>
                   <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap">{sample.output}</pre>
                 </div>
               </div>
               {sample.explanation && <p className="text-sm text-text-secondary mt-3 italic">{sample.explanation}</p>}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
