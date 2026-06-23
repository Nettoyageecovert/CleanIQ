const { createClient } = require('@supabase/supabase-js');

function mapQuizFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    relatedCourse: row.related_course,
    timeLimit: row.time_limit,
    passingPercent: row.passing_percent,
    questions: row.questions || [],
    createdAt: row.created_at,
    ...(row.updated_at ? { updatedAt: row.updated_at } : {}),
  };
}

function mapAttemptFromRow(row) {
  return {
    id: row.id,
    quizId: row.quiz_id,
    userId: row.user_id,
    score: row.score,
    passed: row.passed,
    passingPercent: row.passing_percent,
    answers: row.answers || [],
    timeTakenSeconds: row.time_taken_seconds,
    completedAt: row.completed_at,
  };
}

class SupabaseQuizStore {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for Supabase quiz storage.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapQuizFromRow);
  }

  async findById(id) {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data ? mapQuizFromRow(data) : null;
  }

  async createQuiz(data) {
    const now = new Date().toISOString();
    const row = {
      id: `quiz_${Date.now()}`,
      title: data.title,
      category: data.category,
      related_course: data.relatedCourse,
      time_limit: data.timeLimit,
      passing_percent: data.passingPercent,
      questions: data.questions || [],
      created_at: now,
    };

    const { data: created, error } = await this.supabase
      .from('quizzes')
      .insert([row])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return mapQuizFromRow(created);
  }

  async updateQuiz(id, data) {
    const { data: updated, error } = await this.supabase
      .from('quizzes')
      .update({
        title: data.title,
        category: data.category,
        related_course: data.relatedCourse,
        time_limit: data.timeLimit,
        passing_percent: data.passingPercent,
        questions: data.questions || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') {
      return null;
    }

    if (error) {
      throw error;
    }

    return mapQuizFromRow(updated);
  }

  async deleteQuiz(id) {
    const { data, error } = await this.supabase
      .from('quizzes')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      throw error;
    }

    return (data || []).length > 0;
  }

  async findAllAttempts() {
    const { data, error } = await this.supabase
      .from('quiz_attempts')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapAttemptFromRow);
  }

  async findAttemptById(id) {
    const { data, error } = await this.supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data ? mapAttemptFromRow(data) : null;
  }

  async findAttemptsByUser(userId) {
    const { data, error } = await this.supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapAttemptFromRow);
  }

  async createAttempt(data) {
    await this.supabase
      .from('quiz_attempts')
      .delete()
      .eq('user_id', data.userId)
      .eq('quiz_id', data.quizId);

    const row = {
      id: `attempt_${Date.now()}`,
      quiz_id: data.quizId,
      user_id: data.userId,
      score: data.score,
      passed: data.score >= data.passingPercent,
      passing_percent: data.passingPercent,
      answers: data.answers || [],
      time_taken_seconds: data.timeTakenSeconds ?? 0,
      completed_at: new Date().toISOString(),
    };

    const { data: created, error } = await this.supabase
      .from('quiz_attempts')
      .insert([row])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return mapAttemptFromRow(created);
  }
}

module.exports = SupabaseQuizStore;
