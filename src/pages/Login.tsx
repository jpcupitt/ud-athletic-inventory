import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, setPage } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === 'gohens' && password === 'delaware') {
      setError('');
      login('manager');
    } else {
      setError('Incorrect username or password.');
    }
  }

  return (
    <div className="white-blue-bg min-h-dvh flex items-center justify-center relative px-6 py-8">
      <div className="white-vignette" />
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="login-bg-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </svg>
      <div className="absolute inset-0 pointer-events-none" style={{ filter: 'url(#login-bg-noise)', opacity: 0.12, mixBlendMode: 'multiply' }} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl shadow-2xl p-6 sm:p-10" style={{ backgroundColor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)' }}>
        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          <img src={`${import.meta.env.BASE_URL}ud-athletics-logo-navy-text.png`} alt="Blue Hen Athletic Systems" className="h-72 w-auto" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder=""
              className="w-full px-4 py-2.5 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00539F]/40"
              style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.12)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              className="w-full px-4 py-2.5 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00539F]/40"
              style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.12)' }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 text-center -mt-1">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg font-semibold text-sm transition-colors mt-1 mb-1 bg-[#00539F] hover:bg-[#003D75] text-white"
          >
            Sign In
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-xs" style={{ marginTop: '0.3in', marginBottom: '0.15in', color: 'rgba(0,0,0,0.55)' }}>
          Don't have an account?{' '}
          <button className="underline font-medium" style={{ color: '#00539F' }} onClick={() => setPage('signup')}>
            Click here to sign up
          </button>
        </p>

        {/* Demo helpers */}
        <button
          type="button"
          onClick={() => { setUsername('gohens'); setPassword('delaware'); setError(''); }}
          className="w-full text-center text-xs transition-colors text-gray-500 hover:text-gray-700"
        >
          Demo account: <span className="font-mono font-medium">gohens / delaware</span> — tap to fill
        </button>
        <button
          onClick={() => login('student_manager')}
          className="w-full text-center text-xs mt-3 transition-colors text-gray-400 hover:text-gray-600"
        >
          Sign in as student manager (demo)
        </button>
        <button
          onClick={() => login('viewer')}
          className="w-full text-center text-xs mt-1 transition-colors text-gray-400 hover:text-gray-600"
        >
          Sign in as viewer (read-only demo)
        </button>
      </div>
    </div>
  );
}
