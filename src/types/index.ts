
export interface Problem {
  id: string;
  problemName: string;
  url: string;
  datePosted: string; // YYYY-MM-DD
  postedBy: 'user' | 'cousin';
}

export type UserRole = 'user' | 'cousin';

export type ViewOption = 'dashboard' | 'chart';
