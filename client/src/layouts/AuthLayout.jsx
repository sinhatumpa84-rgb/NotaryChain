import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AuthLayout = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Left side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden items-center justify-center flex-col text-white p-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/30"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-lg"
        >
          <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-2xl">
            <span className="text-4xl font-bold font-display">N</span>
          </div>
          <h1 className="text-5xl font-display font-bold mb-6">NotaryChain</h1>
          <p className="text-lg text-primary-100 leading-relaxed">
            Enterprise-grade digital notarization platform secured by blockchain. Verified, immutable, and globally trusted.
          </p>
        </motion.div>

        {/* Floating elements animation */}
        <motion.div 
          animate={{ y: [0, -20, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent-500/20 rounded-full blur-2xl"
        />
      </div>

      {/* Right side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthLayout;
