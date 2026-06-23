const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.get('/stats', async (req, res) => {
  try {
    const [
      { count: totalCourses },
      { count: publishedCourses },
      { count: totalQuizzes },
      { count: publishedQuizzes },
      { count: totalEnrolled },
      { data: attempts },
    ] = await Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('quizzes').select('*', { count: 'exact', head: true }),
      supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase.from('quiz_attempts').select('score'),
    ]);

    const avgScore = attempts && attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0;

    res.json({
      totalCourses: totalCourses ?? 0,
      publishedCourses: publishedCourses ?? 0,
      totalQuizzes: totalQuizzes ?? 0,
      publishedQuizzes: publishedQuizzes ?? 0,
      totalEnrolled: totalEnrolled ?? 0,
      avgScore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`id, title, category, difficulty, published, certifiable, created_at, enrollments(count)`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const courses = data.map(c => ({
      ...c,
      enrolledCount: c.enrollments?.[0]?.count ?? 0,
    }));

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.get('/quizzes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`id, title, published, time_limit, passing_percent, created_at, questions(count), quiz_attempts(score)`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const quizzes = data.map(q => {
      const attempts = q.quiz_attempts ?? [];
      const avgScore = attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
        : 0;
      return {
        id: q.id,
        title: q.title,
        published: q.published,
        questionCount: q.questions?.[0]?.count ?? 0,
        completedCount: attempts.length,
        avgScore,
        createdAt: q.created_at,
      };
    });

    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const { title, description, category, difficulty, published, certifiable, created_by } = req.body;
    const { data, error } = await supabase
      .from('courses')
      .insert([{ title, description, category, difficulty, published, certifiable, created_by }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.post('/quizzes', async (req, res) => {
  try {
    const { title, courseId, timeLimit, passingPercent, published, createdBy, questions } = req.body;

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{ title, course_id: courseId, time_limit: timeLimit, passing_percent: passingPercent, published, created_by: createdBy }])
      .select()
      .single();

    if (quizError) throw quizError;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const { data: question, error: qError } = await supabase
        .from('questions')
        .insert([{ quiz_id: quiz.id, text: q.text, image_url: q.imageUrl ?? null, order_index: i }])
        .select()
        .single();

      if (qError) throw qError;

      const { error: optError } = await supabase.from('options').insert(
        q.options.map((opt, j) => ({
          question_id: question.id,
          text: opt.text,
          is_correct: opt.isCorrect,
          order_index: j,
        }))
      );
      if (optError) throw optError;
    }

    res.status(201).json({ success: true, quizId: quiz.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

module.exports = router;