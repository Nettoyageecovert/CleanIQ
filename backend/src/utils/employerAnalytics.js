function buildEmployerAnalytics(quizzes, attempts, employees) {
  const totalQuizzes = quizzes.length;
  const totalEmployees = employees.length;
  const totalAttempts = attempts.length;
  const passedCount = attempts.filter(attempt => attempt.passed).length;
  const overallPassRate = totalAttempts
    ? Math.round((passedCount / totalAttempts) * 100)
    : 0;
  const avgScore = totalAttempts
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts)
    : 0;
  const employeesWithAttempts = new Set(attempts.map(attempt => attempt.userId)).size;
  const employeeParticipationRate = totalEmployees
    ? Math.round((employeesWithAttempts / totalEmployees) * 100)
    : 0;

  const quizMap = new Map(quizzes.map(quiz => [quiz.id, quiz]));
  const employeeMap = new Map(employees.map(employee => [employee.id, employee]));

  const quizStats = quizzes
    .map(quiz => {
      const quizAttempts = attempts.filter(attempt => attempt.quizId === quiz.id);
      const attemptCount = quizAttempts.length;
      const passCount = quizAttempts.filter(attempt => attempt.passed).length;

      return {
        quizId: quiz.id,
        title: quiz.title,
        category: quiz.category,
        relatedCourse: quiz.relatedCourse,
        attemptCount,
        passCount,
        avgScore: attemptCount
          ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / attemptCount)
          : 0,
        completionRate: totalEmployees
          ? Math.round((attemptCount / totalEmployees) * 100)
          : 0,
      };
    })
    .sort((a, b) => b.attemptCount - a.attemptCount);

  const employeeCompletion = employees
    .map(employee => {
      const employeeAttempts = attempts.filter(attempt => attempt.userId === employee.id);
      const completedCount = employeeAttempts.length;
      const passedAttempts = employeeAttempts.filter(attempt => attempt.passed).length;
      const latestAttempt = employeeAttempts
        .slice()
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

      return {
        userId: employee.id,
        fullName: employee.fullName,
        email: employee.email,
        completedCount,
        totalQuizzes,
        pendingCount: Math.max(totalQuizzes - completedCount, 0),
        passRate: completedCount
          ? Math.round((passedAttempts / completedCount) * 100)
          : 0,
        avgScore: completedCount
          ? Math.round(employeeAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / completedCount)
          : 0,
        lastCompletedAt: latestAttempt?.completedAt ?? null,
      };
    })
    .sort((a, b) => b.completedCount - a.completedCount);

  const recentActivity = attempts
    .slice(0, 12)
    .map(attempt => ({
      attemptId: attempt.id,
      userId: attempt.userId,
      userName: employeeMap.get(attempt.userId)?.fullName ?? 'Unknown employee',
      quizId: attempt.quizId,
      quizTitle: quizMap.get(attempt.quizId)?.title ?? 'Deleted quiz',
      score: attempt.score,
      passed: attempt.passed,
      completedAt: attempt.completedAt,
    }));

  return {
    summary: {
      totalQuizzes,
      totalEmployees,
      totalAttempts,
      overallPassRate,
      avgScore,
      employeeParticipationRate,
    },
    quizStats,
    employeeCompletion,
    recentActivity,
  };
}

module.exports = { buildEmployerAnalytics };
