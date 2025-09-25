import Project from '../models/Project.js'
import Chat from '../models/Chat.js'

export async function createProject(req, res) {
  try {
    const { name, description, systemPrompt } = req.body

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      })
    }

    // Check for duplicate project names for this user
    const existingProject = await Project.findOne({
      owner: req.userId,
      name: name.trim()
    })

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: 'A project with this name already exists'
      })
    }

    const project = new Project({
      name: name.trim(),
      description: description?.trim() || '',
      systemPrompt: systemPrompt?.trim() || 'You are a helpful AI assistant.',
      owner: req.userId
    })

    await project.save()

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          systemPrompt: project.systemPrompt,
          fileIds: project.fileIds,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }
      }
    })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating project'
    })
  }
}

export async function getProjects(req, res) {
  try {
    const { page = 1, limit = 10, search } = req.query
    const skip = (page - 1) * limit

    // Build query
    const query = { 
      owner: req.userId,
      isActive: true
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Get projects with pagination
    const projects = await Project.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')

    // Get total count for pagination
    const total = await Project.countDocuments(query)

    res.json({
      success: true,
      data: {
        projects: projects.map(project => ({
          id: project._id,
          name: project.name,
          description: project.description,
          systemPrompt: project.systemPrompt,
          fileIds: project.fileIds,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    })
  }
}

export async function getProject(req, res) {
  try {
    const { id } = req.params

    const project = await Project.findOne({
      _id: id,
      owner: req.userId,
      isActive: true
    }).select('-__v')

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    res.json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          systemPrompt: project.systemPrompt,
          fileIds: project.fileIds,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }
      }
    })
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching project'
    })
  }
}

export async function updateProject(req, res) {
  try {
    const { id } = req.params
    const { name, description, systemPrompt } = req.body

    // Validation
    if (name && name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project name cannot be empty'
      })
    }

    // Check for duplicate names (excluding current project)
    if (name) {
      const existingProject = await Project.findOne({
        _id: { $ne: id },
        owner: req.userId,
        name: name.trim()
      })

      if (existingProject) {
        return res.status(409).json({
          success: false,
          message: 'A project with this name already exists'
        })
      }
    }

    const updateData = {}
    if (name) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt.trim()

    const project = await Project.findOneAndUpdate(
      { _id: id, owner: req.userId, isActive: true },
      updateData,
      { new: true, runValidators: true }
    ).select('-__v')

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          systemPrompt: project.systemPrompt,
          fileIds: project.fileIds,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }
      }
    })
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating project'
    })
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params

    // Soft delete the project
    const project = await Project.findOneAndUpdate(
      { _id: id, owner: req.userId, isActive: true },
      { isActive: false },
      { new: true }
    )

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    // Also soft delete associated chats
    await Chat.updateMany(
      { project: id, owner: req.userId },
      { isActive: false }
    )

    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting project'
    })
  }
}