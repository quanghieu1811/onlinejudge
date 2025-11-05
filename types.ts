
export enum Verdict {
  Accepted = "Accepted",
  WrongAnswer = "Wrong Answer",
  TimeLimitExceeded = "Time Limit Exceeded",
  CompilationError = "Compilation Error",
  RuntimeError = "Runtime Error",
  Pending = "Pending",
}

export type Difficulty = "Easy" | "Medium" | "Hard";
export type UserRole = "student" | "teacher" | "admin";

export interface User {
  username: string;
  password?: string; // Password might not always be present on client
  role: UserRole;
}

export interface TestCase {
  id: string;
  input: string;
  output: string;
  isPublic?: boolean; // Optional: for displaying sample test cases
}

export interface Problem {
  id: string;
  title: string;
  description: string; // Markdown format
  difficulty: Difficulty;
  testCases: TestCase[];
}

export interface SubmissionResult {
  verdict: Verdict;
  explanation: string;
  details?: string; // For compiler errors, runtime errors, or failed test case info
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  problemTitle: string;
  code: string;
  language: string;
  timestamp: number;
  result: SubmissionResult;
}
