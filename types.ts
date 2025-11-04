
export interface Problem {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  samples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
}

export enum Verdict {
  Accepted = "Accepted",
  WrongAnswer = "Wrong Answer",
  TimeLimitExceeded = "Time Limit Exceeded",
  CompilationError = "Compilation Error",
  RuntimeError = "Runtime Error",
  Pending = "Pending",
  Judging = "Judging",
}

export interface SubmissionResult {
  verdict: Verdict;
  explanation: string;
  details: string | null;
}
