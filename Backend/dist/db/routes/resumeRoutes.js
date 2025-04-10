"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const resumeParser_1 = require("../utils/resumeParser");
const Resume_1 = __importDefault(require("../models/Resume"));
const adzuna_1 = require("../utils/adzuna");
const router = express_1.default.Router();
// Set up multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path_1.default.join(__dirname, '../../../uploads');
        // Create uploads directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename to prevent security issues
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9\.\-\_]/g, '_');
        cb(null, `${Date.now()}-${sanitizedName}`);
    }
});
// File filter to accept only PDF and DOCX files
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['.pdf', '.docx'];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF and DOCX files are allowed'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});
// Upload resume and extract skills
router.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filePath = req.file.path;
        const fileExt = path_1.default.extname(req.file.originalname).toLowerCase();
        // Extract text based on file type
        let text;
        if (fileExt === '.pdf') {
            text = await (0, resumeParser_1.extractTextFromPDF)(filePath);
        }
        else if (fileExt === '.docx') {
            text = await (0, resumeParser_1.extractTextFromDOCX)(filePath);
        }
        else {
            return res.status(400).json({ error: 'Unsupported file format' });
        }
        // Extract skills using AI
        const skills = await (0, resumeParser_1.extractSkills)(text);
        // Save to MongoDB
        const resume = new Resume_1.default({
            skills,
            fileName: req.file.originalname
        });
        await resume.save();
        // Cleanup - delete the uploaded file after processing
        fs_1.default.unlinkSync(filePath);
        res.status(201).json({
            message: 'Resume processed successfully',
            resumeId: resume._id,
            skills
        });
    }
    catch (error) {
        console.error('Error processing resume:', error);
        res.status(500).json({ error: 'Error processing resume' });
    }
});
// Get skills by resume ID
router.get('/:id/skills', async (req, res) => {
    try {
        const resume = await Resume_1.default.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        res.json({ skills: resume.skills });
    }
    catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ error: 'Error fetching skills' });
    }
});
// Get jobs based on resume ID
router.get('/:id/jobs', async (req, res) => {
    try {
        const resume = await Resume_1.default.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        const jobs = await (0, adzuna_1.fetchJobsBySkills)(resume.skills);
        res.json({ jobs });
    }
    catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Error fetching jobs' });
    }
});
exports.default = router;
