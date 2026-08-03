import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { IS_CONFIGURED } from '../../config/firebase';
import Button from '../common/Button';
import Input from '../common/Input';

/* ── Google "G" SVG icon ─────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
    <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
    <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
    <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
  </svg>
);

const LoginForm = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Google authenticated! Opening verification options.');
      navigate('/verify-identity');
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="w-full max-w-md p-8 rounded-3xl bg-slate-900/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-violet-400">
          Welcome to NotaryChain
        </h2>
        <p className="text-slate-400 mt-2 text-sm">Secure digital notarization platform</p>
      </div>

      {/* ── Google Auth Button ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <button
          type="button"
          id="google-signin-btn"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/10 group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : <GoogleIcon />}
          <span>{googleLoading ? 'Connecting Google…' : 'Continue with Google'}</span>
          {!IS_CONFIGURED && (
            <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.5">Setup required</span>
          )}
        </button>
      </motion.div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-400 uppercase tracking-wider">
          <span className="bg-slate-900/90 px-3">or sign in with email</span>
        </div>
      </div>

      {/* ── Email & Password Form ────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            icon={<HiOutlineEnvelope className="text-slate-400" />}
            type="email" placeholder="Email address"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-800/50 border-white/10 text-white rounded-xl focus:ring-indigo-500 text-sm"
          />
        </div>

        <div>
          <Input
            icon={<HiOutlineLockClosed className="text-slate-400" />}
            type="password" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-800/50 border-white/10 text-white rounded-xl focus:ring-indigo-500 text-sm"
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center text-slate-300 cursor-pointer">
            <input type="checkbox" className="mr-2 rounded bg-slate-800 border-white/20 text-indigo-500 focus:ring-indigo-500" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
        </div>

        <Button type="submit" isLoading={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm font-semibold">
          Sign In
        </Button>
      </form>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 text-center">
        <p className="text-slate-400 text-sm">
          Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign up</Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoginForm;
