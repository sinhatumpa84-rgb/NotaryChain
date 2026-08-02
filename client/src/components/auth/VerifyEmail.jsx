import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setStatus('success'), 1500);
    setTimeout(() => { if (status === 'success') navigate('/login'); }, 3500);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md p-8 text-center bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Verifying your email...</h2>
        </div>
      )}
      {status === 'success' && (
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
          <HiOutlineCheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
          <p className="text-slate-400 mt-2">Redirecting to login...</p>
        </motion.div>
      )}
      {status === 'error' && (
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
          <HiOutlineXCircle className="w-20 h-20 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
          <p className="text-slate-400 mt-2">The link is invalid or expired.</p>
        </motion.div>
      )}
    </motion.div>
  );
};
export default VerifyEmail;
