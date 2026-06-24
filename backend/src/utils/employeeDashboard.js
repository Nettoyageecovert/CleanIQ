function toDateKey(iso) {
  return iso.slice(0, 10);
}

function computeStreak(attempts) {
  if (!attempts.length) {
    return { streakDays: 0, daysUntilBadge: 15 };
  }

  const activeDays = new Set(attempts.map(attempt => toDateKey(attempt.completedAt)));
  let streakDays = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (activeDays.has(toDateKey(cursor.toISOString()))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const milestoneTarget = 15;
  const daysUntilBadge = streakDays >= milestoneTarget
    ? 0
    : milestoneTarget - streakDays;

  return { streakDays, daysUntilBadge };
}

function tierFromPoints(points) {
  if (points >= 10000) return 'DIAMOND';
  if (points >= 7500) return 'PLATINUM';
  return 'GOLD';
}

function buildLeaderboard(attempts, users, period, currentUserId) {
  const now = new Date();
  const cutoff = period === 'daily'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const pointsByUser = new Map();
  attempts
    .filter(attempt => new Date(attempt.completedAt) >= cutoff)
    .forEach(attempt => {
      const points = attempt.score * 10;
      pointsByUser.set(attempt.userId, (pointsByUser.get(attempt.userId) || 0) + points);
    });

  const userMap = new Map(users.map(user => [user.id, user]));

  const entries = Array.from(pointsByUser.entries())
    .map(([userId, points]) => ({
      userId,
      name: userMap.get(userId)?.fullName || 'Unknown',
      points,
      tier: tierFromPoints(points),
      isCurrentUser: userId === currentUserId,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      points: entry.points,
      tier: entry.tier,
      isCurrentUser: entry.isCurrentUser,
    }));

  if (currentUserId && !entries.some(entry => entry.isCurrentUser)) {
    const currentPoints = pointsByUser.get(currentUserId) || 0;
    const currentUser = userMap.get(currentUserId);
    if (currentUser) {
      entries.push({
        rank: entries.length + 1,
        name: currentUser.fullName,
        points: currentPoints,
        tier: tierFromPoints(currentPoints),
        isCurrentUser: true,
      });
    }
  }

  return entries;
}

function computeCourseProgress(course, quizzes, attempts) {
  const relatedQuizzes = quizzes.filter(quiz => quiz.relatedCourse === course.title);
  if (relatedQuizzes.length === 0) {
    return { progress: 0, status: 'not-started' };
  }

  const passedCount = relatedQuizzes.filter(quiz =>
    attempts.some(attempt => attempt.quizId === quiz.id && attempt.passed)
  ).length;

  const progress = Math.round((passedCount / relatedQuizzes.length) * 100);
  if (progress >= 100) {
    return { progress: 100, status: 'completed' };
  }
  if (progress > 0) {
    return { progress, status: 'in-progress' };
  }
  return { progress: 0, status: 'not-started' };
}

module.exports = {
  computeStreak,
  buildLeaderboard,
  computeCourseProgress,
};
