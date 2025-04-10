"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJobsBySkills = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fetchJobsBySkills = async (skills) => {
    try {
        const skillsQuery = skills.join(' OR ');
        const response = await axios_1.default.get(`https://api.adzuna.com/v1/api/jobs/gb/search/1`, {
            params: {
                app_id: process.env.ADZUNA_APP_ID,
                app_key: process.env.ADZUNA_API_KEY,
                what: skillsQuery,
                results_per_page: 10
            }
        });
        if (response.data && response.data.results) {
            return response.data.results.map((job) => ({
                id: job.id,
                title: job.title,
                company: job.company.display_name,
                location: job.location.display_name,
                description: job.description,
                applyLink: job.redirect_url
            }));
        }
        return [];
    }
    catch (error) {
        console.error('Error fetching jobs from Adzuna:', error);
        return [];
    }
};
exports.fetchJobsBySkills = fetchJobsBySkills;
