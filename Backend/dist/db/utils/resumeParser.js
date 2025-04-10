"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromPDF = extractTextFromPDF;
exports.extractTextFromDOCX = extractTextFromDOCX;
exports.extractSkills = extractSkills;
const fs_1 = __importDefault(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const genai_1 = require("@google/genai");
// Initialize Google AI (Gemini)
const genAI = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = fs_1.default.readFileSync(filePath);
        const data = await (0, pdf_parse_1.default)(dataBuffer);
        return data.text;
    }
    catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
}
/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(filePath) {
    try {
        const result = await mammoth_1.default.extractRawText({ path: filePath });
        return result.value;
    }
    catch (error) {
        console.error('Error extracting text from DOCX:', error);
        throw new Error('Failed to extract text from DOCX');
    }
}
/**
 * Extract skills from resume text using AI
 */
async function extractSkills(text) {
    try {
        // Use Gemini AI to extract skills
        const model = genAI.models;
        const prompt = `
    Extract technical skills and professional competencies from the following resume text. 
    Return ONLY a JSON array of strings with the skills. Do not include any explanations or additional text.
    Here is the resume text:
    
    ${text}
    `;
        const response = await model.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        });
        const responseText = response.text;
        if (!responseText) {
            console.error('Empty response from AI model');
            return [];
        }
        // Parse the JSON array from the response
        try {
            const cleanResponse = responseText.replace(/```json|```/g, '').trim();
            const skills = JSON.parse(cleanResponse);
            if (Array.isArray(skills)) {
                return skills.map(skill => skill.trim()).filter(Boolean);
            }
            throw new Error('Invalid skills format returned');
        }
        catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            const skillsMatches = responseText.match(/["']([^"']+)["']/g);
            return skillsMatches
                ? skillsMatches.map(match => match.replace(/["']/g, '').trim()).filter(Boolean)
                : [];
        }
    }
    catch (error) {
        console.error('Error extracting skills with AI:', error);
        return [];
    }
}
