import express from 'express'
import { 
  createProject, 
  getProjects, 
  getProject, 
  updateProject, 
  deleteProject 
} from '../controllers/projectController.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// All project routes require authentication
router.use(requireAuth)

router.post('/', createProject)
router.get('/', getProjects)
router.get('/:id', getProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

export default router