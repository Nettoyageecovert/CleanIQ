import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  insight: string;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    text: 'Which chemical should NEVER be mixed with bleach during cleaning operations?',
    options: ['Water', 'Ammonia-based cleaners', 'Baking soda solution', 'White vinegar (diluted)'],
    correctIndex: 1,
    insight: 'Mixing bleach with ammonia creates chloramine vapors — a toxic gas that can cause severe respiratory damage. Always read chemical labels before combining products.',
  },
  {
    id: 2,
    text: 'What is the correct PPE when handling strong degreasers?',
    options: ['Just gloves', 'Gloves and safety glasses only', 'Gloves, safety glasses, and an apron', 'No PPE required'],
    correctIndex: 2,
    insight: 'Strong degreasers can splash during use. Full PPE including gloves, safety glasses, and an apron protects against skin and eye contact which can cause chemical burns.',
  },
  {
    id: 3,
    text: 'How should you dispose of leftover cleaning chemical solutions at end of shift?',
    options: ['Pour down any drain', 'Store in any available container', 'Follow the SDS disposal guidelines', 'Leave in the cleaning cart overnight'],
    correctIndex: 2,
    insight: 'Safety Data Sheets (SDS) provide specific disposal instructions for each chemical. Improper disposal can harm the environment and violate workplace safety regulations.',
  },
  {
    id: 4,
    text: 'Which method most effectively reduces microplastic runoff in commercial laundering?',
    options: ['Installing external 100-micron filtration units', 'Implementing cold-cycle fermentation protocols', 'Transitioning to high-viscosity synthetic detergents', 'Increasing rotational drum speed'],
    correctIndex: 0,
    insight: 'Laundering synthetic clothing releases up to 700,000 microplastic fibers per wash. External filtration units capture these fibers before they enter waterways.',
  },
  {
    id: 5,
    text: 'What is the proper way to store mops after use in a food service area?',
    options: ['Leave flat on the floor to dry', 'Hang upside down in a well-ventilated area', 'Store in the mop bucket with solution', 'Place in a closed storage closet while wet'],
    correctIndex: 1,
    insight: 'Hanging mops upside down allows them to dry completely, preventing bacterial growth. Damp mops stored incorrectly can become a major source of cross-contamination.',
  },
];

