import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose, { Document } from 'mongoose';
import { extractTextFromPDF, extractTextFromDOCX, extractSkills } from '../utils/resumeParser';
import Resume from '../models/Resume';
import { fetchJobsBySkills } from '../utils/adzuna';

const router = express.Router();

interface IResumeDocument extends Document {
  skills: string[];
  fileName: string;
  _id: mongoose.Types.ObjectId;
}

const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('resume');

async function processResumeFile(req: Request, res: Response, next: NextFunction) {
  let filePath: string | null = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    filePath = req.file.path;

    const fileExt = path.extname(req.file.originalname || '').toLowerCase();

    if (fileExt !== '.pdf' && fileExt !== '.docx') {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        error: 'Invalid file format',
        details: 'Only PDF and DOCX files are allowed'
      });
    }

    let text: string;
    try {
      if (fileExt === '.pdf') {
        text = await extractTextFromPDF(filePath);
      } else if (fileExt === '.docx') {
        text = await extractTextFromDOCX(filePath);
      } else {
        throw new Error('Unsupported file format');
      }

      if (!text || text.trim().length === 0) {
        throw new Error('No text content extracted from file');
      }
    } catch (extractError) {
      return res.status(400).json({
        error: 'Failed to extract text from file',
        details: extractError instanceof Error ? extractError.message : 'Unknown extraction error'
      });
    }

    try {
      const skills = await extractSkills(text);

      let resumeId: string | mongoose.Types.ObjectId | null = null;
      let dbStatus = 'unknown';

      try {
        const resume = new Resume({
          skills,
          fileName: req.file.originalname || req.file.filename
        });

        const savedResume = await resume.save() as IResumeDocument;
        resumeId = savedResume._id.toString();
        dbStatus = 'success';
      } catch (dbError) {
        resumeId = `local-${Date.now()}`;
        dbStatus = 'failed';
      }

      return res.status(200).json({
        message: 'Resume processed successfully',
        resumeId: resumeId || `local-${Date.now()}`,
        skills: skills,
        dbStatus: dbStatus
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Error extracting skills',
        details: error instanceof Error ? error.message : 'Unknown error during skill extraction'
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Error processing resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    }
  }
}

router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({
        error: 'File upload failed',
        details: err.message
      });
    }

    await processResumeFile(req, res, next);
  });
});

router.get('/:id/skills', async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ skills: resume.skills });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching skills' });
  }
});

router.get('/:id/jobs', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id || id === 'undefined' || id === 'null') {
      const skillsParam = req.query.skills as string;
      if (skillsParam) {
        const skills = skillsParam.split(',').map(s => s.trim());
        const jobs = await fetchJobsBySkills(skills);
        return res.json({ skills, jobs });
      } else {
        return res.status(400).json({
          error: 'Invalid resume ID and no skills provided',
          message: 'Please provide skills as query parameters (e.g., ?skills=JavaScript,React,Node.js)'
        });
      }
    }

    let skills: string[] = [];

    if (id.startsWith('local-')) {
      const skillsParam = req.query.skills as string;
      if (skillsParam) {
        skills = skillsParam.split(',').map(s => s.trim());
      }

      if (skills.length === 0) {
        return res.status(400).json({
          error: 'No skills available',
          message: 'Please provide skills as query parameters (e.g., ?skills=JavaScript,React,Node.js)'
        });
      }
    } else {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error('Invalid MongoDB ObjectId format');
        }

        const resume = await Resume.findById(id);
        if (resume) {
          skills = resume.skills;
        } else {
          throw new Error('Resume not found in database');
        }
      } catch (dbError) {
        const skillsParam = req.query.skills as string;
        if (skillsParam) {
          skills = skillsParam.split(',').map(s => s.trim());
        } else {
          return res.status(404).json({
            error: 'Resume not found and no fallback skills provided',
            message: 'The resume ID is invalid or the database is unavailable. Please provide skills as query parameters.'
          });
        }
      }
    }

    if (skills.length === 0) {
      return res.status(400).json({ error: 'No skills found to match jobs' });
    }

    try {
      const jobs = await fetchJobsBySkills(skills);
      return res.json({ skills, jobs });
    } catch (jobError) {
      return res.status(500).json({
        error: 'Error fetching jobs',
        message: jobError instanceof Error ? jobError.message : 'Unknown error'
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;