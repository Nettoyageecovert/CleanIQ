const express = require('express');
const router = express.Router();
const { getQuizStore, getUserStore } = require('../storage');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { buildEmployerAnalytics } = require('../utils/employerAnalytics');

const quizStore = getQuizStore();
const requireEmployer = requireRole('employer');

router.get('/', async (req, res) => {
  const quizzes = await quizStore.findAll();
  res.json({ quizzes });
});

router.get('/analytics/overview', authenticate, requireEmployer, async (req, res) => {
  try {
    const userStore = getUserStore();
    const [quizzes, attempts, employees] = await Promise.all([
      quizStore.findAll(),
      quizStore.findAllAttempts(),
      userStore.findAllEmployees(),
    ]);

    res.json({ analytics: buildEmployerAnalytics(quizzes, attempts, employees) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load analytics.' });
  }
});

router.post('/', authenticate, requireEmployer, async (req, res) => {
  const { title, category, relatedCourse, timeLimit, passingPercent, questions } = req.body;
  if (!title || !category || !relatedCourse) {
    return res.status(400).json({ message: 'Missing required quiz fields.' });
  }

  const quiz = await quizStore.createQuiz({ title, category, relatedCourse, timeLimit, passingPercent, questions });
  res.status(201).json({ quiz });
});

router.get('/attempts/detail/:attemptId', async (req, res) => {
  const attempt = await quizStore.findAttemptById(req.params.attemptId);
  if (!attempt) {
    return res.status(404).json({ message: 'Attempt not found.' });
  }
  res.json({ attempt });
});

router.get('/attempts/:userId', async (req, res) => {
  const { userId } = req.params;
  const attempts = await quizStore.findAttemptsByUser(userId);
  res.json({ attempts });
});

router.get('/:id', async (req, res) => {
  const quiz = await quizStore.findById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found.' });
  }
  res.json({ quiz });
});

router.delete('/:id', authenticate, requireEmployer, async (req, res) => {
  const deleted = await quizStore.deleteQuiz(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Quiz not found.' });
  }
  res.json({ message: 'Quiz deleted successfully.' });
});

router.put('/:id', authenticate, requireEmployer, async (req, res) => {
  const { title, category, relatedCourse, timeLimit, passingPercent, questions } = req.body;
  if (!title || !category || !relatedCourse) {
    return res.status(400).json({ message: 'Missing required quiz fields.' });
  }

  const quiz = await quizStore.updateQuiz(req.params.id, {
    title,
    category,
    relatedCourse,
    timeLimit,
    passingPercent,
    questions,
  });

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found.' });
  }

  res.json({ quiz });
});

router.post('/attempts', async (req, res) => {
  const { userId, quizId, score, passingPercent, answers, timeTakenSeconds } = req.body;
  if (!userId || !quizId || typeof score !== 'number' || typeof passingPercent !== 'number') {
    return res.status(400).json({ message: 'Missing required attempt fields.' });
  }
  const attempt = await quizStore.createAttempt({
    userId,
    quizId,
    score,
    passingPercent,
    answers,
    timeTakenSeconds,
  });
  res.status(201).json({ attempt });
});

module.exports = router;
