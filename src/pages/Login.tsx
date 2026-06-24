import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#1e2a3a] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-[#0057a8] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">EQ</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">EQI</h1>
        <p className="text-sm text-gray-500 mb-8">University of Delaware Equipment Inventory</p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-[#0057a8] hover:bg-[#004a90] text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          Sign in with Microsoft
        </button>

        <p className="text-xs text-gray-400 mt-6">
          Use your University of Delaware Microsoft account
        </p>
      </div>
    </div>
  );
}
