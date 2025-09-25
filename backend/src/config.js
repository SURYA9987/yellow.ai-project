import dotenv from 'dotenv'
dotenv.config()

export default {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/chattyagent',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  openaiKey: process.env.OPENAI_API_KEY,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development'
}