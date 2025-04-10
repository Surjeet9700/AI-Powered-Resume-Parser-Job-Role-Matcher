import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './db/connect';
import resumeRoutes from './db/routes/resumeRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB but continue even if it fails
connectDB().catch((err: Error) => {
  console.error('Failed to establish database connection:', err);
  console.warn('Server will start without database connection. Some features may not work properly.');
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/resumes', resumeRoutes);

// Root route
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.json({ message: 'Resume Parser API is running' });
});

// Add a specific endpoint to test file upload without processing
app.post('/api/test-upload', express.raw({ type: 'multipart/form-data', limit: '10mb' }), (req, res) => {
  console.log('Test upload endpoint accessed');
  console.log('Headers:', req.headers);
  console.log('Body length:', req.body?.length || 0);
  res.json({ message: 'Upload test received' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message || 'Unknown error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}`);
  console.log(`CORS is enabled for all origins`);
});