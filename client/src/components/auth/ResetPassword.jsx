import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineKey } from 'react-icons/hi2';
import Input from '../common/Input';
import Button from '../common/Button';

const ResetPassword = () => {
  const { token } = useParams();
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiOutlineKey size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
        <p className="text-slate-400 mt-2">Enter your new password below</p>
      </div>

      <form className="space-y-4">
        <Input type="password" placeholder="New Password" required className="w-full bg-slate-800/50 border-white/10 text-white" />
        <Input type="password" placeholder="Confirm New Password" required className="w-full bg-slate-800/50 border-white/10 text-white" />
        
        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl mt-4">Reset Password</Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-slate-400">
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Back to Login</Link>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
