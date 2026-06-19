import api from './auth';

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
