class QuizStore {
  constructor() {
    this.quizzes = [
      {
        id: 'quiz_1',
        title: 'Chemical Storage Best Practices',
        category: 'Safety Module',
        relatedCourse: 'Chemical Safety 101',
        timeLimit: 20,
        passingPercent: 80,
        questions: [],
        createdAt: new Date('2024-11-01T08:00:00Z').toISOString(),
      },
      {
        id: 'quiz_2',
        title: 'Floor Care & Surface Protection',
        category: 'Technical Skillset',
        relatedCourse: 'Floor Care & Surface Protection',
        timeLimit: 30,
        passingPercent: 70,
        questions: [],
        createdAt: new Date('2024-11-05T08:00:00Z').toISOString(),
      },
    ];
    this.attempts = [
      {
        id: 'attempt_1',
        quizId: 'quiz_1',
        userId: 'user_1',
        score: 92,
        passed: true,
        passingPercent: 80,
        answers: [],
        timeTakenSeconds: 0,
        completedAt: new Date('2024-11-10T10:00:00Z').toISOString(),
      },
    ];
  }

  async findAll() {
    return this.quizzes.slice();
  }

  async findById(id) {
    return this.quizzes.find(quiz => quiz.id === id) || null;
  }

  async createQuiz(data) {
    const quiz = {
      id: `quiz_${Date.now()}`,
      title: data.title,
      category: data.category,
      relatedCourse: data.relatedCourse,
      timeLimit: data.timeLimit,
      passingPercent: data.passingPercent,
      questions: data.questions || [],
      createdAt: new Date().toISOString(),
    };
    this.quizzes.push(quiz);
    return quiz;
  }

  async updateQuiz(id, data) {
    const index = this.quizzes.findIndex(quiz => quiz.id === id);
    if (index === -1) {
      return null;
    }

    const existing = this.quizzes[index];
    const quiz = {
      ...existing,
      title: data.title,
      category: data.category,
      relatedCourse: data.relatedCourse,
      timeLimit: data.timeLimit,
      passingPercent: data.passingPercent,
      questions: data.questions || [],
      updatedAt: new Date().toISOString(),
    };
    this.quizzes[index] = quiz;
    return quiz;
  }

  async deleteQuiz(id) {
    const index = this.quizzes.findIndex(quiz => quiz.id === id);
    if (index === -1) {
      return false;
    }

    this.quizzes.splice(index, 1);
    this.attempts = this.attempts.filter(attempt => attempt.quizId !== id);
    return true;
  }

  async findAllAttempts() {
    return this.attempts
      .slice()
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  async findAttemptById(id) {
    return this.attempts.find(attempt => attempt.id === id) || null;
  }

  async findAttemptsByUser(userId) {
    return this.attempts
      .filter(attempt => attempt.userId === userId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  async createAttempt(data) {
    this.attempts = this.attempts.filter(
      attempt => !(attempt.userId === data.userId && attempt.quizId === data.quizId)
    );

    const attempt = {
      id: `attempt_${Date.now()}`,
      quizId: data.quizId,
      userId: data.userId,
      score: data.score,
      passed: data.score >= data.passingPercent,
      passingPercent: data.passingPercent,
      answers: data.answers || [],
      timeTakenSeconds: data.timeTakenSeconds ?? 0,
      completedAt: new Date().toISOString(),
    };
    this.attempts.push(attempt);
    return attempt;
  }
}

module.exports = QuizStore;
