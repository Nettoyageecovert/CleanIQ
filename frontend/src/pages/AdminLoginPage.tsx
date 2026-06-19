import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await loginUser(form);
      if (data.user.role !== 'employer') {
        setError('This account is for employee access. Use the employee login page.');
        return;
      }
      login(data.user, data.token);
      navigate('/employer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(45,64,51,0.06)' }}>
          <div className="mb-2 transition-transform duration-500 hover:scale-105">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: '#172a1e' }}>
              <span className="material-symbols-outlined text-[28px]" style={{ color: '#ffffff' }}>shield_person</span>
            </div>
          </div>

          <div className="text-center mb-4">
            <h1 className="text-[26px] leading-8 font-semibold mb-1"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>
              Admin Login
            </h1>
            <p className="text-[14px] leading-5" style={{ color: '#434843' }}>
              Sign in to manage courses, quizzes, and employer tools.
            </p>
          </div>

          {error && (
            <div className="w-full mb-3 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
              style={{ background: '#ffdad6', color: '#93000a' }}>
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <form className="w-full space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-[13px] font-medium ml-1 block" htmlFor="email"
                style={{ color: '#434843' }}>
                Admin Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
                  style={{ color: '#c3c8c1' }}>mail</span>
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-[14px] transition-all duration-200"
                  style={{ background: '#ffffff', border: '1px solid #c3c8c1', color: '#1b1c1a', outline: 'none' }}
                  id="email" name="email" placeholder="admin@example.com" type="email"
                  value={form.email} onChange={handleChange}
                  onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#c3c8c1'; e.target.style.boxShadow = 'none'; }}
                  required />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[13px] font-medium block" htmlFor="password"
                  style={{ color: '#434843' }}>
                  Password
                </label>
                <span className="text-[12px] font-medium" style={{ color: '#737873' }}>
                  Employee accounts should use the employee login page.
                </span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
                  style={{ color: '#c3c8c1' }}>lock</span>
                <input
                  className="w-full pl-10 pr-10 py-3 rounded-lg text-[14px] transition-all duration-200"
                  style={{ background: '#ffffff', border: '1px solid #c3c8c1', color: '#1b1c1a', outline: 'none' }}
                  id="password" name="password" placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  onFocus={e => { e.target.style.borderColor = '#4f6355'; e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#c3c8c1'; e.target.style.boxShadow = 'none'; }}
                  required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#c3c8c1' }}
                  onClick={() => setShowPassword(v => !v)}>
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
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
                  <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Signing in...</>
                ) : (
                  <>Admin Sign In<span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t w-full text-center" style={{ borderColor: '#c3c8c1' }}>
            <p className="text-[14px]" style={{ color: '#434843' }}>
              Employee account?{' '}
              <Link to="/login" className="font-bold hover:underline" style={{ color: '#172a1e' }}>
                Go to employee login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}