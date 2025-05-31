
export interface Problem {
  id: string;
  problemName: string;
  url: string;
  datePosted: string; // YYYY-MM-DD
  postedBy: 'Ganesh' | 'Vaishnavi';
}

export type UserRole = 'Ganesh' | 'Vaishnavi';

export type ViewOption = 'dashboard' | 'chart';
