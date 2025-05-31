export interface Problem {
  id: string;
  problemName: string;
  url: string;
  datePosted: string; // YYYY-MM-DD
  postedBy: 'Koala' | 'Alpaca';
}

export type UserRole = 'Koala' | 'Alpaca';

export type ViewOption = 'dashboard' | 'chart';
