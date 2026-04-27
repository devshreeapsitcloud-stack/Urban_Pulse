import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button, Card } from '../components/ui';
import { UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.signUp(email, password, name);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl shadow-gray-200/50">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <UserPlus className="text-white h-6 w-6" />
          </div>
          <h2 className="text-3xl font-display font-bold">Create Account</h2>
          <p className="text-gray-500">Join Urban Pulse today</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50/50"
                placeholder="John Doe"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50/50"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50/50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account? {' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
