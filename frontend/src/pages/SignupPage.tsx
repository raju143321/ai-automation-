import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide all required fields.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signup(email, password, displayName);
      navigate('/app');
    } catch (err) {
      setError((err as Error).message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0e1422] border border-[#1e2a42] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <NavLink to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center font-extrabold text-white shadow-lg shadow-cyan-500/20">
              <Sparkles size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">ResearchSphere</span>
          </NavLink>
          <h2 className="text-lg font-bold text-white pt-2">Create Research Account</h2>
          <p className="text-xs text-slate-400">Join researchers worldwide in reproducible, grounded discovery.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Full Name / Academic Title
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Dr. Jane Doe"
                className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@lab.org"
                required
                className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50"
          >
            <span>{isLoading ? 'Creating Account...' : 'Get Started'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-4 border-t border-[#1b253b] text-center text-xs text-slate-400">
          Already have an account?{' '}
          <NavLink to="/login" className="text-cyan-400 font-semibold hover:underline">
            Sign In
          </NavLink>
        </div>
      </div>
    </div>
  );
};
