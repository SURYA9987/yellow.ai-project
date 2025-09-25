import express from 'express'
import { 
  createChat, 
  getChats, 
  getChat, 
  sendMessage, 
  deleteChat 
} from '../controllers/chatController.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// All chat routes require authentication
router.use(requireAuth)

router.post('/', createChat)
router.get('/', getChats)
router.get('/:id', getChat)
router.post('/message', sendMessage)
router.delete('/:id', deleteChat)

export default router