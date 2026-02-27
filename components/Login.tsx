
import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  allowSignup: boolean;
  onSignupRequest: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, allowSignup, onSignupRequest }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Hardcoded Admin
      if (email === 'arshad2097@gmail.com' && password === 'anwar786') {
        onLogin({
          id: 'admin',
          email,
          role: 'ADMIN',
          status: 'APPROVED',
          createdAt: new Date().toISOString()
        });
        return;
      }

      // Check for approved users in local storage
      const users: User[] = JSON.parse(localStorage.getItem('as_users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (user) {
        if (user.status === 'APPROVED') {
          onLogin(user);
        } else if (user.status === 'PENDING') {
          setError('Your account is pending approval by Anwar Ali Sehar.');
        } else {
          setError('Access to this account has been denied.');
        }
      } else {
        setError('Invalid credentials or user does not exist.');
      }
    } else {
      if (!allowSignup) {
        setError('Signups are currently disabled by the administrator.');
        return;
      }
      onSignupRequest(email);
      setIsLogin(true);
      setError('Signup request sent! Please wait for admin approval.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl mb-6 flex items-center justify-center overflow-hidden shadow-xl">
               <img src="logo.png" alt="AS" className="w-full h-full object-cover" onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Anwar+Ali+Sehar&background=0F172A&color=fff&bold=true";
               }} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join the Platform'}
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-2 text-center">
              Anwar Ali Sehar Paper Composer AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-black flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold transition-all"
                placeholder="name@example.com"
              />
            </div>

            {isLogin && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-95 mt-4"
            >
              {isLogin ? 'Login Securely' : 'Request Access'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
            >
              {isLogin ? 'Don\'t have access? Sign up' : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
