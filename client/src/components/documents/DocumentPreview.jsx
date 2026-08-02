import React from 'react';
import { motion } from 'framer-motion';

const DocumentPreview = ({ document }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-[600px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 overflow-hidden relative">
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <span className="text-9xl tracking-widest font-bold rotate-[-45deg]">PREVIEW</span>
      </div>
      <div className="z-10 text-center">
        <p className="text-xl text-white mb-2">{document?.name || 'Document.pdf'}</p>
        <p className="text-sm">{(document?.size || 2.4)} MB • PDF Document</p>
      </div>
    </motion.div>
  );
};

export default DocumentPreview;
