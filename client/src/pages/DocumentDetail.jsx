import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DocumentDetails from '../components/documents/DocumentDetails';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';

const DocumentDetail = () => {
  return (
    <DashboardLayout 
      title="Document Details" 
      actions={<Link to="/documents" className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 flex items-center gap-2"><HiOutlineArrowLeft/> Back</Link>}
    >
      <DocumentDetails />
    </DashboardLayout>
  );
};
export default DocumentDetail;
