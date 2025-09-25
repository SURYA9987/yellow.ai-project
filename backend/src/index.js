import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import config from './config.js'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import chatRoutes from './routes/chat.js'
import fileRoutes from './routes/files.js'

const app = express()

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ChattyAgent API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/files', fileRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error)
  
  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    })
  }
  
  if (error.message === 'File type not supported') {
    return res.status(400).json({
      success: false,
      message: 'File type not supported'
    })
  }

  // MongoDB errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map(e => e.message)
    })
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry'
    })
  }

  // Default error
  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'development' ? error.message : 'Internal server error'
  })
})

// Database connection and server startup
async function startServer() {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    
    console.log('✅ Connected to MongoDB')
    
    app.listen(config.port, () => {
      console.log(`🚀 ChattyAgent API server running on port ${config.port}`)
      console.log(`📍 Environment: ${config.nodeEnv}`)
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await mongoose.connection.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  await mongoose.connection.close()
  process.exit(0)
})

startServer()