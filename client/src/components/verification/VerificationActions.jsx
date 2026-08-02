import React from 'react';
import { HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2';

const VerificationActions = ({ verificationId, onAction }) => {
  return (
    <div className="flex gap-4">
      <button onClick={() => onAction('approve')} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-2 transition-colors"><HiOutlineCheck size={20}/> Approve</button>
      <button onClick={() => onAction('reject')} className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex items-center gap-2 transition-colors"><HiOutlineXMark size={20}/> Reject</button>
    </div>
  );
};
export default VerificationActions;
