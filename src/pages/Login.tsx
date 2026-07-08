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
    <div className="min-h-screen flex items-center justify-center relative" style={{ backgroundImage: 'url(/delaware-stadium.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl shadow-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)', padding: '2.5rem' }}>
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src="/Delaware-Blue-Hens-logo.png" alt="Delaware Blue Hens" className="h-28 w-auto" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/80 uppercase tracking-wide">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder=""
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/80 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center -mt-1">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg font-semibold text-sm transition-colors mt-1 mb-1"
            style={{ backgroundColor: '#00539F', color: '#fff' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#003D75')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00539F')}
          >
            Sign In
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-xs" style={{ marginTop: '0.3in', marginBottom: '0.15in', color: 'rgba(255,255,255,0.6)' }}>
          Don't have an account?{' '}
          <button className="underline font-medium" style={{ color: 'rgba(255,255,255,0.9)' }} onClick={() => setPage('signup')}>
            Click here to sign up
          </button>
        </p>

        {/* Demo fallback */}
        <button
          onClick={() => login('viewer')}
          className="w-full text-center text-xs mt-4 transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          Sign in as viewer (read-only demo)
        </button>
      </div>
    </div>
  );
}
