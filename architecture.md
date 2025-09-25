# ChattyAgent Architecture and Design

## Overview

ChattyAgent is a modern, scalable chatbot platform built with a clean separation between frontend and backend services. The architecture follows industry best practices for security, scalability, and maintainability.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express.js    │    │ • OpenAI API    │
│ • Tailwind CSS  │    │ • MongoDB       │    │ • File Storage  │
│ • Axios         │    │ • JWT Auth      │    │                 │
│ • React Router  │    │ • Mongoose      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with functional components and hooks
- Tailwind CSS for styling and responsive design
- Axios for HTTP client with interceptors
- React Router for client-side routing
- Lucide React for consistent iconography

**Backend:**
- Node.js with Express.js framework
- MongoDB with Mongoose ODM
- JWT for stateless authentication
- Multer for file upload handling
- CORS for cross-origin resource sharing

**External Services:**
- OpenAI API for LLM responses
- OpenAI Files API for document processing

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  passwordHash: String (required),
  name: String,
  timestamps: { createdAt, updatedAt }
}
```

### Project Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  owner: ObjectId (ref: User),
  systemPrompt: String (default: "You are a helpful AI assistant."),
  fileIds: [String], // OpenAI file IDs
  isActive: Boolean (default: true),
  timestamps: { createdAt, updatedAt }
}
```

### Chat Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  project: ObjectId (ref: Project),
  owner: ObjectId (ref: User),
  messages: [{
    role: String (enum: ['user', 'assistant', 'system']),
    content: String (required),
    timestamp: Date (default: now)
  }],
  isActive: Boolean (default: true),
  timestamps: { createdAt, updatedAt }
}
```

## API Design

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Project Management Endpoints
- `POST /api/projects` - Create new project (protected)
- `GET /api/projects` - List user projects with pagination (protected)
- `GET /api/projects/:id` - Get specific project (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Soft delete project (protected)

### Chat Endpoints
- `POST /api/chat` - Create new chat session (protected)
- `GET /api/chat` - List chats with filtering (protected)
- `GET /api/chat/:id` - Get chat with messages (protected)
- `POST /api/chat/message` - Send message and get AI response (protected)
- `DELETE /api/chat/:id` - Soft delete chat (protected)

### File Management Endpoints
- `POST /api/files/:projectId` - Upload file to project (protected)
- `GET /api/files/:projectId` - List project files (protected)
- `DELETE /api/files/:projectId/:fileId` - Delete file (protected)

## Security Implementation

### Authentication & Authorization
- JWT tokens with 7-day expiration
- Password hashing using bcryptjs with 12 salt rounds
- Protected routes using middleware authentication
- User isolation through ownership validation

### Data Protection
- Input validation and sanitization
- MongoDB injection prevention through Mongoose
- CORS configuration for allowed origins
- File upload restrictions (type and size limits)
- Soft deletion for data recovery

### API Security
- Rate limiting considerations for production
- Request timeout configurations
- Error handling without information leakage
- Secure headers and HTTPS enforcement

## Scalability Considerations

### Database Optimization
- Strategic indexing on frequently queried fields
- Compound indexes for complex queries
- Pagination for large result sets
- Soft deletion for performance

### Performance Optimization
- Connection pooling for database
- Efficient query patterns
- File upload streaming
- Response caching strategies

### Horizontal Scaling
- Stateless authentication with JWT
- Database connection management
- Load balancer compatibility
- Microservice-ready architecture

## Chat Flow Architecture

### Message Processing Pipeline
1. **User Input Validation**
   - Content sanitization
   - Length and format validation
   - Authentication verification

2. **Context Preparation**
   - Load project system prompt
   - Retrieve recent conversation history
   - Format messages for LLM API

3. **LLM Integration**
   - OpenAI API request with retry logic
   - Response processing and validation
   - Error handling and fallback responses

4. **Data Persistence**
   - Save user and assistant messages
   - Update chat timestamps
   - Maintain conversation context

### Real-time Features
- Optimistic UI updates for responsiveness
- Loading states and progress indicators
- Error recovery and retry mechanisms
- Message status tracking

## File Upload Architecture

### Upload Process
1. **Client-side Validation**
   - File type and size checking
   - Drag-and-drop interface
   - Progress indication

2. **Server Processing**
   - Multer middleware for multipart handling
   - File validation and security checks
   - Streaming to OpenAI Files API

3. **Integration**
   - File ID storage in project model
   - Metadata tracking and display
   - Deletion and cleanup handling

## Error Handling Strategy

### Client-side Error Handling
- Axios interceptors for global error handling
- User-friendly error messages
- Automatic token refresh logic
- Network error recovery

### Server-side Error Handling
- Global error middleware
- Structured error responses
- Logging and monitoring hooks
- Graceful degradation

## Deployment Architecture

### Development Environment
- Local MongoDB instance
- Environment variable configuration
- Hot reloading for development
- CORS configuration for local testing

### Production Considerations
- Database clustering and replication
- Environment-specific configurations
- SSL/TLS termination
- CDN for static assets
- Health check endpoints

## Monitoring and Observability

### Logging Strategy
- Structured logging with timestamps
- Error tracking and alerting
- Performance metrics collection
- User activity monitoring

### Health Monitoring
- Database connection health
- External API availability
- Response time tracking
- Error rate monitoring

## Future Extensibility

### Planned Enhancements
- WebSocket integration for real-time chat
- Multiple LLM provider support
- Advanced analytics and reporting
- Team collaboration features
- API rate limiting and quotas

### Architecture Flexibility
- Plugin system for custom integrations
- Configurable LLM providers
- Extensible authentication methods
- Modular component architecture

This architecture provides a solid foundation for a production-ready chatbot platform while maintaining flexibility for future enhancements and scaling requirements.