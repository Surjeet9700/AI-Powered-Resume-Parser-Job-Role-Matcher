const axios = require('axios');
require('dotenv').config();

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applyLink: string;
}

interface AdzunaJob {
  id: string;
  title: string;
  company?: {
    display_name?: string;
  };
  location?: {
    display_name?: string;
  };
  description?: string;
  redirect_url: string;
}

export const fetchJobsBySkills = async (skills: string[], country = 'in', resultsPerPage = 10): Promise<JobListing[]> => {
  try {
    const what = skills.join(" ");
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1`, {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_API_KEY,
          what_or: what,
          results_per_page: resultsPerPage
        }
      }
    );

    if (!response.data || !response.data.results) {
      return [];
    }

    return response.data.results.map((job: AdzunaJob) => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Remote/Unspecified',
      description: job.description || 'No description provided',
      applyLink: job.redirect_url
    }));
  } catch (error: any) {
    return [];
  }
};

