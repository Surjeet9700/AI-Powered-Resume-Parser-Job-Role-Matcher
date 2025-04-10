import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenAI } from "@google/genai";

// Initialize Google AI (Gemini) with API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini AI only if API key is provided
const genAI = GEMINI_API_KEY 
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) 
  : null;

export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

export async function extractSkills(text: string): Promise<string[]> {
  try {
    if (!genAI) {
      console.error('Gemini API key not configured. Set GEMINI_API_KEY in your .env file.');
      return extractSkillsWithFallback(text);
    }

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
      return extractSkillsWithFallback(text);
    }

    try {
      const cleanResponse = responseText.replace(/```json|```/g, '').trim();
      const skills = JSON.parse(cleanResponse);
      if (Array.isArray(skills)) {
        return skills.map(skill => skill.trim()).filter(Boolean);
      }
      throw new Error('Invalid skills format returned');
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return extractSkillsWithFallback(text);
    }
  } catch (error) {
    console.error('Error extracting skills with AI:', error);
    return extractSkillsWithFallback(text);
  }
}

function extractSkillsWithFallback(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Swift',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind',
    'MongoDB', 'MySQL', 'PostgreSQL', 'SQL Server', 'Oracle', 'Firebase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD',
    'Git', 'SVN', 'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence',
    'REST API', 'GraphQL', 'SOAP', 'Microservices', 'Serverless',
    'Machine Learning', 'AI', 'Data Science', 'Big Data', 'Data Analytics',
    'Unity', 'Unreal Engine', 'Android', 'iOS', 'React Native', 'Flutter'
  ];
  
  const lowerText = text.toLowerCase();
  const foundSkills = commonSkills.filter(skill => lowerText.includes(skill.toLowerCase()));
  
  const skillPatterns = [
    /experienced in\s+([A-Za-z0-9#\+\s]+)/gi,
    /proficient in\s+([A-Za-z0-9#\+\s]+)/gi,
    /skills:([^.]*)./gi,
    /technologies:([^.]*)./gi
  ];
  
  const extractedPhrases = [];
  for (const pattern of skillPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        extractedPhrases.push(match[1].trim());
      }
    }
  }
  
  const additionalSkills = extractedPhrases
    .flatMap(phrase => phrase.split(/[,;]/))
    .map(skill => skill.trim())
    .filter(skill => skill.length > 2 && skill.length < 30); 
  
  return [...new Set([...foundSkills, ...additionalSkills])];
}
