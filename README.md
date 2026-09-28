# Employee Management AI Agent

A full-stack Employee Management application built with **React, Node.js, Express, MongoDB, JWT Authentication, Role-Based Access Control (RBAC), and an AI Assistant**.

The project demonstrates how a modern enterprise-style application can combine traditional employee management features with **Generative AI**, conversational history, embeddings/RAG concepts, authentication, authorization, Docker, and cloud deployment.

## 🚀 Live Application

**Frontend:**
https://employee-management-ai-agent.vercel.app/

**Backend API:**
https://employee-management-ai-agent.onrender.com/

> The production frontend is hosted on Vercel and the backend API is hosted on Render. Employee data is stored in MongoDB Atlas.

---

## 📌 Project Overview

The Employee Management AI Agent provides a secure web application for managing employee information.

Users can:

* Login securely using email and password
* Access employee information based on their role
* Search and filter employees
* View employee details
* Create employees
* Update employees
* Delete employees
* Use pagination for employee records
* Interact with an AI Assistant
* Maintain AI conversation history
* Ask natural-language questions about employee information
* Use an AI-powered conversational interface from the application

The application also demonstrates:

* JWT authentication
* Role-Based Access Control
* REST API development
* MongoDB integration
* AI/LLM integration
* Local LLM development using Ollama
* Embeddings/RAG concepts
* Docker containerization
* Cloud deployment

---

# 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │       User           │
                    │     Browser          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     React + MUI      │
                    │      Frontend        │
                    │      Vercel          │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │       Backend        │
                    │       Render         │
                    └───────┬───────┬──────┘
                            │       │
              ┌─────────────┘       └──────────────┐
              ▼                                    ▼
     ┌─────────────────┐                  ┌─────────────────┐
     │ MongoDB Atlas   │                  │  AI Assistant   │
     │ Employee/User   │                  │ Ollama + Llama  │
     │ Data            │                  │      3.2        │
     └─────────────────┘                  └─────────────────┘
```

---

# ✨ Key Features

## 🔐 Authentication

The application implements JWT-based authentication.

### Login flow

```text
User enters email/password
          ↓
POST /api/auth/login
          ↓
Backend validates credentials
          ↓
Password checked using bcrypt
          ↓
JWT token generated
          ↓
Token returned to React
          ↓
Authenticated user accesses application
```

Passwords are hashed using `bcryptjs` rather than being stored as plain text.

---

# 👥 Role-Based Access Control

The application supports different user roles.

Currently:

* `admin`
* `user`

### Admin

Admins can:

* View employees
* Create employees
* Update employees
* Delete employees
* Use the AI Assistant

### User

Regular users can:

* Login
* View employees
* Search employees
* Filter employees
* Use permitted application functionality

Protected backend APIs use middleware to verify both:

1. Authentication
2. User role

Example:

```text
Request
   ↓
JWT Authentication Middleware
   ↓
Role Middleware
   ↓
Controller / API
```

This ensures that authorization is enforced on the backend rather than relying only on frontend visibility.

---

# 👨‍💼 Employee Management

The application provides complete employee CRUD functionality.

### Create

Admins can create new employees.

### Read

Authenticated users can retrieve employee records.

### Update

Admins can update employee information.

### Delete

Admins can delete employee records.

### Search

Employees can be searched by:

* Name
* Email
* Skill

### Filters

Employees can be filtered by:

* Skill
* Location

### Pagination

Employee records are returned using server-side pagination.

Example:

```text
GET /api/employees?page=1&limit=5
```

The backend returns:

```json
{
  "employees": [],
  "currentPage": 1,
  "totalPages": 5,
  "totalEmployees": 25
}
```

---

# 🤖 AI Assistant

The application includes an AI Assistant integrated directly into the React UI.

The AI Assistant is available through a floating action button and opens a conversational interface.

Users can ask questions using natural language instead of manually searching the application.

Example questions:

```text
Who has React skills?

Which employees are located in Hyderabad?

Show me employees with Node.js experience.

Who has experience with JavaScript?
```

The AI request flows through the backend rather than exposing the AI service directly to the browser.

```text
React AI Assistant
       ↓
Node.js / Express
       ↓
AI Route
       ↓
Ollama
       ↓
Llama 3.2
       ↓
AI Response
       ↓
React UI
```

---

# 🧠 Generative AI / LLM Integration

During development, the project uses **Ollama** to run a local Large Language Model.

Current model:

```text
Llama 3.2
```

Ollama allows the application to communicate with a locally running LLM without depending on a paid external API during development.

This was particularly useful for development and testing because the application can be tested locally without consuming OpenAI API credits.

---

# 💬 AI Conversations

The AI Assistant supports conversational interaction.

A conversation can contain multiple messages.

Example:

```text
User:
Who has React skills?

