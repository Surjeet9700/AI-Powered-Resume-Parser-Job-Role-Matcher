import { useState, ChangeEvent, FormEvent } from 'react';
import { ResumeData } from '../types';

interface ResumeUploaderProps {
  onResumeProcessed: (data: ResumeData) => void;
}

const ResumeUploader = ({ onResumeProcessed }: ResumeUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Check file type
    const fileType = selectedFile.type;
    if (
      fileType !== 'application/pdf' && 
      fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      setError('Please select a PDF or DOCX file');
      setFile(null);
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch('http://localhost:5000/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume');
      }
      
      onResumeProcessed(data);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            id="resumeFile"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx"
          />
          <label
            htmlFor="resumeFile"
            className="cursor-pointer block"
          >
            <div className="flex flex-col items-center justify-center">
              <svg 
                className="w-12 h-12 text-gray-400 mb-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="text-gray-700 mb-1">Click to upload or drag and drop</p>
              <p className="text-gray-500 text-sm">PDF or DOCX (max 5MB)</p>
            </div>
          </label>
          {file && (
            <div className="mt-4 p-2 bg-blue-50 rounded flex items-center">
              <svg 
                className="w-5 h-5 text-blue-500 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm text-gray-700">{file.name}</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!file || uploading}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition duration-300 ${
            !file || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Upload & Extract Skills'
          )}
        </button>
      </form>
    </div>
  );
};

export default ResumeUploader;
