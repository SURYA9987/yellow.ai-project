import jwt from 'jsonwebtoken'
import config from '../config.js'
import User from '../models/User.js'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token required' 
    })
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.userId = payload.id
    req.userEmail = payload.email
    next()
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    })
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]
  
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret)
      req.userId = payload.id
      req.userEmail = payload.email
    } catch (error) {
      // Token invalid, but continue without auth
    }
  }
  
  next()
}

export async function validateUser(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error validating user'
    })
  }
}