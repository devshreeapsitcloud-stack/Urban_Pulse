import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button, Card } from '../components/ui';
import { LogIn, Mail, Lock, Chrome } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.signIn(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-50">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-20 w-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 text-white font-black italic text-3xl">
            UP
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Urban Pulse</h2>
          <p className="text-slate-400 font-medium">Igniting your urban journey.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-100 text-center">{error}</div>}

        <div className="space-y-4">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full py-8 bg-slate-900 hover:bg-slate-800 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 transition-all active:scale-95"
          >
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">G</div>
            Continue with Google
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <button className="py-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white transition-all shadow-sm">Apple ID</button>
            <button className="py-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white transition-all shadow-sm">Facebook</button>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative bg-white px-4 text-[9px] text-slate-300 uppercase font-black tracking-widest">Or driver email</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-blue-500/20 focus:outline-none transition-all font-black text-slate-800 placeholder:text-slate-200"
                placeholder="DRIVER EMAIL"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-blue-500/20 focus:outline-none transition-all font-black text-slate-800 placeholder:text-slate-200"
                placeholder="ACCESS KEY"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full py-8 mt-4 rounded-3xl bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-500/20 font-black uppercase tracking-widest text-sm">
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-10 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
          New profile? {' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
