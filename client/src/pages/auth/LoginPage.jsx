import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Sparkles, Shield, UserCheck, Code, LogIn, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      success('Welcome back to TalentPulse!');
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    try {
      setLoading(true);
      setEmail(demoEmail);
      setPassword('password123');
      await login(demoEmail, 'password123');
      success(`Logged in as demo user (${demoEmail})`);
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Talent<span className="text-indigo-400">Pulse</span> AI
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            AI-Enabled Recruitment & Candidate Tracking Platform (ATS)
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full shadow-indigo-600/30 font-semibold"
              icon={LogIn}
            >
              Sign In to ATS
            </Button>
          </form>

          {/* Quick 1-Click Role Switchers */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
              Quick 1-Click Role Demo Sign-In
            </p>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@talentpulse.ai')}
              className="w-full p-2.5 rounded-xl bg-purple-950/30 hover:bg-purple-950/60 border border-purple-800/50 hover:border-purple-600 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-xs font-bold text-purple-200">HR Administrator</p>
                  <p className="text-[10px] text-purple-400/80">admin@talentpulse.ai</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('recruiter@talentpulse.ai')}
              className="w-full p-2.5 rounded-xl bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-800/50 hover:border-indigo-600 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-indigo-200">Lead Recruiter</p>
                  <p className="text-[10px] text-indigo-400/80">recruiter@talentpulse.ai</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('interviewer@talentpulse.ai')}
              className="w-full p-2.5 rounded-xl bg-blue-950/30 hover:bg-blue-950/60 border border-blue-800/50 hover:border-blue-600 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Code className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs font-bold text-blue-200">Technical Interviewer</p>
                  <p className="text-[10px] text-blue-400/80">interviewer@talentpulse.ai</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
