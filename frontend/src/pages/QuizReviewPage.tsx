import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { fetchAttemptById, fetchQuizById, type Quiz, type QuizAttempt } from '../api/quiz';
import { formatQuizDate } from '../utils/quizDisplay';

interface ReviewQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  userAnswerIndex: number;
}

function buildReviewQuestions(quiz: Quiz, attempt: QuizAttempt): ReviewQuestion[] {
  const answerMap = new Map(
    (attempt.answers ?? []).map(a => [a.questionId, a.selectedIndex])
  );

  return quiz.questions.map(q => {
    const correctIndex = q.options.findIndex(o => o.isCorrect);
    return {
      id: q.id,
      text: q.text,
      options: q.options.map(o => o.text),
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      userAnswerIndex: answerMap.get(q.id) ?? -1,
    };
  });
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function QuizReviewPage() {
  const navigate = useNavigate();
  const { attemptId } = useParams<{ attemptId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setLoadError('No quiz attempt selected.');
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const attemptData = await fetchAttemptById(attemptId);
        const quizData = await fetchQuizById(attemptData.quizId);
        setAttempt(attemptData);
        setQuiz(quizData);
      } catch {
        setLoadError('Unable to load quiz review.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [attemptId]);

  const questions = useMemo(
    () => (quiz && attempt ? buildReviewQuestions(quiz, attempt) : []),
    [quiz, attempt]
  );

  if (isLoading) {
    return (
      <div className="theme-page min-h-screen flex items-center justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
        <p style={{ color: '#737873' }}>Loading review...</p>
      </div>
    );
  }

  if (loadError || !quiz || !attempt) {
    return (
      <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Sidebar />
        <main className="lg:ml-72 min-h-screen flex flex-col items-center justify-center px-8">
          <p className="text-[16px] mb-6" style={{ color: '#ba1a1a' }}>{loadError || 'Review not found.'}</p>
          <button onClick={() => navigate('/employee/quiz')}
            className="px-6 py-3 rounded-xl text-[15px] font-bold"
            style={{ background: '#172a1e', color: '#ffffff' }}>
            Back to Quiz Center
          </button>
        </main>
      </div>
    );
  }

  const score = attempt.score;
  const passed = attempt.passed;
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter(
    q => q.userAnswerIndex >= 0 && q.userAnswerIndex === q.correctIndex
  ).length;
  const completedDate = formatQuizDate(attempt.completedAt);
  const timeTaken = formatDuration(attempt.timeTakenSeconds ?? 0);
  const hasAnswerDetails = (attempt.answers ?? []).length > 0;

  return (
    <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen">
        <header className="theme-header-bar h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/employee/quiz')}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
              style={{ color: '#434843' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e9e8e4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-[24px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
              Quiz Review
            </h1>
          </div>
          <button onClick={() => navigate('/employee/quiz')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-bold transition-all"
            style={{ background: '#172a1e', color: '#ffffff' }}
            onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
            onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Quiz Center
          </button>
        </header>

        <div className="max-w-[860px] mx-auto px-8 py-10 space-y-8">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #172a1e 0%, #2d4033 100%)', boxShadow: '0 10px 40px rgba(23,42,30,0.15)' }}>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative z-10">
                  <span className="text-[12px] font-bold uppercase tracking-[0.2em] block mb-2" style={{ color: '#b6ccba' }}>
                    {quiz.category} • Completed {completedDate}
                  </span>
                  <h2 className="text-[28px] font-bold text-white mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {quiz.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 rounded-full text-[12px] font-bold"
                      style={{ background: passed ? '#d2e8d6' : '#ba1a1a', color: passed ? '#172a1e' : '#ffffff' }}>
                      {passed ? '✓ PASSED' : '✗ FAILED'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[12px] font-bold"
                      style={{ background: 'rgba(255,255,255,0.15)', color: '#d2e8d6' }}>
                      Pass mark {attempt.passingPercent}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className="text-[56px] font-bold leading-none text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {score}%
                    </div>
                    <div className="text-[12px] font-bold uppercase tracking-wider mt-1" style={{ color: '#b6ccba' }}>
                      Final Score
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: '#d2e8d6' }}>check_circle</span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(182,204,186,0.7)' }}>Correct</p>
                        <p className="text-[16px] font-bold text-white">{correctAnswers}/{totalQuestions}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: '#d2e8d6' }}>timer</span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(182,204,186,0.7)' }}>Time Taken</p>
                        <p className="text-[16px] font-bold text-white">{timeTaken}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 pb-6">
              <div className="flex justify-between text-[12px] mb-2" style={{ color: 'rgba(182,204,186,0.7)' }}>
                <span>Score breakdown</span>
                <span>{correctAnswers} correct · {totalQuestions - correctAnswers} incorrect</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="h-full rounded-full" style={{ width: `${score}%`, background: '#d2e8d6' }} />
              </div>
            </div>
          </div>

          {!hasAnswerDetails && (
            <div className="p-4 rounded-xl text-[14px]" style={{ background: '#fbddc7', color: '#574333' }}>
              Detailed answer breakdown is not available for this attempt. Retake the quiz to record your answers.
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-[22px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
              Question Breakdown
            </h3>

            {questions.map((question, index) => {
              const answered = question.userAnswerIndex >= 0;
              const isCorrect = answered && question.userAnswerIndex === question.correctIndex;
              const skipped = !answered;

              return (
                <div key={question.id} className="bg-white rounded-2xl overflow-hidden border"
                  style={{
                    borderColor: skipped ? '#e1e4e0' : isCorrect ? '#d2e8d6' : '#ffdad6',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}>

                  <div className="flex items-start gap-4 p-6 border-b"
                    style={{
                      borderColor: skipped ? '#e1e4e0' : isCorrect ? '#d2e8d6' : '#ffdad6',
                      background: skipped ? '#f9f9f9' : isCorrect ? 'rgba(210,232,214,0.1)' : 'rgba(255,218,214,0.1)',
                    }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-[14px]"
                      style={{
                        background: skipped ? '#e3e2df' : isCorrect ? '#d2e8d6' : '#ffdad6',
                        color: skipped ? '#434843' : isCorrect ? '#172a1e' : '#93000a',
                      }}>
                      {index + 1}
                    </div>
                    <p className="text-[16px] font-semibold leading-snug flex-1" style={{ color: '#1b1c1a' }}>
                      {question.text}
                    </p>
                    <span className="material-symbols-outlined text-[22px] shrink-0"
                      style={{ color: skipped ? '#737873' : isCorrect ? '#172a1e' : '#ba1a1a' }}>
                      {skipped ? 'help_outline' : isCorrect ? 'check_circle' : 'cancel'}
                    </span>
                  </div>

                  <div className="p-6 space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isCorrectOption = optIndex === question.correctIndex;
                      const isUserAnswer = answered && optIndex === question.userAnswerIndex;
                      const isUserWrongAnswer = isUserAnswer && !isCorrect;

                      if (!isCorrectOption && !isUserWrongAnswer) {
                        return (
                          <div key={optIndex} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={{ background: '#f9f9f9' }}>
                            <div className="w-5 h-5 rounded-full border-2 shrink-0" style={{ borderColor: '#d1d5db' }} />
                            <span className="text-[14px]" style={{ color: '#737873' }}>{option}</span>
                          </div>
                        );
                      }

                      return (
                        <div key={optIndex} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{
                            background: isCorrectOption ? '#d2e8d6' : '#ffdad6',
                            border: `1px solid ${isCorrectOption ? '#b6ccba' : '#ffb4ab'}`,
                          }}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: isCorrectOption ? '#172a1e' : '#ba1a1a' }}>
                            <span className="material-symbols-outlined text-[12px] text-white">
                              {isCorrectOption ? 'check' : 'close'}
                            </span>
                          </div>
                          <span className="text-[14px] font-semibold flex-1"
                            style={{ color: isCorrectOption ? '#172a1e' : '#93000a' }}>
                            {option}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: isCorrectOption ? '#172a1e' : '#ba1a1a', color: '#ffffff' }}>
                            {isCorrectOption ? (isUserAnswer ? 'Correct · Your Answer' : 'Correct Answer') : 'Your Answer'}
                          </span>
                        </div>
                      );
                    })}

                    {skipped && (
                      <p className="text-[13px] italic pt-2" style={{ color: '#737873' }}>
                        You did not answer this question.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={() => navigate('/employee/quiz')}
              className="flex-1 py-3 rounded-xl text-[15px] font-bold border transition-all flex items-center justify-center gap-2"
              style={{ borderColor: '#172a1e', color: '#172a1e', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f4f4f0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Quiz Center
            </button>
            <button onClick={() => navigate(`/employee/quiz/play/${quiz.id}`)}
              className="flex-1 py-3 rounded-xl text-[15px] font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: '#172a1e', color: '#ffffff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
              onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
              <span className="material-symbols-outlined text-[18px]">replay</span>
              Retake Quiz
            </button>
          </div>
        </div>

        <footer className="theme-footer py-10 px-8 mt-8 border-t">
          <div className="max-w-[860px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-[20px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>CleanIQ</span>
              <p className="text-[13px] mt-1" style={{ color: '#737873' }}>© 2025 CleanIQ. Purifying spaces, professionally.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
