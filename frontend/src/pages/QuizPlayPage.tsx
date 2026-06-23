import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { fetchQuizById, submitQuizAttempt, type Quiz } from '../api/quiz';

interface PlayQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

function toPlayQuestions(quiz: Quiz): PlayQuestion[] {
  return quiz.questions.map(q => {
    const correctIndex = q.options.findIndex(o => o.isCorrect);
    return {
      id: q.id,
      text: q.text,
      options: q.options.map(o => o.text),
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    };
  });
}

export default function QuizPlayPage() {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<PlayQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(30);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submittedAttemptId, setSubmittedAttemptId] = useState<string | null>(null);
  const attemptSubmitted = useRef(false);
  const answersRef = useRef<(number | null)[]>([]);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!quizId) {
      setLoadError('No quiz selected.');
      setIsLoading(false);
      return;
    }

    const loadQuiz = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const data = await fetchQuizById(quizId);
        if (data.questions.length === 0) {
          setLoadError('This quiz has no questions yet.');
          return;
        }
        setQuiz(data);
        const playQuestions = toPlayQuestions(data);
        setQuestions(playQuestions);
        setAnswers(Array(playQuestions.length).fill(null));
        startTimeRef.current = Date.now();
        const perQuestion = Math.max(30, Math.floor((data.timeLimit * 60) / playQuestions.length));
        setSecondsPerQuestion(perQuestion);
        setTimeLeft(perQuestion);
      } catch {
        setLoadError('Unable to load this quiz.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;
  const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passingPercent = quiz?.passingPercent ?? 70;
  const passed = scorePercent >= passingPercent;

  const handleNext = useCallback(() => {
    if (questions.length === 0) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  }, [currentIndex, questions.length]);

  useEffect(() => {
    if (answered || finished || questions.length === 0) return;
    if (timeLeft === 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, answered, finished, handleNext, questions.length]);

  useEffect(() => {
    setTimeLeft(secondsPerQuestion);
    setSelectedOption(null);
    setAnswered(false);
  }, [currentIndex, secondsPerQuestion]);

  useEffect(() => {
    if (!finished || !quiz || !user?.id || attemptSubmitted.current || questions.length === 0) return;

    attemptSubmitted.current = true;
    const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const attemptAnswers = questions.map((q, i) => ({
      questionId: q.id,
      selectedIndex: answersRef.current[i] ?? -1,
    }));

    submitQuizAttempt({
      userId: user.id,
      quizId: quiz.id,
      score: scorePercent,
      passingPercent: quiz.passingPercent,
      answers: attemptAnswers,
      timeTakenSeconds,
    })
      .then(attempt => setSubmittedAttemptId(attempt.id))
      .catch(() => {});
  }, [finished, quiz, user?.id, scorePercent, questions]);

  const handleSelect = (index: number) => {
    if (answered || !currentQuestion) return;
    setSelectedOption(index);
    setAnswered(true);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = index;
    setAnswers(newAnswers);
    if (index === currentQuestion.correctIndex) setScore(s => s + 1);
  };

  const resetQuiz = () => {
    attemptSubmitted.current = false;
    setSubmittedAttemptId(null);
    startTimeRef.current = Date.now();
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setAnswers(Array(questions.length).fill(null));
    setTimeLeft(secondsPerQuestion);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const getOptionClass = (index: number) => {
    if (!currentQuestion) return 'theme-quiz-option';
    if (!answered) {
      return selectedOption === index ? 'theme-quiz-option theme-quiz-option--selected' : 'theme-quiz-option';
    }
    if (index === currentQuestion.correctIndex) return 'theme-quiz-option theme-quiz-option--correct';
    if (index === selectedOption) return 'theme-quiz-option theme-quiz-option--wrong';
    return 'theme-quiz-option';
  };

  const getCheckStyle = (index: number) => {
    if (!currentQuestion) return { border: '2px solid #c3c8c1', background: 'transparent' };
    if (!answered) return {
      border: selectedOption === index ? '2px solid #172a1e' : '2px solid #c3c8c1',
      background: selectedOption === index ? '#172a1e' : 'transparent',
    };
    if (index === currentQuestion.correctIndex) return { border: '2px solid #172a1e', background: '#172a1e' };
    if (index === selectedOption) return { border: '2px solid #ba1a1a', background: '#ba1a1a' };
    return { border: '2px solid #c3c8c1', background: 'transparent' };
  };

  if (isLoading) {
    return (
      <div className="theme-page min-h-screen flex items-center justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
        <p style={{ color: '#737873' }}>Loading quiz...</p>
      </div>
    );
  }

  if (loadError || !quiz || !currentQuestion) {
    return (
      <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Sidebar />
        <main className="lg:ml-72 min-h-screen flex flex-col items-center justify-center px-8">
          <p className="text-[16px] mb-6" style={{ color: '#ba1a1a' }}>{loadError || 'Quiz not found.'}</p>
          <button onClick={() => navigate('/employee/quiz')}
            className="px-6 py-3 rounded-xl text-[15px] font-bold"
            style={{ background: '#172a1e', color: '#ffffff' }}>
            Back to Quiz Center
          </button>
        </main>
      </div>
    );
  }
  if (finished) {
    return (
      <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <Sidebar />
        <main className="lg:ml-72 min-h-screen flex flex-col items-center justify-center px-8 py-16">
          <div className="w-full max-w-lg text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: passed ? '#d2e8d6' : '#ffdad6' }}>
              <span className="material-symbols-outlined text-[48px]"
                style={{ color: passed ? '#172a1e' : '#ba1a1a' }}>
                {passed ? 'workspace_premium' : 'sentiment_dissatisfied'}
              </span>
            </div>
            <h2 className="text-[36px] font-bold mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
              {passed ? 'Quiz Passed!' : 'Quiz Failed'}
            </h2>
            <p className="text-[16px] mb-8" style={{ color: '#434843' }}>
              {passed
                ? 'Great work! Your score has been saved to your training history.'
                : "Don't worry — review the material and try again."}
            </p>

            <div className="rounded-2xl p-8 mb-8"
              style={{ background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div className="text-[64px] font-bold leading-none mb-2"
                style={{ fontFamily: 'Manrope, sans-serif', color: passed ? '#172a1e' : '#ba1a1a' }}>
                {scorePercent}%
              </div>
              <p className="text-[14px] font-bold uppercase tracking-wider mb-6" style={{ color: '#737873' }}>
                {score} of {questions.length} correct • Pass mark {passingPercent}%
              </p>
              <div className="space-y-2 text-left">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-center gap-3 py-2 border-b border-[#f4f4f0]">
                    <span className="material-symbols-outlined text-[18px]"
                      style={{ color: answers[i] === q.correctIndex ? '#172a1e' : '#ba1a1a' }}>
                      {answers[i] === q.correctIndex ? 'check_circle' : 'cancel'}
                    </span>
                    <p className="text-[13px] flex-1" style={{ color: '#434843' }}>
                      Q{i + 1}: {q.text.length > 55 ? `${q.text.substring(0, 55)}...` : q.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/employee/quiz')}
                className="flex-1 py-3 rounded-xl text-[15px] font-bold border transition-all"
                style={{ borderColor: '#172a1e', color: '#172a1e', background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f4f4f0'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Back to Quiz Center
              </button>
              {submittedAttemptId && (
                <button onClick={() => navigate(`/employee/quiz/review/${submittedAttemptId}`)}
                  className="flex-1 py-3 rounded-xl text-[15px] font-bold transition-all"
                  style={{ background: '#2d4033', color: '#d2e8d6' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#172a1e'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2d4033'}>
                  Review Answers
                </button>
              )}
              <button onClick={resetQuiz}
                className="flex-1 py-3 rounded-xl text-[15px] font-bold transition-all"
                style={{ background: '#172a1e', color: '#ffffff' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
                onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen flex flex-col items-center pt-10 pb-16 px-8">
        <div className="w-full max-w-2xl mb-8">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="text-[28px] font-bold theme-text-primary"
                style={{ fontFamily: 'Manrope, sans-serif' }}>
                {quiz.title}
              </h2>
              <p className="text-[14px] theme-muted">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full theme-quiz-timer ${timeLeft <= 10 ? 'theme-quiz-timer--urgent' : ''}`}>
              <span className="material-symbols-outlined text-[18px]">timer</span>
              <span className="text-[14px] font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden theme-progress-track">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'var(--ring-progress)' }} />
          </div>
        </div>
        <section className="w-full max-w-2xl rounded-2xl p-8 relative overflow-hidden theme-quiz-play-card">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'var(--accent-green)' }} />

          <h3 className="text-[22px] font-bold mb-6 relative z-10 theme-text-primary"
            style={{ fontFamily: 'Manrope, sans-serif', lineHeight: '1.4' }}>
            {currentQuestion.text}
          </h3>

          <div className="space-y-3 relative z-10">
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => handleSelect(index)}
                className={getOptionClass(index)}
                style={{ cursor: answered ? 'default' : 'pointer' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={getCheckStyle(index)}>
                  {answered && (index === currentQuestion.correctIndex || index === selectedOption) && (
                    <span className="material-symbols-outlined text-[14px] text-white">
                      {index === currentQuestion.correctIndex ? 'check' : 'close'}
                    </span>
                  )}
                  {!answered && selectedOption === index && (
                    <span className="material-symbols-outlined text-[14px] text-white">check</span>
                  )}
                </div>
                <span>{option}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center border-t pt-6" style={{ borderColor: 'var(--border-subtle)' }}>
            <button onClick={handleNext}
              className="theme-link text-[14px] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">undo</span>
              Skip for now
            </button>
            <button onClick={handleNext} disabled={!answered}
              className="theme-btn-primary flex items-center gap-2 px-8 py-3 rounded-full text-[14px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </section>
        <footer className="theme-footer w-full max-w-2xl mt-12 pt-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-[12px] theme-muted">
              © 2025 CleanIQ. Purifying spaces, professionally.
            </p>
            <div className="flex gap-6">
              {['Support', 'Privacy Policy', 'Terms of Service'].map(link => (
                <a key={link} href="#"
                  className="theme-link text-[12px] font-medium">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
