# AI-Powered Resume Parser & Job Role Matcher

An intelligent system that parses resumes and matches them with suitable job roles based on extracted skills.

## Features
- Supports PDF and DOCX resume formats
- Extracts skills automatically from resumes
- Matches skills with job postings
- RESTful API architecture

## Installation & Setup
1. Clone the repository
```bash
git clone https://github.com/Surjeet9700/AI-Powered-Resume-Parser-Job-Role-Matcher.git
cd AI-Powered-Resume-Parser-Job-Role-Matcher
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server
```bash
npm start
```

## API Documentation
### Endpoints
- POST /upload - Upload resume
- GET /:id/skills - Get extracted skills
- GET /:id/jobs - Get matching jobs

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
MIT License
