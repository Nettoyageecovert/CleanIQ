import api from './auth';
import type { EmployeeDashboardData } from './dashboard';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  image: string | null;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  relatedCourse: string;
  timeLimit: number;
  passingPercent: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface AttemptAnswer {
  questionId: string;
  selectedIndex: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  passed: boolean;
  passingPercent: number;
  answers: AttemptAnswer[];
  timeTakenSeconds: number;
  completedAt: string;
}

export const fetchQuizzes = async (): Promise<Quiz[]> => {
  const response = await api.get<{ quizzes: Quiz[] }>('/quizzes');
  return response.data.quizzes;
};

export const fetchQuizById = async (id: string): Promise<Quiz> => {
  const response = await api.get<{ quiz: Quiz }>(`/quizzes/${id}`);
  return response.data.quiz;
};

export const createQuiz = async (data: {
  title: string;
  category: string;
  relatedCourse: string;
  timeLimit: number;
  passingPercent: number;
  questions: QuizQuestion[];
}): Promise<Quiz> => {
  const response = await api.post<{ quiz: Quiz }>('/quizzes', data);
  return response.data.quiz;
};

export const updateQuiz = async (
  quizId: string,
  data: {
    title: string;
    category: string;
    relatedCourse: string;
    timeLimit: number;
    passingPercent: number;
    questions: QuizQuestion[];
  },
): Promise<Quiz> => {
  const response = await api.put<{ quiz: Quiz }>(`/quizzes/${quizId}`, data);
  return response.data.quiz;
};

export const fetchAttemptById = async (attemptId: string): Promise<QuizAttempt> => {
  const response = await api.get<{ attempt: QuizAttempt }>(`/quizzes/attempts/detail/${attemptId}`);
  return response.data.attempt;
};

export const fetchAttemptsByUser = async (userId: string): Promise<QuizAttempt[]> => {
  const response = await api.get<{ attempts: QuizAttempt[] }>(`/quizzes/attempts/${userId}`);
  return response.data.attempts;
};

export const submitQuizAttempt = async (data: {
  userId: string;
  quizId: string;
  score: number;
  passingPercent: number;
  answers: AttemptAnswer[];
  timeTakenSeconds: number;
}): Promise<QuizAttempt> => {
  const response = await api.post<{ attempt: QuizAttempt }>('/quizzes/attempts', data);
  return response.data.attempt;
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
  await api.delete(`/quizzes/${quizId}`);
};

export interface EmployerAnalyticsSummary {
  totalQuizzes: number;
  totalEmployees: number;
  totalAttempts: number;
  overallPassRate: number;
  avgScore: number;
  employeeParticipationRate: number;
}

export interface QuizStat {
  quizId: string;
  title: string;
  category: string;
  relatedCourse: string;
  attemptCount: number;
  passCount: number;
  avgScore: number;
  completionRate: number;
}

export interface EmployeeCompletion {
  userId: string;
  fullName: string;
  email: string;
  completedCount: number;
  totalQuizzes: number;
  pendingCount: number;
  passRate: number;
  avgScore: number;
  lastCompletedAt: string | null;
}

export interface RecentActivity {
  attemptId: string;
  userId: string;
  userName: string;
  quizId: string;
  quizTitle: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface EmployerAnalytics {
  summary: EmployerAnalyticsSummary;
  quizStats: QuizStat[];
  employeeCompletion: EmployeeCompletion[];
  recentActivity: RecentActivity[];
}

export const fetchEmployerAnalytics = async (): Promise<EmployerAnalytics> => {
  const response = await api.get<{ analytics: EmployerAnalytics }>('/quizzes/analytics/overview');
  return response.data.analytics;
};

export const fetchEmployeeDashboard = async (
  userId: string,
  period: 'daily' | 'weekly' = 'weekly',
): Promise<EmployeeDashboardData> => {
  const response = await api.get<{ dashboard: EmployeeDashboardData }>(
    `/quizzes/employee-dashboard/${userId}`,
    { params: { period } },
  );
  return response.data.dashboard;
};
