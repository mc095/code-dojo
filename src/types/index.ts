export type UserRole = 'admin' | 'participant';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  joinedAt: string;
  settings: {
    theme: string;
    notifications: boolean;
  }
}

export interface Problem {
  id: string;
  problemName: string;
  url: string;
  datePosted: string; // YYYY-MM-DD
  postedBy: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface ProblemStats {
  date: string;
  problemsPosted: number;
  solvedBy: {
    [userId: string]: number;
  }
}

export interface SolvedProblem {
  problemId: string;
  problemName: string;
  solved: boolean;
  date: string;
  userId: string;
}

export type ViewOption = 'dashboard' | 'chart';
