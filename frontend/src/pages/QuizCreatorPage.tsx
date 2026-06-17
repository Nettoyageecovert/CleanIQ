import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployerSidebar from '../components/EmployerSidebar';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  image: string | null;
  options: QuizOption[];
}

interface QuizSettings {
  title: string;
  relatedCourse: string;
  timeLimit: number;
  passingPercent: number;
}

const COURSES = [
  'Chemical Safety 101',
  'Residential Cleaning Standards',
  'Eco-Friendly Protocols',
  'Advanced Stewardship',
  'Floor Care & Surface Protection',
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const OPTION_COLORS = [
  { bg: 'rgba(230,57,70,0.08)', border: '#e63946' },
  { bg: 'rgba(33,150,243,0.08)', border: '#2196f3' },
  { bg: 'rgba(244,162,97,0.08)', border: '#f4a261' },
  { bg: 'rgba(42,157,143,0.08)', border: '#2a9d8f' },
];

const createEmptyOption = (): QuizOption => ({
  id: crypto.randomUUID(),
  text: '',
  isCorrect: false,
});

const createEmptyQuestion = (): Question => ({
  id: crypto.randomUUID(),
  text: '',
  image: null,
  options: [
    createEmptyOption(),
    createEmptyOption(),
    createEmptyOption(),
    createEmptyOption(),
  ],
});

export default function QuizCreatorPage() {
  const navigate = useNavigate();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [settings, setSettings] = useState<QuizSettings>({
    title: '',
    relatedCourse: '',
    timeLimit: 30,
    passingPercent: 80,
  });

  const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion()]);

  const updateSettings = (key: keyof QuizSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addQuestion = () => setQuestions(prev => [...prev, createEmptyQuestion()]);

  const removeQuestion = (qId: string) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const updateQuestionText = (qId: string, text: string) =>
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, text } : q));

  const handleQuestionImage = (qId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, image: url } : q));
  };

  const removeQuestionImage = (qId: string) =>
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, image: null } : q));

  const updateOptionText = (qId: string, oId: string, text: string) =>
    setQuestions(prev => prev.map(q =>
      q.id === qId
        ? { ...q, options: q.options.map(o => o.id === oId ? { ...o, text } : o) }
        : q
    ));

  const setCorrectOption = (qId: string, oId: string) =>
    setQuestions(prev => prev.map(q =>
      q.id === qId
        ? { ...q, options: q.options.map(o => ({ ...o, isCorrect: o.id === oId })) }
        : q
    ));

  const handlePublish = () => {
    alert('Quiz published successfully!');
    navigate('/employer/dashboard');
  };

  return (
    <div className="bg-[#faf9f5] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <EmployerSidebar />

      <div className="lg:ml-72 flex flex-col min-h-screen">

        {/* Top Bar */}
        <header className="h-20 sticky top-0 z-40 flex items-center justify-between px-8 border-b border-[#e1e4e0]/30"
          style={{ background: 'rgba(250,249,245,0.9)', backdropFilter: 'blur(20px)' }}>
          <h1 className="text-[22px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
            CleanIQ Admin
          </h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            style={{ color: '#434843' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e9e8e4'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </header>

        <main className="flex-1 px-8 py-10 max-w-[1000px] mx-auto w-full">

          {/* Page Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-1 mb-2">
                <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#737873' }}>Admin Console</span>
                <span className="material-symbols-outlined text-[14px]" style={{ color: '#737873' }}>chevron_right</span>
                <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#172a1e' }}>Quiz Creator</span>
              </nav>
              <h2 className="text-[32px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
                Create New Quiz
              </h2>
              <p className="text-[15px] mt-1" style={{ color: '#434843' }}>
                Design professional assessments for your employees.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => navigate('/employer/dashboard')}
                className="px-5 py-2.5 rounded-xl text-[14px] font-bold border transition-all"
                style={{ borderColor: '#705a49', color: '#705a49' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(112,90,73,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Cancel
              </button>
              <button className="px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all"
                style={{ background: '#2d4033', color: '#d2e8d6' }}
                onMouseEnter={e => e.currentTarget.style.background = '#172a1e'}
                onMouseLeave={e => e.currentTarget.style.background = '#2d4033'}>
                Save Draft
              </button>
            </div>
          </div>

          {/* General Settings */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-[22px]" style={{ color: '#172a1e' }}>settings</span>
              <h3 className="text-[22px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>General Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 rounded-2xl bg-white border border-[#e1e4e0]/50"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#434843' }}>Quiz Title</label>
                <input type="text" value={settings.title}
                  onChange={e => updateSettings('title', e.target.value)}
                  placeholder="e.g., Chemical Safety Fundamentals"
                  className="w-full px-4 py-3 rounded-xl text-[15px] border outline-none transition-all"
                  style={{ borderColor: '#e1e4e0', background: '#faf9f5', color: '#1b1c1a' }}
                  onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e1e4e0'; e.target.style.boxShadow = 'none'; }} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#434843' }}>Related Course</label>
                <select value={settings.relatedCourse}
                  onChange={e => updateSettings('relatedCourse', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-[15px] border outline-none transition-all appearance-none"
                  style={{ borderColor: '#e1e4e0', background: '#faf9f5', color: '#1b1c1a' }}
                  onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e1e4e0'; e.target.style.boxShadow = 'none'; }}>
                  <option value="">Select Course...</option>
                  {COURSES.map(course => <option key={course} value={course}>{course}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#434843' }}>Time Limit (Minutes)</label>
                <input type="number" min={1} max={120} value={settings.timeLimit}
                  onChange={e => updateSettings('timeLimit', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl text-[15px] border outline-none transition-all"
                  style={{ borderColor: '#e1e4e0', background: '#faf9f5', color: '#1b1c1a' }}
                  onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e1e4e0'; e.target.style.boxShadow = 'none'; }} />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#434843' }}>Passing Percentage</label>
                  <span className="text-[16px] font-bold" style={{ color: '#172a1e' }}>{settings.passingPercent}%</span>
                </div>
                <input type="range" min={0} max={100} value={settings.passingPercent}
                  onChange={e => updateSettings('passingPercent', Number(e.target.value))}
                  className="w-full h-2 rounded-full cursor-pointer outline-none"
                  style={{ accentColor: '#172a1e' }} />
                <div className="flex justify-between text-[11px]" style={{ color: '#737873' }}>
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Question Builder */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[22px]" style={{ color: '#172a1e' }}>add_task</span>
                <h3 className="text-[22px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>Question Builder</h3>
              </div>
              <button onClick={addQuestion}
                className="flex items-center gap-2 text-[14px] font-bold"
                style={{ color: '#172a1e' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={question.id}
                  className="bg-white rounded-2xl border border-[#e1e4e0]/50 relative group"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

                  <div className="absolute -left-4 top-6 w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] text-white z-10"
                    style={{ background: '#172a1e' }}>
                    {qIndex + 1}
                  </div>

                  <div className="ml-4 p-6 space-y-5">

                    {/* Question text */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-[12px] font-bold uppercase tracking-wider block mb-2" style={{ color: '#737873' }}>
                          Question
                        </label>
                        <textarea rows={2} value={question.text}
                          onChange={e => updateQuestionText(question.id, e.target.value)}
                          placeholder="Type your question here..."
                          className="w-full px-4 py-3 rounded-xl text-[15px] border outline-none transition-all resize-none"
                          style={{ borderColor: '#e1e4e0', background: '#faf9f5', color: '#1b1c1a' }}
                          onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = '#e1e4e0'; e.target.style.boxShadow = 'none'; }} />
                      </div>
                      {questions.length > 1 && (
                        <button onClick={() => removeQuestion(question.id)}
                          className="mt-6 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          style={{ color: '#737873' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ba1a1a'; e.currentTarget.style.background = '#ffdad6'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#737873'; e.currentTarget.style.background = 'transparent'; }}>
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="text-[12px] font-bold uppercase tracking-wider block mb-2" style={{ color: '#737873' }}>
                        Question Image
                        <span className="ml-2 text-[11px] normal-case font-medium" style={{ color: '#b6ccba' }}>— Optional</span>
                      </label>

                      {question.image ? (
                        <div className="relative rounded-xl overflow-hidden border border-[#e1e4e0]" style={{ maxHeight: '220px' }}>
                          <img src={question.image} alt="question visual" className="w-full object-cover" style={{ maxHeight: '220px' }} />
                          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-all"
                            style={{ background: 'rgba(0,0,0,0.45)' }}>
                            <button onClick={() => fileInputRefs.current[question.id]?.click()}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold"
                              style={{ background: '#ffffff', color: '#172a1e' }}>
                              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                              Replace
                            </button>
                            <button onClick={() => removeQuestionImage(question.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold"
                              style={{ background: '#ffdad6', color: '#ba1a1a' }}>
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div onClick={() => fileInputRefs.current[question.id]?.click()}
                          className="flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all"
                          style={{ borderColor: '#c3c8c1', background: '#f4f4f0' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#172a1e'; e.currentTarget.style.background = '#efeeea'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#c3c8c1'; e.currentTarget.style.background = '#f4f4f0'; }}>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(23,42,30,0.08)' }}>
                            <span className="material-symbols-outlined text-[24px]" style={{ color: '#172a1e' }}>add_photo_alternate</span>
                          </div>
                          <div>
                            <p className="text-[14px] font-bold" style={{ color: '#1b1c1a' }}>Click to upload an image</p>
                            <p className="text-[12px] mt-0.5" style={{ color: '#737873' }}>
                              PNG, JPG · Max 5MB · Useful for visual identification questions
                            </p>
                          </div>
                        </div>
                      )}

                      <input type="file" accept="image/*" className="hidden"
                        ref={el => { fileInputRefs.current[question.id] = el; }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleQuestionImage(question.id, file);
                        }} />
                    </div>

                    {/* Answer Options */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#737873' }}>
                          Answer Options
                        </label>
                        <p className="text-[11px] font-medium flex items-center gap-1" style={{ color: '#737873' }}>
                          <span className="material-symbols-outlined text-[14px]">radio_button_checked</span>
                          Click the circle to mark the correct answer
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options.map((option, oIndex) => {
                          const color = OPTION_COLORS[oIndex];
                          return (
                            <div key={option.id} className="rounded-xl border-2 overflow-hidden transition-all"
                              style={{
                                borderColor: option.isCorrect ? '#172a1e' : color.border,
                                background: option.isCorrect ? '#d2e8d6' : color.bg,
                              }}>
                              <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                                <button onClick={() => setCorrectOption(question.id, option.id)}
                                  className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                                  style={{
                                    borderColor: option.isCorrect ? '#172a1e' : '#c3c8c1',
                                    background: option.isCorrect ? '#172a1e' : 'transparent',
                                  }}>
                                  {option.isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                                </button>
                                <span className="text-[13px] font-bold" style={{ color: option.isCorrect ? '#172a1e' : '#434843' }}>
                                  Option {OPTION_LABELS[oIndex]}
                                </span>
                                {option.isCorrect && (
                                  <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: '#172a1e', color: '#d2e8d6' }}>
                                    ✓ Correct
                                  </span>
                                )}
                              </div>
                              <div className="px-4 pb-3">
                                <input type="text" value={option.text}
                                  onChange={e => updateOptionText(question.id, option.id, e.target.value)}
                                  placeholder={`Write answer option ${OPTION_LABELS[oIndex]} here...`}
                                  className="w-full px-3 py-2.5 rounded-lg text-[14px] border outline-none transition-all"
                                  style={{
                                    borderColor: option.isCorrect ? 'rgba(23,42,30,0.3)' : 'rgba(0,0,0,0.1)',
                                    background: 'rgba(255,255,255,0.8)',
                                    color: '#1b1c1a',
                                  }}
                                  onFocus={e => { e.target.style.borderColor = '#172a1e'; e.target.style.boxShadow = '0 0 0 2px rgba(23,42,30,0.1)'; }}
                                  onBlur={e => { e.target.style.borderColor = option.isCorrect ? 'rgba(23,42,30,0.3)' : 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {!question.options.some(o => o.isCorrect) && (
                        <p className="mt-3 text-[12px] flex items-center gap-1.5" style={{ color: '#ba1a1a' }}>
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          Please click the circle on one option to mark it as the correct answer
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={addQuestion}
                className="w-full py-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
                style={{ borderColor: '#c3c8c1', color: '#737873' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#172a1e'; e.currentTarget.style.color = '#172a1e'; e.currentTarget.style.background = 'rgba(23,42,30,0.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#c3c8c1'; e.currentTarget.style.color = '#737873'; e.currentTarget.style.background = 'transparent'; }}>
                <span className="material-symbols-outlined text-[40px]">add_circle</span>
                <span className="text-[14px] font-medium">Click to add another question</span>
              </button>
            </div>
          </section>

          {/* Action Bar */}
          <div className="pt-8 border-t border-[#e1e4e0]/40 flex justify-end items-center gap-4">
            <button onClick={() => navigate('/employer/dashboard')}
              className="px-6 py-3 text-[14px] font-bold transition-all"
              style={{ color: '#705a49' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              Discard Changes
            </button>
            <button onClick={handlePublish}
              className="px-8 py-3 rounded-xl text-[15px] font-bold transition-all"
              style={{ background: '#172a1e', color: '#ffffff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
              onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
              Complete & Publish Quiz
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 py-8 px-8 bg-white border-t border-[#e1e4e0]/30">
          <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ color: '#172a1e' }}>cleaning_services</span>
              <span className="text-[16px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>CleanIQ</span>
            </div>
            <p className="text-[12px]" style={{ color: '#737873' }}>© 2025 CleanIQ. Purifying spaces, professionally.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Help Center'].map(link => (
                <a key={link} href="#" className="text-[12px] font-medium transition-colors" style={{ color: '#737873' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#172a1e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#737873'}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}