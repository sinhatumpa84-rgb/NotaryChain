import React, { useState } from 'react';
import { HiOutlineUserPlus, HiOutlineXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const DocumentShare = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><HiOutlineUserPlus/> Share Document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><HiOutlineXMark size={24}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500" />
            <button onClick={() => {toast.success('Invitation sent!'); setEmail('');}} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">Invite</button>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-400 mb-3">People with access</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">J</div>
                  <div><p className="text-white text-sm">Jane Doe (You)</p></div>
                </div>
                <span className="text-xs text-slate-500">Owner</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">L</div>
                  <div><p className="text-white text-sm">Legal Team</p></div>
                </div>
                <span className="text-xs text-slate-500 cursor-pointer hover:text-rose-400">Remove</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DocumentShare;
