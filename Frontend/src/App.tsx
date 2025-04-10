import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import ResumeUploader from './components/ResumeUploader';
import SkillsList from './components/SkillsList';
import JobList from './components/JobList';
import Footer from './components/Footer';
import { ResumeData, Job } from './types';

function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleResumeProcessed = (data: ResumeData) => {
    setResumeData(data);
    setJobs([]);
  };

  const fetchJobs = async () => {
    if (!resumeData?.resumeId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/resumes/${resumeData.resumeId}/jobs`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }

      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Your Resume</h2>
            <ResumeUploader onResumeProcessed={handleResumeProcessed} />
          </div>
          
          {resumeData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Extracted Skills</h2>
              <SkillsList skills={resumeData.skills} />
              
              <div className="mt-6">
                <button 
                  onClick={fetchJobs}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                >
                  Find Matching Jobs
                </button>
              </div>
            </div>
          )}
        </div>
        
        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {jobs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Matching Job Opportunities</h2>
            <JobList jobs={jobs} />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
