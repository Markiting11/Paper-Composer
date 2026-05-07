
import React, { useState } from 'react';
import { User } from '../types';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { getUserProfile, createUserProfile } from '../services/userService';

interface LoginProps {
  onLogin: (user: User) => void;
  allowSignup: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, allowSignup }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      if (!fbUser.email) {
        throw new Error("No email associated with this Google account.");
      }

      let profile = await getUserProfile(fbUser.uid);
      
      if (!profile) {
        if (!allowSignup) {
          await auth.signOut();
          setError('Signups are currently disabled by the administrator.');
          setLoading(false);
          return;
        }
        // Create pending profile
        await createUserProfile(fbUser.uid, fbUser.email);
        profile = await getUserProfile(fbUser.uid);
      }

      if (profile) {
        if (profile.status === 'APPROVED') {
          onLogin(profile);
        } else if (profile.status === 'PENDING') {
          setError('Your account is pending approval by Anwar Ali Sehar.');
          await auth.signOut();
        } else {
          setError('Access to this account has been denied.');
          await auth.signOut();
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
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
              Paper Composer AI
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-2 text-center px-4">
              A professional tool by Anwar Ali Sehar for transforming handwritten notes into digital papers.
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-black flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 py-4 rounded-2xl font-black text-sm text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
              {loading ? 'Processing...' : 'Continue with Google'}
            </button>

            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-6">
              Access is restricted. New accounts will require manual approval from the administrator.
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Powered by Google Gemini 2.0
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
