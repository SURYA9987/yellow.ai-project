import express from 'express'
import { 
  uploadFile, 
  getProjectFiles, 
  deleteFile,
  uploadMiddleware 
} from '../controllers/fileController.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// All file routes require authentication
router.use(requireAuth)

router.post('/:projectId', uploadMiddleware, uploadFile)
router.get('/:projectId', getProjectFiles)
router.delete('/:projectId/:fileId', deleteFile)

export default router