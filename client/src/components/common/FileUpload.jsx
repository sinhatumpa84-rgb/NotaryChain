import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineCloudUpload, HiOutlineDocument, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ onUpload, maxSize = 50 * 1024 * 1024, acceptedTypes = { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }, multiple = false, className = '' }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => multiple ? [...prev, ...acceptedFiles] : acceptedFiles);
    if (onUpload) onUpload(multiple ? acceptedFiles : acceptedFiles[0]);
  }, [multiple, onUpload]);

  const removeFile = (e, idx) => {
    e.stopPropagation();
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedTypes,
    multiple
  });

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`
          relative p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ease-in-out
          ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 scale-[1.02]' : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
          ${isDragReject ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10' : ''}
          flex flex-col items-center justify-center text-center
        `}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 mb-4 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 flex items-center justify-center">
          <HiOutlineCloudUpload className="w-8 h-8" />
        </div>
        <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-1">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          or click to browse from your computer
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
          Supported: PDF, JPG, PNG (Max {maxSize / (1024 * 1024)}MB)
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
            {files.map((file, idx) => (
              <motion.div
                key={`${file.name}-${idx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded bg-primary-50 dark:bg-primary-900/30 text-primary-500 shrink-0">
                    <HiOutlineDocument className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => removeFile(e, idx)}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
