import express from 'express'
import { register, login, getProfile, updateProfile } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)

// Protected routes
router.get('/profile', requireAuth, getProfile)
router.put('/profile', requireAuth, updateProfile)

export default router