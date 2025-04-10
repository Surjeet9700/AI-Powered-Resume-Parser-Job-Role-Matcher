# AI-Powered Resume Parser & Job Role Matcher

An intelligent system that parses resumes and matches them with suitable job roles based on extracted skills.

## Features
- Supports PDF and DOCX resume formats
- Extracts skills automatically from resumes using Google's Gemini AI
- Matches skills with job postings via Adzuna API
- Responsive React frontend with Tailwind CSS
- RESTful API architecture

## Project Structure
- `/Backend` - Node.js server with Express, MongoDB, and resume parsing logic
- `/Frontend` - React application with TypeScript and Tailwind CSS

## Installation & Setup

### Backend Setup
1. Clone the repository
```bash
git clone https://github.com/Surjeet9700/AI-Powered-Resume-Parser-Job-Role-Matcher.git
cd AI-Powered-Resume-Parser-Job-Role-Matcher/Backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your MongoDB, Gemini API, and Adzuna API credentials
```

4. Start the backend server
```bash
npm start
```

### Frontend Setup
1. Navigate to frontend directory
```bash
cd ../Frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## API Documentation
### Endpoints
- `POST /api/resumes/upload` - Upload and process resume
- `GET /api/resumes/:id/skills` - Get extracted skills
- `GET /api/resumes/:id/jobs` - Get matching jobs

## Technologies Used
- **Backend**: Node.js, Express, MongoDB, Mongoose, Google Gemini AI
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **APIs**: Adzuna Job Search API
- **Document Processing**: PDF-Parse, Mammoth (DOCX)

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
MIT License
