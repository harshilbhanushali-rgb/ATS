
import React, { useState } from 'react';
import { User } from '../types';
import Card from './Card';
import { APP_TITLE } from '../constants';
import { forgotPassword, resetPassword } from '../services/authApi';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  users: User[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users: _users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'login' | 'request' | 'reset'>('login');
  const [infoMessage, setInfoMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const success = await onLogin(email, password);
    if (!success) {
      setError('This email is not authorized. Please contact an administrator.');
    }
    setIsSubmitting(false);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');
    try {
      const response = await forgotPassword(email);
      setInfoMessage(response.message + ' Please check your inbox for the reset token.');
      setResetStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    if (!resetToken.trim()) {
      setError('Reset token is required.');
      setIsSubmitting(false);
      return;
    }
    if (newPassword.trim().length < 6) {
      setError('New password must be at least 6 characters.');
      setIsSubmitting(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      await resetPassword(resetToken, newPassword);
      setInfoMessage('Password updated. You can now sign in with your new password.');
      setPassword('');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setResetStep('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-soft border border-slate-100 mb-6 animate-in zoom-in duration-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-10 h-10 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight font-display">{APP_TITLE}</h1>
            <p className="text-slate-500 mt-3 font-medium">Internal Talent Management Portal</p>
        </div>
        <Card className="!p-8">
            {resetStep === 'login' && (
              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900 font-display">Welcome Back</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Sign in with your <span className="text-indigo-600 font-bold">@joveo.com</span> email address
                    </p>
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Email Address
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner-soft placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                            placeholder="your.name@example.com"
                        />
                    </div>
                </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner-soft placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                        placeholder="Your password"
                      />
                    </div>

                {error && (
                    <div className="flex items-center p-4 bg-red-50 rounded-2xl border border-red-100 animate-in shake duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500 mr-3 shrink-0">
                          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-red-700 font-medium leading-tight">{error}</p>
                    </div>
                )}

                {infoMessage && (
                  <div className="flex items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-medium leading-tight">{infoMessage}</p>
                  </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={!email || !password || isSubmitting}
                        className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 ml-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </div>
                <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setInfoMessage('');
                        setResetStep('request');
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Forgot password?
                    </button>
                </div>
              </form>
            )}

            {resetStep === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900 font-display">Reset Password</h2>
                  <p className="text-sm text-slate-500 mt-1">Enter your email to generate a reset token.</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner-soft placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                    placeholder="your.name@example.com"
                  />
                </div>
                {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setResetStep('login')} className="w-1/2 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold">Back</button>
                  <button type="submit" disabled={!email || isSubmitting} className="w-1/2 py-3 rounded-2xl bg-indigo-600 text-white font-semibold disabled:opacity-60">{isSubmitting ? 'Sending...' : 'Send Token'}</button>
                </div>
              </form>
            )}

            {resetStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900 font-display">Set New Password</h2>
                  <p className="text-sm text-slate-500 mt-1">Use the reset token to set a new password.</p>
                </div>
                {infoMessage && <p className="text-xs text-emerald-700 font-medium">{infoMessage}</p>}
                <div className="space-y-2">
                  <label htmlFor="reset-token" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reset Token</label>
                  <input
                    id="reset-token"
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner-soft focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner-soft focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner-soft focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setResetStep('login')} className="w-1/2 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="w-1/2 py-3 rounded-2xl bg-indigo-600 text-white font-semibold disabled:opacity-60">{isSubmitting ? 'Updating...' : 'Update Password'}</button>
                </div>
              </form>
            )}
        </Card>
        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
            © {new Date().getFullYear()} {APP_TITLE}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
