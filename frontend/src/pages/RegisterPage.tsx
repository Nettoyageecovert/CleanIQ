import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});  useEffect(() => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});
    try {
      const data = await registerUser(form);
      login(data.user, data.token);
      navigate(data.user.role === 'employer' ? '/employer/dashboard' : '/employee/dashboard');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errors: Record<string, string> = {};
        err.response.data.errors.forEach((e: { path: string; msg: string }) => {
          errors[e.path] = e.msg;
        });
        setFieldErrors(errors);
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen flex items-start justify-center pt-4 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f4f4f0 0%, #e9e8e4 100%)' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />      <div className="absolute bottom-10 right-10 opacity-10 rotate-12 select-none pointer-events-none">
        <span className="material-symbols-outlined text-[180px]" style={{ color: '#172a1e' }}>psychology_alt</span>
      </div>

      <div className="w-full max-w-[480px] z-10">
        <div ref={cardRef} className="rounded-xl p-6 flex flex-col items-center"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(45,64,51,0.06)' }}>          <div className="mb-2 transition-transform duration-500 hover:scale-105">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: '#172a1e' }}>
              <span className="material-symbols-outlined text-[28px]" style={{ color: '#ffffff' }}>cleaning_services</span>
            </div>
          </div>          <div className="text-center mb-2">
            <h1 className="text-[32px] leading-10 font-semibold mb-1"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
              Join CleanIQ
            </h1>
            <p className="text-[16px] leading-6 max-w-[320px]" style={{ color: '#434843' }}>
              Create your account to start your training journey.
            </p>
          </div>          {error && (
            <div className="w-full mb-2 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
              style={{ background: '#ffdad6', color: '#93000a' }}>
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}          <form className="w-full space-y-3" onSubmit={handleSubmit}>            <div className="space-y-1">
              <label className="text-[14px] font-medium ml-1 block" htmlFor="fullName" style={{ color: '#434843' }}>Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px]" style={{ color: '#c3c8c1' }}>person</span>
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-[14px] transition-all duration-200"
                  style={{ background: '#ffffff', border: `1px solid ${fieldErrors.fullName ? '#ba1a1a' : '#c3c8c1'}`, color: '#1b1c1a', outline: 'none' }}
                  id="fullName" name="fullName" placeholder="Enter your full name" type="text"
                  value={form.fullName} onChange={handleChange}
                  onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = fieldErrors.fullName ? '#ba1a1a' : '#c3c8c1'; e.target.style.boxShadow = 'none'; }}
                  required />
              </div>
              {fieldErrors.fullName && <p className="text-[12px] px-1" style={{ color: '#ba1a1a' }}>{fieldErrors.fullName}</p>}
            </div>            <div className="space-y-1">
              <label className="text-[14px] font-medium ml-1 block" htmlFor="email" style={{ color: '#434843' }}>Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px]" style={{ color: '#c3c8c1' }}>mail</span>
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-[16px] transition-all duration-200"
                  style={{ background: '#ffffff', border: `1px solid ${fieldErrors.email ? '#ba1a1a' : '#c3c8c1'}`, color: '#1b1c1a', outline: 'none' }}
                  id="email" name="email" placeholder="name@example.com" type="email"
                  value={form.email} onChange={handleChange}
                  onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = fieldErrors.email ? '#ba1a1a' : '#c3c8c1'; e.target.style.boxShadow = 'none'; }}
                  required />
              </div>
              {fieldErrors.email && <p className="text-[12px] px-1" style={{ color: '#ba1a1a' }}>{fieldErrors.email}</p>}
            </div>            <div className="space-y-1">
              <label className="text-[14px] font-medium ml-1 block" htmlFor="password" style={{ color: '#434843' }}>Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px]" style={{ color: '#c3c8c1' }}>lock</span>
                <input
                  className="w-full pl-12 pr-12 py-4 rounded-lg text-[16px] transition-all duration-200"
                  style={{ background: '#ffffff', border: `1px solid ${fieldErrors.password ? '#ba1a1a' : '#c3c8c1'}`, color: '#1b1c1a', outline: 'none' }}
                  id="password" name="password" placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = fieldErrors.password ? '#ba1a1a' : '#c3c8c1'; e.target.style.boxShadow = 'none'; }}
                  required />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#c3c8c1' }}
                  onClick={() => setShowPassword(v => !v)}>
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {fieldErrors.password
                ? <p className="text-[12px] px-1" style={{ color: '#ba1a1a' }}>{fieldErrors.password}</p>
                : <p className="text-[11px] px-1 mt-1" style={{ color: '#737873' }}>Must be at least 8 characters with letters and numbers.</p>}
            </div>            <div className="pt-3">
              <button
                className="w-full py-4 rounded-lg text-[18px] font-semibold flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
                style={{ fontFamily: 'Manrope, sans-serif', background: '#172a1e', color: '#ffffff' }}
                type="submit" disabled={isLoading}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#2d4033'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#172a1e'; }}>
                {isLoading ? (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>Creating account...</>
                ) : (
                  <>Create Account<span className="material-symbols-outlined text-[20px]">arrow_forward</span></>
                )}
              </button>
            </div>
          </form>          <div className="mt-4 pt-4 border-t w-full text-center" style={{ borderColor: '#c3c8c1' }}>
            <p className="text-[16px]" style={{ color: '#434843' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold hover:underline" style={{ color: '#172a1e' }}>Login here</Link>
            </p>
          </div>
        </div>        <footer className="mt-6 text-center">
          <p className="mt-3 text-[12px]" style={{ color: '#c3c8c1' }}>© 2026 CleanIQ. Purifying spaces, professionally.</p>
        </footer>
      </div>
    </main>
  );
}