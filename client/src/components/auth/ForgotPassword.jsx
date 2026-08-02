import React from 'react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
      <p className="text-slate-400 mb-6 text-sm">Enter your email address to get a reset link.</p>
      <form className="space-y-4">
        <input type="email" placeholder="Email Address" required className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition-colors font-medium">Send Reset Link</button>
      </form>
    </motion.div>
  );
};
export default ForgotPassword;
