"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJobsBySkills = fetchJobsBySkills;
const axios_1 = __importDefault(require("axios"));
/**
 * Fetch relevant jobs based on extracted skills
 */
async function fetchJobsBySkills(skills, country = 'in', resultsPerPage = 10) {
    try {
        const APP_ID = process.env.ADZUNA_APP_ID;
        const APP_KEY = process.env.ADZUNA_API_KEY;
        if (!APP_ID || !APP_KEY) {
            console.warn('Adzuna API credentials not configured');
            return [];
        }
        // Prepare a search query from skills (take up to 5 skills to keep query focused)
        const keySkills = skills.slice(0, 5).join(' ');
        const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=${resultsPerPage}&what=${encodeURIComponent(keySkills)}`;
        const response = await axios_1.default.get(url);
        return response.data.results;
    }
    catch (error) {
        console.error('Error fetching jobs from Adzuna:', error);
        return [];
    }
}