export default function QuizPlayPage() {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(mockQuestions.length).fill(null));

  const currentQuestion = mockQuestions[currentIndex];
  const progress = (currentIndex / mockQuestions.length) * 100;
  const scorePercent = Math.round((score / mockQuestions.length) * 100);

  // Timer
  useEffect(() => {
    if (answered || finished) return;
    if (timeLeft === 0) { handleNext(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, answered, finished]);

  // Reset on new question
  useEffect(() => {
    setTimeLeft(30);
    setSelectedOption(null);
    setAnswered(false);
  }, [currentIndex]);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelectedOption(index);
    setAnswered(true);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = index;
    setAnswers(newAnswers);
    if (index === currentQuestion.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < mockQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const getOptionStyle = (index: number) => {
    if (!answered) return {
      border: selectedOption === index ? '2px solid #172a1e' : '2px solid #e1e4e0',
      background: selectedOption === index ? '#f4f4f0' : '#ffffff',
    };
    if (index === currentQuestion.correctIndex) return { border: '2px solid #172a1e', background: '#d2e8d6' };
    if (index === selectedOption) return { border: '2px solid #ba1a1a', background: '#ffdad6' };
    return { border: '2px solid #e1e4e0', background: '#ffffff' };
  };

  const getCheckStyle = (index: number) => {
    if (!answered) return {
      border: selectedOption === index ? '2px solid #172a1e' : '2px solid #c3c8c1',
      background: selectedOption === index ? '#172a1e' : 'transparent',
    };
    if (index === currentQuestion.correctIndex) return { border: '2px solid #172a1e', background: '#172a1e' };
    if (index === selectedOption) return { border: '2px solid #ba1a1a', background: '#ba1a1a' };
    return { border: '2px solid #c3c8c1', background: 'transparent' };
  };

  // ── Results Screen ────────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="bg-[#faf9f5] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <Sidebar />
        <main className="lg:ml-72 min-h-screen flex flex-col items-center justify-center px-8 py-16">
          <div className="w-full max-w-lg text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: scorePercent >= 70 ? '#d2e8d6' : '#ffdad6' }}>
              <span className="material-symbols-outlined text-[48px]"
                style={{ color: scorePercent >= 70 ? '#172a1e' : '#ba1a1a' }}>
                {scorePercent >= 70 ? 'workspace_premium' : 'sentiment_dissatisfied'}
              </span>
            </div>
            <h2 className="text-[36px] font-bold mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
              {scorePercent >= 70 ? 'Quiz Passed!' : 'Quiz Failed'}
            </h2>
            <p className="text-[16px] mb-8" style={{ color: '#434843' }}>
              {scorePercent >= 70
                ? 'Great work! Your score has been saved to your training history.'
                : "Don't worry — review the material and try again."}
            </p>

            <div className="rounded-2xl p-8 mb-8"
              style={{ background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div className="text-[64px] font-bold leading-none mb-2"
                style={{ fontFamily: 'Manrope, sans-serif', color: scorePercent >= 70 ? '#172a1e' : '#ba1a1a' }}>
                {scorePercent}%
              </div>
              <p className="text-[14px] font-bold uppercase tracking-wider mb-6" style={{ color: '#737873' }}>
                {score} of {mockQuestions.length} correct
              </p>
              <div className="space-y-2 text-left">
                {mockQuestions.map((q, i) => (
                  <div key={q.id} className="flex items-center gap-3 py-2 border-b border-[#f4f4f0]">
                    <span className="material-symbols-outlined text-[18px]"
                      style={{ color: answers[i] === q.correctIndex ? '#172a1e' : '#ba1a1a' }}>
                      {answers[i] === q.correctIndex ? 'check_circle' : 'cancel'}
                    </span>
                    <p className="text-[13px] flex-1" style={{ color: '#434843' }}>
                      Q{i + 1}: {q.text.substring(0, 55)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => navigate('/employee/quiz')}
                className="flex-1 py-3 rounded-xl text-[15px] font-bold border transition-all"
                style={{ borderColor: '#172a1e', color: '#172a1e', background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f4f4f0'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Back to Quiz Center
              </button>
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setScore(0);
                  setFinished(false);
                  setAnswers(Array(mockQuestions.length).fill(null));
                }}
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

  // ── Quiz Screen ───────────────────────────────────────────────────────────
  return (
    <div className="bg-[#faf9f5] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen flex flex-col items-center pt-10 pb-16 px-8">

        {/* Progress Header */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="text-[28px] font-bold"
                style={{ fontFamily: 'Manrope, sans-serif', color: '#1b1c1a' }}>
                Chemical Safety
              </h2>
              <p className="text-[14px]" style={{ color: '#737873' }}>
                Question {currentIndex + 1} of {mockQuestions.length}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: timeLeft <= 10 ? '#ffdad6' : '#dae8be',
                color: timeLeft <= 10 ? '#93000a' : '#1f2a0e',
              }}>
              <span className="material-symbols-outlined text-[18px]">timer</span>
              <span className="text-[14px] font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#e1e4e0' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: '#172a1e' }} />
          </div>
        </div>

        {/* Question Card */}
        <section className="w-full max-w-2xl rounded-2xl p-8 relative overflow-hidden"
          style={{ background: '#ffffff', boxShadow: '0 10px 40px rgba(23,42,30,0.08)' }}>
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20 pointer-events-none"
            style={{ background: '#d2e8d6' }} />

          <h3 className="text-[22px] font-bold mb-6 relative z-10"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#1b1c1a', lineHeight: '1.4' }}>
            {currentQuestion.text}
          </h3>

          <div className="space-y-3 relative z-10">
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => handleSelect(index)}
                className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left"
                style={{ ...getOptionStyle(index), cursor: answered ? 'default' : 'pointer' }}>
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
                <span className="text-[16px]"
                  style={{
                    color: answered && index === currentQuestion.correctIndex ? '#172a1e'
                      : answered && index === selectedOption ? '#93000a'
                      : '#1b1c1a',
                    fontWeight: answered && index === currentQuestion.correctIndex ? '700' : '500',
                  }}>
                  {option}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center border-t border-[#f4f4f0] pt-6">
            <button onClick={handleNext}
              className="text-[14px] font-medium flex items-center gap-1 transition-colors"
              style={{ color: '#737873' }}
              onMouseEnter={e => e.currentTarget.style.color = '#172a1e'}
              onMouseLeave={e => e.currentTarget.style.color = '#737873'}>
              <span className="material-symbols-outlined text-[18px]">undo</span>
              Skip for now
            </button>
            <button onClick={handleNext} disabled={!answered}
              className="flex items-center gap-2 px-8 py-3 rounded-full text-[14px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#172a1e', color: '#ffffff' }}
              onMouseEnter={e => { if (answered) e.currentTarget.style.background = '#2d4033'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#172a1e'; }}>
              {currentIndex < mockQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Insight Card — shows after answering */}
        {answered && (
          <section className="w-full max-w-2xl mt-4 p-5 rounded-xl flex gap-4 items-start"
            style={{ background: 'rgba(210,232,214,0.2)', border: '1px solid rgba(182,204,186,0.4)' }}>
            <div className="p-2 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#dae8be' }}>
              <span className="material-symbols-outlined text-[20px]"
                style={{ color: '#1f2a0e', fontVariationSettings: "'FILL' 1" }}>
                lightbulb
              </span>
            </div>
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider mb-1"
                style={{ color: '#3f4b2c' }}>
                Training Insight
              </h4>
              <p className="text-[14px] leading-relaxed" style={{ color: '#434843' }}>
                {currentQuestion.insight}
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="w-full max-w-2xl mt-12 pt-6 border-t border-[#e1e4e0]/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-[12px]" style={{ color: '#737873' }}>
              © 2025 CleanIQ. Purifying spaces, professionally.
            </p>
            <div className="flex gap-6">
              {['Support', 'Privacy Policy', 'Terms of Service'].map(link => (
                <a key={link} href="#"
                  className="text-[12px] font-medium transition-colors"
                  style={{ color: '#737873' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#172a1e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#737873'}>
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