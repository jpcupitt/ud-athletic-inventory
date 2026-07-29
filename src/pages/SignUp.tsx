import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Step = 'email' | 'ud-sso' | 'external';

export default function SignUp() {
  const { login, setPage } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    if (email.toLowerCase().endsWith('@udel.edu')) {
      setStep('ud-sso');
    } else {
      setStep('external');
    }
  }

  function handleExternalSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError('');
    login('viewer');
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center relative px-6 py-8"
      style={{ backgroundImage: 'url(/delaware-stadium.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} />

      <div
        className="relative z-10 w-full max-w-sm rounded-2xl shadow-2xl p-6 sm:p-10"
        style={{ backgroundColor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src="/ud-athletics-logo-white.png" alt="UD Athletics" className="h-16 w-auto" />
        </div>

        {/* Step: email */}
        {step === 'email' && (
          <form onSubmit={handleEmailContinue} className="flex flex-col gap-4">
            <p className="text-white font-semibold text-center text-base -mt-2 mb-1">Create an Account</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-400 text-center -mt-1">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg font-semibold text-sm mt-2 transition-colors bg-[#00539F] hover:bg-[#003D75] text-white"
            >
              Continue
            </button>
          </form>
        )}

        {/* Step: UD SSO */}
        {step === 'ud-sso' && (
          <div className="flex flex-col items-center gap-5">
            <p className="text-white font-semibold text-center text-base -mt-2">University of Delaware Account</p>
            <p className="text-white/70 text-xs text-center leading-relaxed">
              We detected a <span className="text-white font-medium">@udel.edu</span> email address. You'll be signed in through the University of Delaware's secure login portal.
            </p>
            <div
              className="w-full rounded-lg px-4 py-3 text-center text-xs"
              style={{ backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
            >
              {email}
            </div>
            <button
              onClick={() => login('manager')}
              className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors bg-[#00539F] hover:bg-[#003D75] text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              Continue with University of Delaware
            </button>
            <button
              onClick={() => setStep('email')}
              className="text-xs underline"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Use a different email
            </button>
          </div>
        )}

        {/* Step: external sign-up */}
        {step === 'external' && (
          <form onSubmit={handleExternalSignUp} className="flex flex-col gap-4">
            <p className="text-white font-semibold text-center text-base -mt-2 mb-1">Create an Account</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wide">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
              />
            </div>
            {error && <p className="text-xs text-red-400 text-center -mt-1">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg font-semibold text-sm mt-1 transition-colors bg-[#00539F] hover:bg-[#003D75] text-white"
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-xs underline text-center"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Back to sign in */}
        <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Already have an account?{' '}
          <button
            className="underline font-medium"
            style={{ color: 'rgba(255,255,255,0.85)' }}
            onClick={() => setPage('login')}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
