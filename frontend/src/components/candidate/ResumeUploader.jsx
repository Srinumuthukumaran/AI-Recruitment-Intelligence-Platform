import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import candidateService from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';

const ResumeUploader = ({ onUploadSuccess, currentResumeText }) => {
  const { user, refreshUser } = useAuth();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    setSuccess(null);
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please select a valid PDF file (.pdf format).');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a PDF resume to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const email = user?.email;
      const res = await candidateService.uploadResume(file, email);
      setSuccess(typeof res === 'string' ? res : 'Resume uploaded, parsed, and submitted to recruiters successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await refreshUser();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err.message || 'Failed to upload and parse resume. Please check file formatting.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Upload Resume (PDF)</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            TalentIQ extracts your qualifications, submits your profile to recruiters, and triggers AI job matching
          </p>
        </div>
        {currentResumeText && (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resume On File</span>
          </span>
        )}
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : file
            ? 'border-emerald-500/50 bg-emerald-950/10'
            : 'border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          {file ? (
            <div className="flex items-center space-x-3 text-emerald-400">
              <FileText className="w-10 h-10" />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-100">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-200">
                Click to browse or drag and drop your PDF resume
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF format up to 10MB</p>
            </>
          )}
        </div>
      </div>

      {/* Error and Success alerts */}
      {error && (
        <div className="mt-4 flex items-center space-x-2 text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 flex items-center justify-end space-x-3">
        {file && (
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Clear Selection
          </button>
        )}
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            !file || isUploading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Parsing PDF with PDFBox...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>{currentResumeText ? 'Update & Submit to Recruiter' : 'Upload & Submit to Recruiter'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResumeUploader;
