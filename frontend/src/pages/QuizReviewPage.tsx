import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface ReviewQuestion {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  userAnswerIndex: number;
  insight: string;
}

const reviewData = {
  title: 'Eco-Friendly Solvents: Safety Protocols',
  category: 'Internal Certification',
  completedDate: 'Oct 24, 2024',
  score: 98,
  totalQuestions: 5,
  correctAnswers: 4,
  timeTaken: '4:32',
  questions: [
    {
      id: 1,
      text: 'Which chemical should NEVER be mixed with bleach during cleaning operations?',
      options: ['Water', 'Ammonia-based cleaners', 'Baking soda solution', 'White vinegar (diluted)'],
      correctIndex: 1,
      userAnswerIndex: 1,
      insight: 'Mixing bleach with ammonia creates chloramine vapors — a toxic gas that can cause severe respiratory damage. Always read chemical labels before combining products.',
    },
    {
      id: 2,
      text: 'What is the correct PPE when handling strong degreasers?',
      options: ['Just gloves', 'Gloves and safety glasses only', 'Gloves, safety glasses, and an apron', 'No PPE required'],
      correctIndex: 2,
      userAnswerIndex: 2,
      insight: 'Strong degreasers can splash during use. Full PPE including gloves, safety glasses, and an apron protects against skin and eye contact which can cause chemical burns.',
    },
    {
      id: 3,
      text: 'How should you dispose of leftover cleaning chemical solutions at end of shift?',
      options: ['Pour down any drain', 'Store in any available container', 'Follow the SDS disposal guidelines', 'Leave in the cleaning cart overnight'],
      correctIndex: 2,
      userAnswerIndex: 0,
      insight: 'Safety Data Sheets (SDS) provide specific disposal instructions for each chemical. Improper disposal can harm the environment and violate workplace safety regulations.',
    },
    {
      id: 4,
      text: 'Which method most effectively reduces microplastic runoff in commercial laundering?',
      options: ['Installing external 100-micron filtration units', 'Implementing cold-cycle fermentation protocols', 'Transitioning to synthetic detergents', 'Increasing rotational drum speed'],
      correctIndex: 0,
      userAnswerIndex: 0,
      insight: 'Laundering synthetic clothing releases up to 700,000 microplastic fibers per wash. External filtration units capture these fibers before they enter waterways.',
    },
    {
      id: 5,
      text: 'What is the proper way to store mops after use in a food service area?',
      options: ['Leave flat on the floor to dry', 'Hang upside down in a well-ventilated area', 'Store in the mop bucket with solution', 'Place in a closed storage closet while wet'],
      correctIndex: 1,
      userAnswerIndex: 1,
      insight: 'Hanging mops upside down allows them to dry completely, preventing bacterial growth. Damp mops stored incorrectly can become a major source of cross-contamination.',
    },
  ] as ReviewQuestion[],
};

export default function QuizReviewPage() {
  const navigate = useNavigate();
  const { title, category, completedDate, score, totalQuestions, correctAnswers, timeTaken, questions } = reviewData;
  const passed = score >= 70;

  return (
    <div className="bg-[#faf9f5] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen">

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b border-[#e1e4e0]/30"
          style={{ background: 'rgba(250,249,245,0.8)', backdropFilter: 'blur(20px)' }}>
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

          {/* Score Summary Card */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #172a1e 0%, #2d4033 100%)', boxShadow: '0 10px 40px rgba(23,42,30,0.15)' }}>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative z-10">
                  <span className="text-[12px] font-bold uppercase tracking-[0.2em] block mb-2" style={{ color: '#b6ccba' }}>
                    {category} • Completed {completedDate}
                  </span>
                  <h2 className="text-[28px] font-bold text-white mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {title}
                  </h2>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 rounded-full text-[12px] font-bold"
                      style={{ background: passed ? '#d2e8d6' : '#ba1a1a', color: passed ? '#172a1e' : '#ffffff' }}>
                      {passed ? '✓ PASSED' : '✗ FAILED'}
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

          {/* Questions Review */}
          <div className="space-y-4">
            <h3 className="text-[22px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
              Question Breakdown
            </h3>

            {questions.map((question, index) => {
              const isCorrect = question.userAnswerIndex === question.correctIndex;
              return (
                <div key={question.id} className="bg-white rounded-2xl overflow-hidden border"
                  style={{ borderColor: isCorrect ? '#d2e8d6' : '#ffdad6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

                  {/* Question header */}
                  <div className="flex items-start gap-4 p-6 border-b"
                    style={{ borderColor: isCorrect ? '#d2e8d6' : '#ffdad6', background: isCorrect ? 'rgba(210,232,214,0.1)' : 'rgba(255,218,214,0.1)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-[14px]"
                      style={{ background: isCorrect ? '#d2e8d6' : '#ffdad6', color: isCorrect ? '#172a1e' : '#93000a' }}>
                      {index + 1}
                    </div>
                    <p className="text-[16px] font-semibold leading-snug flex-1" style={{ color: '#1b1c1a' }}>
                      {question.text}
                    </p>
                    <span className="material-symbols-outlined text-[22px] shrink-0"
                      style={{ color: isCorrect ? '#172a1e' : '#ba1a1a' }}>
                      {isCorrect ? 'check_circle' : 'cancel'}
                    </span>
                  </div>

                  {/* Answer options */}
                  <div className="p-6 space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isCorrectOption = optIndex === question.correctIndex;
                      const isUserWrongAnswer = optIndex === question.userAnswerIndex && !isCorrect;

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
                            {isCorrectOption ? 'Correct Answer' : 'Your Answer'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Insight */}
                  <div className="mx-6 mb-6 p-4 rounded-xl flex gap-3 items-start"
                    style={{ background: 'rgba(210,232,214,0.2)', border: '1px solid rgba(182,204,186,0.4)' }}>
                    <div className="p-1.5 rounded-lg shrink-0" style={{ background: '#dae8be' }}>
                      <span className="material-symbols-outlined text-[18px]"
                        style={{ color: '#1f2a0e', fontVariationSettings: "'FILL' 1" }}>
                        lightbulb
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#3f4b2c' }}>
                        Training Insight
                      </p>
                      <p className="text-[13px] leading-relaxed" style={{ color: '#434843' }}>
                        {question.insight}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={() => navigate('/employee/quiz')}
              className="flex-1 py-3 rounded-xl text-[15px] font-bold border transition-all flex items-center justify-center gap-2"
              style={{ borderColor: '#172a1e', color: '#172a1e', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f4f4f0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Quiz Center
            </button>
            <button onClick={() => navigate('/employee/quiz/play')}
              className="flex-1 py-3 rounded-xl text-[15px] font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: '#172a1e', color: '#ffffff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
              onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
              <span className="material-symbols-outlined text-[18px]">replay</span>
              Retake Quiz
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-10 px-8 mt-8 bg-white border-t border-[#e1e4e0]/30">
          <div className="max-w-[860px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-[20px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>CleanIQ</span>
              <p className="text-[13px] mt-1" style={{ color: '#737873' }}>© 2025 CleanIQ. Purifying spaces, professionally.</p>
            </div>
            <div className="flex gap-8">
              {['Privacy Policy', 'Terms of Service', 'Support'].map(link => (
                <a key={link} href="#" className="text-[12px] font-bold transition-colors" style={{ color: '#737873' }}
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