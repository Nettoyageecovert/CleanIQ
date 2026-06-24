export interface DashboardTrainingRecord {
  id: string;
  quizName: string;
  date: string;
  category: string;
  score: number;
  passed: boolean;
}

export interface DashboardLeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  tier: string;
  isCurrentUser?: boolean;
}

export interface EmployeeDashboardData {
  streakDays: number;
  daysUntilBadge: number;
  trainingHistory: DashboardTrainingRecord[];
  leaderboard: DashboardLeaderboardEntry[];
}
