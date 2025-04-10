export interface ResumeData {
  resumeId: string;
  skills: string[];
  message?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applyLink: string;
}
