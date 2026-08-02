import React, { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DocumentList from '../components/documents/DocumentList';
import DocumentUpload from '../components/documents/DocumentUpload';
import Button from '../components/common/Button';
import { HiOutlineDocumentPlus } from 'react-icons/hi2';

const Documents = () => {
  const [isUploadOpen, setUploadOpen] = useState(false);
  return (
    <DashboardLayout 
      title="Documents" 
      subtitle="Manage and organize your documents"
      actions={<Button onClick={() => setUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 px-4 flex items-center gap-2"><HiOutlineDocumentPlus /> Upload Document</Button>}
    >
      <DocumentList />
      <DocumentUpload isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} />
    </DashboardLayout>
  );
};
export default Documents;
