
import React, { useRef, useState } from 'react';
import { UploadedFile } from '../types';

interface FileUploaderProps {
  onFilesSelected: (files: UploadedFile[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const uploadPromises = validFiles.map(file => {
      return new Promise<UploadedFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            file,
            preview: e.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises).then(onFilesSelected);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center gap-4 ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
      />
      
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800">Upload your handwritten paper</h3>
      <p className="text-slate-500 text-center max-w-sm">
        Drag and drop your images here, or click to browse. Supports JPG, PNG, and scanned photos.
      </p>
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
      >
        Select Images
      </button>
    </div>
  );
};

export default FileUploader;
