# ChattyAgent - AI Chatbot Platform

A comprehensive, production-ready chatbot platform that enables users to create, manage, and deploy custom AI agents with personalized system prompts, file uploads, and real-time chat capabilities.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with registration and login
- **AI Agent Management**: Create and configure multiple AI agents with custom system prompts
- **Real-time Chat**: Interactive chat interface with message history and typing indicators
- **File Upload Integration**: Upload documents to enhance AI agent knowledge via OpenAI Files API
- **Project Organization**: Organize agents into projects with descriptions and settings
- **Responsive Design**: Modern, mobile-first UI that works on all devices

### Advanced Features
- **Message Persistence**: Complete chat history with timestamps and user context
- **File Management**: Upload, view, and delete files associated with each project
- **Search & Filtering**: Find projects and conversations quickly
- **Soft Deletion**: Safe deletion with recovery options
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Security**: Input validation, authentication middleware, and data protection

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Handling**: Multer for multipart uploads
- **External APIs**: OpenAI GPT and Files APIs
- **Security**: bcryptjs, CORS, input validation

### Frontend
- **Framework**: React 18 with functional components
- **Styling**: Tailwind CSS with custom components
- **Routing**: React Router for SPA navigation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and building

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- OpenAI API key
- Modern web browser

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd chattyagent

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

**Backend (.env):**
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/chattyagent
JWT_SECRET=your-super-secret-jwt-key-here
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=ChattyAgent
VITE_APP_VERSION=1.0.0
```

### 3. Database Setup

Ensure MongoDB is running locally or update `MONGO_URI` to point to your MongoDB instance:

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in backend/.env to your Atlas connection string
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

## 📁 Project Structure

```
chattyagent/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   ├── config.js        # Configuration management
│   │   └── index.js         # Server entry point
│   ├── .env.example         # Environment template
│   └── package.json         # Dependencies & scripts
├── frontend/
│   ├── src/
│   │   ├── api/             # HTTP client & API calls
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main application component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── .env.example         # Environment template
│   ├── package.json         # Dependencies & scripts
│   └── vite.config.js       # Build configuration
├── architecture.md          # Detailed architecture docs
└── README.md               # This file
```

## 🔧 API Documentation

### Authentication
```bash
# Register new user
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Projects (AI Agents)
```bash
# Create project
POST /api/projects
Authorization: Bearer <token>
{
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries",
  "systemPrompt": "You are a helpful customer support assistant..."
}

# List projects
GET /api/projects?page=1&limit=10&search=support
Authorization: Bearer <token>
```

### Chat
```bash
# Create chat session
POST /api/chat
Authorization: Bearer <token>
{
  "projectId": "project_id_here",
  "title": "New Conversation"
}

# Send message
POST /api/chat/message
Authorization: Bearer <token>
{
  "chatId": "chat_id_here",
  "message": "Hello, how can you help me?"
}
```

### File Upload
```bash
# Upload file to project
POST /api/files/:projectId
Authorization: Bearer <token>
Content-Type: multipart/form-data

# List project files
GET /api/files/:projectId
Authorization: Bearer <token>
```

## 🎨 UI Components

### Key Components
- **AuthForm**: Login and registration with validation
- **Dashboard**: Main application interface with sidebar navigation
- **AgentChat**: Real-time chat interface with message history
- **FileUploader**: Drag-and-drop file upload with progress tracking
- **ProjectModal**: Create and edit AI agent configurations

### Design System
- **Colors**: Blue primary (#3B82F6), Purple secondary (#8B5CF6), Green accent (#10B981)
- **Typography**: System fonts with proper hierarchy and spacing
- **Spacing**: 8px grid system for consistent layouts
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design with breakpoints

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with secure expiration
- Password hashing with bcryptjs
- Protected API routes with middleware
- User data isolation and ownership validation

### Data Protection
- Input validation and sanitization
- MongoDB injection prevention
- File upload restrictions and validation
- CORS configuration for allowed origins
- Soft deletion for data recovery

### API Security
- Request timeout configurations
- Error handling without information leakage
- Structured error responses
- Environment-based configuration

## 🚀 Deployment

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Deployment Options

**Backend Deployment (Heroku):**
1. Create Heroku app: `heroku create chattyagent-api`
2. Set environment variables: `heroku config:set MONGO_URI=...`
3. Deploy: `git push heroku main`

**Frontend Deployment (Vercel):**
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard

**Database (MongoDB Atlas):**
1. Create cluster at mongodb.com
2. Get connection string
3. Update `MONGO_URI` in production environment

### Environment Variables for Production

**Backend:**
```env
PORT=4000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chattyagent
JWT_SECRET=production-secret-key-very-long-and-secure
OPENAI_API_KEY=sk-your-production-openai-key
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=ChattyAgent
VITE_APP_VERSION=1.0.0
```

## 📊 Performance Optimization

### Backend Optimizations
- Database indexing on frequently queried fields
- Connection pooling for MongoDB
- Request/response compression
- Efficient query patterns with pagination
- File upload streaming

### Frontend Optimizations
- Code splitting with React.lazy
- Image optimization and lazy loading
- Bundle size optimization with Vite
- Efficient re-rendering with React.memo
- Service worker for caching (future enhancement)

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test  # Run test suite (when implemented)
```

### Frontend Testing
```bash
cd frontend
npm test  # Run component tests (when implemented)
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Project creation and management
- [ ] Chat functionality with AI responses
- [ ] File upload and management
- [ ] Responsive design on mobile/tablet
- [ ] Error handling and edge cases

## 🔧 Development

### Adding New Features

1. **Backend**: Add routes → controllers → models
2. **Frontend**: Create components → integrate with API
3. **Database**: Update schemas and add migrations
4. **Testing**: Add unit and integration tests

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- Conventional commits for version control
- Component-based architecture

### Debugging
- Backend: Use `console.log` or debugger tools
- Frontend: React DevTools and browser console
- Database: MongoDB Compass for data inspection
- Network: Browser DevTools Network tab

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Follow existing code patterns and conventions
- Add tests for new functionality
- Update documentation for API changes
- Ensure responsive design for UI changes

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection
- Verify environment variables
- Ensure port 4000 is available

**Frontend build errors:**
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify API URL configuration

**Authentication issues:**
- Check JWT secret configuration
- Verify token expiration settings
- Clear browser localStorage

**File upload failures:**
- Verify OpenAI API key
- Check file size limits (10MB max)
- Ensure supported file types

### Getting Help
- Check the GitHub issues for similar problems
- Review the architecture documentation
- Test API endpoints with tools like Postman
- Check browser console for frontend errors

## 🎯 Roadmap

### Short-term (v1.1)
- [ ] WebSocket integration for real-time chat
- [ ] Message search and filtering
- [ ] Export chat conversations
- [ ] User profile management

### Medium-term (v1.2)
- [ ] Multiple LLM provider support
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] API rate limiting

### Long-term (v2.0)
- [ ] Plugin system for custom integrations
- [ ] Voice chat capabilities
- [ ] Advanced file processing
- [ ] Enterprise features and SSO

---

**Built with ❤️ for the AI community**

For questions, issues, or contributions, please visit our GitHub repository or contact the development team.