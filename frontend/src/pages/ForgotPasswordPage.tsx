import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSent(true);
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
          <h2 className="text-lg font-bold text-white pt-2">Password Recovery</h2>
          <p className="text-xs text-slate-400">Enter your email address to receive password reset instructions.</p>
        </div>

        {sent ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-2">
            <CheckCircle2 size={24} className="mx-auto text-emerald-400" />
            <div className="font-semibold">Reset Instructions Dispatched</div>
            <p className="text-[11px] text-slate-300">
              If an account is associated with {email}, you will receive a secure token to reset your password.
            </p>
            <NavLink to="/login" className="inline-block pt-2 text-cyan-400 font-bold hover:underline">
              Return to Login
            </NavLink>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>Send Recovery Link</span>
              <ArrowRight size={14} />
            </button>

            <div className="text-center pt-2">
              <NavLink to="/login" className="text-slate-400 hover:text-white text-xs">
                Back to Sign In
              </NavLink>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
