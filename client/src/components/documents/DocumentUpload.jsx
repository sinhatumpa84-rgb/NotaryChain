import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineArrowUpTray, HiOutlineXMark } from 'react-icons/hi2';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';

const DocumentUpload = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('contract');

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    if (!title) setTitle(acceptedFiles[0].name.split('.')[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  const handleUpload = () => {
    if (!file) return toast.error('Please select a file');
    toast.success('Document uploaded successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><HiOutlineArrowUpTray className="text-indigo-400"/> Upload Document</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"><HiOutlineXMark size={24}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'}`}>
            <input {...getInputProps()} />
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 text-indigo-400">
              <HiOutlineDocumentText size={32} />
            </div>
            {file ? (
              <div>
                <p className="text-white font-medium text-lg">{file.name}</p>
                <p className="text-slate-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-white font-medium text-lg">Drag & drop your file here</p>
                <p className="text-slate-400 text-sm mt-1">Supports PDF, DOCX, JPG up to 50MB</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Document Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-800/50 text-white border-slate-700" placeholder="e.g. Q3 Financial Report" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                <option value="contract">Contract</option>
                <option value="identity">Identity Document</option>
                <option value="financial">Financial Record</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <Button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl">Cancel</Button>
          <Button onClick={handleUpload} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">Upload & Analyze</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentUpload;
