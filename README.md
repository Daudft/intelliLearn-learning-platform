# IntelliLearn

An adaptive learning platform for Introduction to Programming concepts, built with AI integration to personalize how students learn to code.

## Overview

IntelliLearn is a Final Year Project (FYP) designed to help students learn programming fundamentals through adaptive, AI-guided learning pathways. It combines competency assessment, real-time code execution, and an AI mentor agent to give learners a personalized path through introductory programming concepts.

## Features

- **Authentication** — secure user registration and login
- **Competency Assessment** — evaluates a learner's current skill level to tailor content
- **AI-Powered Learning Pathways** — adaptive content generated via the Groq API (LLaMA models)
- **AI Mentor Agent** — conversational mentor that assists learners using contextual prompt templates
- **Built-in Code Editor / IDE** — real compiler execution with a submission flow
- **Quizzes** — knowledge checks tied to learning progress
- **Leaderboard** — gamified progress tracking across learners
- **Analytics Dashboard** — insights into learner performance and progress
- **Admin Panel** — management interface for content and users

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** MongoDB (MongoDB Atlas)
- **AI Integration:** Groq API / LLaMA models
- **ODM:** Mongoose

## AI Mentor Architecture

The AI mentor agent is built around:
- A Mongoose `MentorSession` model to track mentor conversations
- An Express controller powered by four distinct Groq prompt templates
- A React `MentorPanel` component for the front-end mentor interface

## Project Structure

```
intellilearn/
├── client/          # React front-end
├── server/          # Express back-end
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── utils/
│       └── aiTaskGenerator.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js
- MongoDB (local instance or MongoDB Atlas)
- A Groq API key

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd intellilearn
   ```

2. Install dependencies for both client and server
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. Configure environment variables (create a `.env` file in `server/`)
   ```
   MONGODB_URI=your_mongodb_connection_string
   GROQ_API_KEY=your_groq_api_key
   ```

4. Run the development servers
   ```bash
   # In server/
   npm run dev

   # In client/
   npm start
   ```

## Deployment

The project has been deployed and tested on Hugging Face Spaces.

## Contributors

- Daud Afzal
- Muhammad Ali

## License

This project was developed as a Final Year Project (FYP) for academic purposes.