AI:
Ramesh and John have React skills.

User:
Where are they located?

AI:
Ramesh is located in Hyderabad...
```

Conversation identifiers are used to maintain conversation context.

The project also supports starting a new conversation and retrieving conversation history.

---

# 🔎 Embeddings and RAG

The project also explores **Retrieval-Augmented Generation (RAG)** concepts.

Embeddings are generated using:

```text
nomic-embed-text
```

The purpose of embeddings is to convert text into numerical vectors that can be used for semantic similarity and retrieval.

### Traditional search

```text
User query
    ↓
Keyword matching
    ↓
Database results
```

### RAG approach

```text
User question
      ↓
Generate embedding
      ↓
Find relevant information
      ↓
Retrieve context
      ↓
Send context + question to LLM
      ↓
Generate grounded response
```

This approach is useful when the AI needs to answer questions using application-specific information rather than relying only on the model's general knowledge.

> The current project uses the AI/embedding foundation for demonstrating this architecture. A production-scale RAG implementation can be extended with a dedicated vector database, document ingestion pipeline, retrieval evaluation, and stronger grounding controls.

---

# 🤖 Agentic AI Concept

The project is designed to demonstrate how an Employee Management application can evolve from a simple chatbot into an AI agent.

A future agentic workflow could allow the AI to select application tools based on the user's request.

For example:

```text
User:
Find React developers in Hyderabad.

             ↓

AI Agent
             ↓
Select employee search tool
             ↓
Employee API
             ↓
MongoDB
             ↓
Employee results
             ↓
LLM formats response
             ↓
User
```

Possible future tools include:

* Search employees
* Get employee by ID
* Filter employees
* Create employee
* Update employee
* Generate employee reports

Any tool that modifies data should continue to respect the application's existing authentication and RBAC rules.

---

# 🎨 Frontend

The frontend is built using:

* React
* JavaScript
* Material UI (MUI)
* React Hooks
* REST API integration

The UI contains:

### Login

A responsive login screen using Material UI components.

### Dashboard

Displays employee management functionality after authentication.

### Employee Table

Displays employee information with:

* Search
* Filters
* Pagination
* Actions

### AI Assistant

Floating AI button with a side drawer for conversational interaction.

---

# 🔒 Security

The project demonstrates several application security practices.

### Password hashing

Passwords are hashed using:

```text
bcryptjs
```

### JWT Authentication

Authenticated requests use JWT tokens.

### Authorization

Backend APIs use role-based middleware.

### Environment Variables

Sensitive configuration is stored in environment variables.

Examples:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OLLAMA_BASE_URL=your_ollama_url
```

The `.env` file should never be committed to GitHub.

---

# 🔌 REST API

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

---

## Employees

### Get employees

```http
GET /api/employees
```

Supports:

```text
search
skill
location
page
limit
```

Example:

```http
GET /api/employees?search=react&skill=React&location=Hyderabad&page=1&limit=5
```

### Get employee

```http
GET /api/employees/:id
```

### Create employee

```http
POST /api/employees
```

Admin only.

### Update employee

```http
PUT /api/employees/:id
```

Admin only.

### Delete employee

```http
DELETE /api/employees/:id
```

Admin only.

---

## AI

AI functionality is exposed through:

```http
/api/ai
```

The AI routes handle conversational requests and conversation management.

---

# 🧪 Testing

The project has been tested at multiple levels.

## API Testing

**Postman** is used to test backend APIs.

Examples include:

* Login
* Employee CRUD
* Search
* Filtering
* Pagination
* JWT authentication
* RBAC
* AI requests
* Conversation handling
* Error scenarios

## AI Testing

AI integration is tested by sending prompts to the backend AI API and verifying:

* Response generation
* Conversation ID
* Follow-up questions
* Conversation history
* Error handling
* Backend-to-Ollama communication

## UI Testing

The React application is tested end-to-end by interacting with:

* Login
* Dashboard
* Employee management
* Search/filter
* Pagination
* AI Assistant
* Logout

---

# 🐳 Docker

The backend can be containerized using Docker.

Example Dockerfile:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

Build the image:

```bash
docker build -t employee-ai-backend .
```

Run the container:

```bash
docker run --name employee-ai-backend-container \
  -p 5000:5000 \
  --env-file .env \
  employee-ai-backend
```

The Dockerized backend can connect to MongoDB Atlas and can also communicate with Ollama during local development.

---

# ☁️ Deployment

The current production deployment uses:

