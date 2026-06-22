import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    const timer = setTimeout(() => {
      card.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await new Promise(res => setTimeout(res, 1000));
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen flex items-start justify-center pt-4 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f4f4f0 0%, #e9e8e4 100%)' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <div className="w-full max-w-[440px] z-10">
        <div ref={cardRef} className="rounded-xl p-6 flex flex-col items-center"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(45,64,51,0.06)' }}>          <div className="mb-2 transition-transform duration-500 hover:scale-105">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: '#d2e8d6' }}>
              <span className="material-symbols-outlined text-[28px]" style={{ color: '#172a1e' }}>lock_reset</span>
            </div>
          </div>          <div className="text-center mb-4">
            <h1 className="text-[26px] leading-8 font-semibold mb-1"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
              Reset Password
            </h1>
            <p className="text-[14px] leading-5" style={{ color: '#434843' }}>
              Enter your email to receive a password reset link.
            </p>
          </div>          {submitted ? (
            <div className="w-full">
              <div className="w-full mb-4 px-4 py-4 rounded-lg flex flex-col items-center gap-2 text-center"
                style={{ background: '#d2e8d6', color: '#172a1e' }}>
                <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
                <p className="text-[14px] font-semibold">Reset link sent!</p>
                <p className="text-[13px]" style={{ color: '#434843' }}>
                  Check your inbox at <strong>{email}</strong> and follow the instructions.
                </p>
              </div>
              <Link to="/login"
                className="w-full py-3 rounded-lg text-[16px] font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                style={{ background: '#172a1e', color: '#ffffff', fontFamily: 'Manrope, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#2d4033')}
                onMouseLeave={e => (e.currentTarget.style.background = '#172a1e')}>
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Login
              </Link>
            </div>
          ) : (
            <>              {error && (
                <div className="w-full mb-3 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                  style={{ background: '#ffdad6', color: '#93000a' }}>
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </div>
              )}              <form className="w-full space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-[13px] font-medium ml-1 block" htmlFor="email"
                    style={{ color: '#434843' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
                      style={{ color: '#c3c8c1' }}>mail</span>
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-[14px] transition-all duration-200"
                      style={{ background: '#ffffff', border: '1px solid #c3c8c1', color: '#1b1c1a', outline: 'none' }}
                      id="email" name="email" placeholder="name@example.com" type="email"
                      value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                      onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#c3c8c1'; e.target.style.boxShadow = 'none'; }}
                      required />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    className="w-full py-3 rounded-lg text-[16px] font-semibold flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
                    style={{ fontFamily: 'Manrope, sans-serif', background: '#172a1e', color: '#ffffff' }}
                    type="submit" disabled={isLoading}
                    onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#2d4033'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#172a1e'; }}>
                    {isLoading ? (
                      <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Sending...</>
                    ) : (
                      <>Send Reset Link<span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4 pt-4 border-t w-full text-center" style={{ borderColor: '#c3c8c1' }}>
                <Link to="/login"
                  className="inline-flex items-center gap-1 text-[14px] font-medium hover:underline transition-all"
                  style={{ color: '#172a1e' }}>
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        <footer className="mt-3 text-center">
          <div className="flex justify-center gap-6 uppercase tracking-wider text-[11px]" style={{ color: '#737873' }}>
            <a className="hover:text-[#172a1e] transition-colors" href="#">Privacy Policy</a>
            <span className="w-1 h-1 rounded-full self-center" style={{ background: '#c3c8c1' }} />
            <a className="hover:text-[#172a1e] transition-colors" href="#">Terms of Service</a>
          </div>
          <p className="mt-1 text-[11px]" style={{ color: '#c3c8c1' }}>© 2025 CleanIQ. Purifying spaces, professionally.</p>
        </footer>
      </div>
    </main>
  );
}