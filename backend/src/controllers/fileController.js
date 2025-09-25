import multer from 'multer'
import axios from 'axios'
import FormData from 'form-data'
import Project from '../models/Project.js'
import config from '../config.js'

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'text/plain',
      'text/csv',
      'application/json',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('File type not supported'), false)
    }
  }
})

export const uploadMiddleware = upload.single('file')

export async function uploadFile(req, res) {
  try {
    const { projectId } = req.params
    const file = req.file

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      })
    }

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId,
      isActive: true
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    if (!config.openaiKey) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key not configured'
      })
    }

    try {
      // Create FormData for OpenAI Files API
      const formData = new FormData()
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      })
      formData.append('purpose', 'assistants')

      // Upload to OpenAI Files API
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/files',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${config.openaiKey}`,
            ...formData.getHeaders()
          }
        }
      )

      const fileData = openaiResponse.data

      // Add file ID to project
      project.fileIds.push(fileData.id)
      await project.save()

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          file: {
            id: fileData.id,
            filename: fileData.filename,
            bytes: fileData.bytes,
            createdAt: new Date(fileData.created_at * 1000),
            purpose: fileData.purpose
          }
        }
      })

    } catch (openaiError) {
      console.error('OpenAI Files API error:', openaiError.response?.data || openaiError.message)
      
      res.status(500).json({
        success: false,
        message: 'Error uploading file to OpenAI',
        error: openaiError.response?.data?.error?.message || 'Unknown error'
      })
    }

  } catch (error) {
    console.error('Upload file error:', error)
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    })
  }
}

export async function getProjectFiles(req, res) {
  try {
    const { projectId } = req.params

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId,
      isActive: true
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    if (!config.openaiKey || project.fileIds.length === 0) {
      return res.json({
        success: true,
        data: {
          files: []
        }
      })
    }

    try {
      // Get file details from OpenAI
      const filePromises = project.fileIds.map(async (fileId) => {
        try {
          const response = await axios.get(
            `https://api.openai.com/v1/files/${fileId}`,
            {
              headers: {
                'Authorization': `Bearer ${config.openaiKey}`
              }
            }
          )
          return response.data
        } catch (error) {
          console.error(`Error fetching file ${fileId}:`, error.message)
          return null
        }
      })

      const fileResults = await Promise.all(filePromises)
      const validFiles = fileResults.filter(file => file !== null)

      res.json({
        success: true,
        data: {
          files: validFiles.map(file => ({
            id: file.id,
            filename: file.filename,
            bytes: file.bytes,
            createdAt: new Date(file.created_at * 1000),
            purpose: file.purpose
          }))
        }
      })

    } catch (error) {
      console.error('Error fetching file details:', error)
      res.json({
        success: true,
        data: {
          files: []
        }
      })
    }

  } catch (error) {
    console.error('Get project files error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching project files'
    })
  }
}

export async function deleteFile(req, res) {
  try {
    const { projectId, fileId } = req.params

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId,
      isActive: true
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    // Check if file exists in project
    if (!project.fileIds.includes(fileId)) {
      return res.status(404).json({
        success: false,
        message: 'File not found in project'
      })
    }

    if (config.openaiKey) {
      try {
        // Delete from OpenAI
        await axios.delete(
          `https://api.openai.com/v1/files/${fileId}`,
          {
            headers: {
              'Authorization': `Bearer ${config.openaiKey}`
            }
          }
        )
      } catch (openaiError) {
        console.error('Error deleting file from OpenAI:', openaiError.message)
        // Continue with local deletion even if OpenAI deletion fails
      }
    }

    // Remove file ID from project
    project.fileIds = project.fileIds.filter(id => id !== fileId)
    await project.save()

    res.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Delete file error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    })
  }
}