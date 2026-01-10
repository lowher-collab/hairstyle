import React, { ChangeEvent, useState } from 'react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  label: string;
  image: ImageFile | null;
  onImageChange: (image: ImageFile | null) => void;
  icon?: React.ReactNode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageChange, icon }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix for API usage later if needed, but we keep full for preview
      // For Gemini API we usually need the pure base64 part, so we extract it here
      const base64Data = base64String.split(',')[1];
      
      onImageChange({
        file,
        previewUrl: base64String,
        base64: base64Data,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div
        className={`relative group border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center h-64 cursor-pointer overflow-hidden
        ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
        />

        {image ? (
          <>
            <img
              src={image.previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
              <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Change Image</span>
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full z-30 transition-colors backdrop-blur-sm"
              title="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="text-center p-6 pointer-events-none">
             <div className="mx-auto h-12 w-12 text-slate-400 mb-3">
               {icon || (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
               )}
             </div>
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
};