| Component        | Technology        |
| ---------------- | ----------------- |
| Frontend         | React             |
| UI Library       | Material UI       |
| Frontend Hosting | Vercel            |
| Backend          | Node.js + Express |
| Backend Hosting  | Render            |
| Database         | MongoDB Atlas     |
| Authentication   | JWT               |
| Password Hashing | bcrypt            |
| Local AI         | Ollama            |
| LLM              | Llama 3.2         |
| Embeddings       | nomic-embed-text  |
| Containerization | Docker            |
| API Testing      | Postman           |
| Source Control   | GitHub            |

### Production architecture

```text
GitHub
   │
   ├──────────────► Vercel
   │                  │
   │                  ▼
   │              React App
   │                  │
   │                  │ HTTPS API
   │                  ▼
   └──────────────► Render
                      │
                      ├── Express API
                      ├── JWT / RBAC
                      │
                      ▼
                 MongoDB Atlas
```

---

# 🌍 Environment Configuration

## Frontend

The frontend uses:

```env
REACT_APP_API_URL=https://employee-management-ai-agent.onrender.com
```

For local development:

```env
REACT_APP_API_URL=http://localhost:5000
```

Because this is a React `REACT_APP_` variable, the value is included in the frontend build and should **not contain secrets**.

---

## Backend

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OLLAMA_BASE_URL=http://localhost:11434
PORT=5000
```

Production secrets should be configured through the hosting provider's environment-variable settings.

---

# 📂 Project Structure

```text
employee-management-ai-agent/
│
├── backend/
│   ├── middleware/
│   │   ├── authMiddleWare.js
│   │   └── roleMiddleware.js
│   │
│   ├── models/
│   │   ├── Employee.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   └── aiRoutes.js
│   │
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── public/
│
├── src/
│   ├── components/
│   ├── App.js
│   └── ...
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

> `.env` is excluded from Git and should not be committed.

---

# ⚙️ Local Setup

## 1. Clone the repository

```bash
git clone https://github.com/RAMESHH-GIT/employee-management-ai-agent.git
```

```bash
cd employee-management-ai-agent
```

---

## 2. Install frontend dependencies

```bash
npm install
```

---

## 3. Install backend dependencies

```bash
cd backend
npm install
```

---

## 4. Configure backend environment variables

Create:

```text
backend/.env
```

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OLLAMA_BASE_URL=http://localhost:11434
PORT=5000
```

---

## 5. Install and run Ollama

Install Ollama and download the required models.

Example:

```bash
ollama pull llama3.2
```

For embeddings:

```bash
ollama pull nomic-embed-text
```

Start the model when required:

```bash
ollama run llama3.2
```

---

## 6. Start backend

From the `backend` directory:

```bash
node server.js
```

Backend:

```text
http://localhost:5000
```

---

## 7. Start frontend

Open another terminal in the project root:

```bash
npm start
```

Frontend:

```text
http://localhost:3000
```

---

# 🔄 Complete Application Flow

```text
User
 │
 ▼
React Login
 │
 ▼
POST /api/auth/login
 │
 ▼
Node.js + Express
 │
 ├── Validate credentials
 ├── bcrypt password verification
 └── Generate JWT
 │
 ▼
React Dashboard
 │
 ├───────────────┐
 │               │
 ▼               ▼
Employee API    AI Assistant
 │               │
 ▼               ▼
MongoDB       AI Route
               │
               ▼
             Ollama
               │
               ▼
            Llama 3.2
               │
               ▼
          AI Response
               │
               ▼
          React UI
```

---

### AI

* Generative AI
* LLM integration
* Ollama
* Llama 3.2
* Embeddings
* RAG concepts
* Conversation history
* AI API integration
* Agentic AI architecture

### DevOps / Cloud

* Git
* GitHub
* Docker
* Vercel
* Render
* MongoDB Atlas
* Environment configuration

---

# 📈 Future Enhancements




-
# 🧩 Why This Project?

The project combines several technologies that are commonly used in modern full-stack applications:

```text
React
   +
Node.js / Express
   +
MongoDB
   +
JWT / RBAC
   +
Generative AI
   +
RAG / Embeddings
   +
Docker
   +
Cloud Deployment
```

Instead of building an isolated AI chatbot, the AI functionality is integrated into a real business application and works alongside authentication, authorization, database operations, and REST APIs.

---

# 👨‍💻 Author

**Ramesh**

React Developer | Full-Stack Developer | AI Application Development

GitHub:

https://github.com/RAMESHH-GIT

---

# ⭐ Project

If you find this project useful for learning about React, Node.js, MongoDB, authentication, RBAC, AI integration, and cloud deployment, feel free to explore the repository.

**Repository:**

https://github.com/RAMESHH-GIT/employee-management-ai-agent
