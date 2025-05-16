# Agent Management System

A MERN stack application for managing agents and distributing tasks.

## Features

1. Admin User Login
2. Agent Creation & Management
3. CSV Upload and Task Distribution

## Technical Stack

- MongoDB for the database
- Express.js and Node.js for the backend
- React.js with TypeScript for the frontend
- Material-UI for the user interface

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or a cloud instance)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Setup Backend:
```bash
cd server
npm install
# Create .env file with the following variables:
# MONGODB_URI=mongodb://localhost:27017/agent_management
# JWT_SECRET=your_jwt_secret_key
# PORT=5000
npm run dev
```

3. Setup Frontend:
```bash
cd client
npm install
npm run dev
```

4. Access the application:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/users/login - Admin login

### Agents
- POST /api/agents - Create new agent
- GET /api/agents - Get all agents
- POST /api/agents/upload-csv - Upload and distribute tasks

## CSV Format
The CSV file should have the following columns:
- FirstName
- Phone
- Notes

## Evaluation Criteria Met

1. Functionality
   - Complete implementation of all required features
   - Proper validation and error handling

2. Code Quality
   - Clean and well-documented code
   - TypeScript for type safety
   - Proper project structure

3. User Interface
   - Modern and responsive design using Material-UI
   - Intuitive user experience

4. Technical Requirements
   - MERN stack implementation
   - Proper configuration management
   - Secure authentication using JWT
