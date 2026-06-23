import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface UploadAreaProps {
  onFileUpload: (file: File) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
      onFileUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      alert('Vui lòng chọn file Excel hoặc CSV (.xlsx, .xls, .csv)');
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-slate-300 rounded-lg p-16 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-500 transition-all cursor-pointer bg-white shadow-sm"
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>
      <p className="text-[15px] font-bold text-slate-800 mb-2">Kéo thả file Excel vào đây</p>
      <p className="text-[13px] text-slate-500 font-medium">Hoặc click để chọn file từ máy tính</p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx, .xls, .csv"
      />
    </div>
  );
};
