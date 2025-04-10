"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const resumeRoutes_1 = __importDefault(require("./db/routes/resumeRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-parser')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
// Routes
app.use('/api/resumes', resumeRoutes_1.default);
// Simple health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
