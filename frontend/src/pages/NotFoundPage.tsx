import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#0e1422] border border-[#1e2a42] rounded-2xl p-8 shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
          <Compass size={32} />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold font-mono text-white">404</h1>
          <h2 className="text-base font-bold text-slate-200">Page Not Found</h2>
          <p className="text-xs text-slate-400">
            The requested research route or resource does not exist or has been relocated.
          </p>
        </div>
        <div>
          <NavLink
            to="/app"
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 inline-flex items-center space-x-2"
          >
            <ArrowLeft size={14} />
            <span>Return to Workspace</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
