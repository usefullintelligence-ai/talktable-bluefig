
import React, { useState } from 'react';
import { STAFF_PASSWORD } from './constants';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === STAFF_PASSWORD) {
      localStorage.setItem('alreem_auth', 'true'); // Keeping key for compatibility, updating style
      window.location.hash = '/waiter';
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200">
            BF
          </div>
          <h1 className="font-playfair text-3xl font-bold text-slate-900 mb-2">Staff Access</h1>
          <p className="text-slate-500 text-sm">Blue Fig Internal Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input 
              type="password"
              placeholder="Enter Security Code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`
                w-full px-6 py-4 rounded-2xl bg-slate-50 border transition-all outline-none font-bold text-center tracking-widest
                ${error ? 'border-red-500 animate-shake' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50'}
              `}
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            Access Dashboard
          </button>
        </form>

        <button 
          onClick={() => window.location.hash = '/'}
          className="w-full mt-6 text-sm font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors"
        >
          Return to Guest View
        </button>
      </div>
    </div>
  );
};

export default Login;
