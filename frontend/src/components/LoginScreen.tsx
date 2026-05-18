
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { APP_TITLE } from '../constants';
import { forgotPassword, resetPassword } from '../services/authApi';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  users: User[];
}

const pipeline = [
  {
    label: 'Source',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'AI Match',
    color: '#818CF8',
    bg: 'rgba(129,140,248,0.12)',
    pulse: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    label: 'Interview',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.12)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    label: 'Offer',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.12)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: 'Hired',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.12)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const features = [
  {
    title: 'Gemini AI Integration',
    desc: 'Resume analysis, candidate matching and debrief synthesis',
  },
  {
    title: 'End-to-End Funnel',
    desc: 'Requisition to signed offer in one unified workspace',
  },
  {
    title: 'Role-Based Access',
    desc: 'Tailored views for Recruiters, HMs, Sourcers and Admins',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stepVariants = {
  enter: { opacity: 0, x: 16 },
  center: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const FieldInput: React.FC<FieldInputProps> = ({ leftIcon, rightElement, className = '', ...props }) => (
  <div className="relative">
    {leftIcon && (
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
        {leftIcon}
      </div>
    )}
    <input
      className={`w-full ${leftIcon ? 'pl-9' : 'pl-3'} ${rightElement ? 'pr-10' : 'pr-3'} py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all ${className}`}
      {...props}
    />
    {rightElement && (
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        {rightElement}
      </div>
    )}
  </div>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users: _users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    if (!success) setError('Invalid credentials or unauthorised email. Contact your administrator.');
    setIsSubmitting(false);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');
    try {
      const response = await forgotPassword(email);
      setInfoMessage(response.message + ' Check your inbox for the reset token.');
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
    if (!resetToken.trim()) { setError('Reset token is required.'); setIsSubmitting(false); return; }
    if (newPassword.trim().length < 6) { setError('Password must be at least 6 characters.'); setIsSubmitting(false); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); setIsSubmitting(false); return; }
    try {
      await resetPassword(resetToken, newPassword);
      setInfoMessage('Password updated. You can now sign in.');
      setPassword(''); setResetToken(''); setNewPassword(''); setConfirmPassword('');
      setResetStep('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToLogin = () => { setError(''); setInfoMessage(''); setResetStep('login'); };

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ───────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[56%] relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(155deg, #0B1628 0%, #0D1C38 55%, #091322 100%)' }}
      >
        {/* Ambient glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-[560px] h-[560px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 68%)', top: '-12%', left: '-8%' }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 68%)', bottom: '8%', right: '-6%' }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
          />
          <motion.div
            className="absolute w-[280px] h-[280px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', top: '42%', left: '28%' }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          />
        </div>

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <svg className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg font-display tracking-tight">Joveo</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col justify-center max-w-[420px]"
          >
            <motion.div variants={itemVariants} className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Powered by Gemini AI
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-[2.6rem] xl:text-5xl font-bold text-white leading-[1.15] font-display mb-4"
            >
              Hire smarter,<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #60A5FA 0%, #818CF8 100%)' }}
              >
                not harder.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-slate-400 text-[0.9rem] leading-relaxed mb-10">
              The unified AI hiring platform for the entire talent acquisition lifecycle — sourcing to signed offer.
            </motion.p>

            {/* Animated pipeline */}
            <motion.div variants={itemVariants} className="mb-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-4">
                Hiring Pipeline
              </p>
              <div className="flex items-center">
                {pipeline.map((stage, i) => (
                  <React.Fragment key={stage.label}>
                    <motion.div
                      className="flex flex-col items-center gap-2"
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.55 + i * 0.11, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                        style={{ background: stage.bg, border: `1px solid ${stage.color}28` }}
                        animate={stage.pulse ? {
                          boxShadow: [`0 0 0 0px ${stage.color}45`, `0 0 0 7px ${stage.color}00`],
                        } : {}}
                        transition={stage.pulse ? { duration: 2, repeat: Infinity, ease: 'easeOut' } : {}}
                      >
                        <span style={{ color: stage.color }}>{stage.icon}</span>
                      </motion.div>
                      <span className="text-[10px] font-semibold" style={{ color: stage.color }}>
                        {stage.label}
                      </span>
                    </motion.div>

                    {i < pipeline.length - 1 && (
                      <motion.div
                        className="flex-1 mx-1 mb-5"
                        style={{ height: '1px', background: `linear-gradient(90deg, ${pipeline[i].color}35, ${pipeline[i + 1].color}35)` }}
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.65 + i * 0.11, duration: 0.35 }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map((f) => (
                <motion.div key={f.title} variants={itemVariants} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-200">{f.title}</p>
                    <p className="text-[12px] text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="text-slate-600 text-[11px]"
          >
            © {new Date().getFullYear()} Joveo. Internal use only.
          </motion.p>
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#F5F8FF] p-6">
        <motion.div
          className="w-full max-w-[360px]"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* App icon + title */}
          <div className="text-center mb-7">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center justify-center w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-white border border-slate-200 shadow-sm mb-4"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </motion.div>
            <h1 className="text-xl font-bold text-slate-900 font-display tracking-tight">{APP_TITLE}</h1>
            <p className="text-xs text-slate-500 mt-1">Internal Talent Management Portal</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <AnimatePresence mode="wait">

              {/* ── Login step ── */}
              {resetStep === 'login' && (
                <motion.form
                  key="login"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  onSubmit={handleSubmit}
                  className="p-7 space-y-5"
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display">Welcome back</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sign in with your{' '}
                      <span className="text-blue-600 font-semibold">@joveo.com</span> account
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Email address
                      </label>
                      <FieldInput
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@joveo.com"
                        leftIcon={
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Password
                      </label>
                      <FieldInput
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        leftIcon={
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        }
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        }
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-lg"
                      >
                        <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                        <p className="text-[12px] text-red-700 font-medium leading-tight">{error}</p>
                      </motion.div>
                    )}
                    {infoMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg"
                      >
                        <p className="text-[12px] text-emerald-700 font-medium">{infoMessage}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={!email || !password || isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.span
                          className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                        />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign in
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </motion.button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setError(''); setInfoMessage(''); setResetStep('request'); }}
                      className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </motion.form>
              )}

              {/* ── Request reset step ── */}
              {resetStep === 'request' && (
                <motion.form
                  key="request"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  onSubmit={handleRequestReset}
                  className="p-7 space-y-5"
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display">Reset password</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Enter your email to receive a reset token</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Email address
                    </label>
                    <FieldInput
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@joveo.com"
                      leftIcon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      }
                    />
                  </div>

                  {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={goToLogin}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <motion.button
                      type="submit"
                      disabled={!email || isSubmitting}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? 'Sending…' : 'Send token'}
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* ── Set new password step ── */}
              {resetStep === 'reset' && (
                <motion.form
                  key="reset"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  onSubmit={handleResetPassword}
                  className="p-7 space-y-4"
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display">Set new password</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Paste the token from your email</p>
                  </div>

                  {infoMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <p className="text-[12px] text-emerald-700 font-medium">{infoMessage}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Reset token
                      </label>
                      <FieldInput
                        type="text"
                        required
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Paste token from email"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        New password
                      </label>
                      <FieldInput
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Confirm password
                      </label>
                      <FieldInput
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={goToLogin}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? 'Updating…' : 'Update password'}
                    </motion.button>
                  </div>
                </motion.form>
              )}

            </AnimatePresence>
          </div>

          <p className="text-center text-slate-400 text-[11px] mt-6">
            © {new Date().getFullYear()} {APP_TITLE}. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginScreen;
