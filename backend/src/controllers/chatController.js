import Chat from '../models/Chat.js'
import Project from '../models/Project.js'
import axios from 'axios'
import config from '../config.js'

export async function createChat(req, res) {
  try {
    const { projectId, title } = req.body

    // Validation
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
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

    const chat = new Chat({
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      project: projectId,
      owner: req.userId,
      messages: []
    })

    await chat.save()

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: {
        chat: {
          id: chat._id,
          title: chat.title,
          projectId: chat.project,
          messages: chat.messages,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        }
      }
    })
  } catch (error) {
    console.error('Create chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating chat'
    })
  }
}

export async function getChats(req, res) {
  try {
    const { projectId } = req.query
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    // Build query
    const query = {
      owner: req.userId,
      isActive: true
    }

    if (projectId) {
      query.project = projectId
    }

    const chats = await Chat.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('project', 'name')
      .select('-messages -__v')

    const total = await Chat.countDocuments(query)

    res.json({
      success: true,
      data: {
        chats: chats.map(chat => ({
          id: chat._id,
          title: chat.title,
          projectId: chat.project._id,
          projectName: chat.project.name,
          messageCount: 0, // We excluded messages for performance
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
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
    console.error('Get chats error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching chats'
    })
  }
}

export async function getChat(req, res) {
  try {
    const { id } = req.params

    const chat = await Chat.findOne({
      _id: id,
      owner: req.userId,
      isActive: true
    })
      .populate('project', 'name systemPrompt')
      .select('-__v')

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    res.json({
      success: true,
      data: {
        chat: {
          id: chat._id,
          title: chat.title,
          project: {
            id: chat.project._id,
            name: chat.project.name,
            systemPrompt: chat.project.systemPrompt
          },
          messages: chat.messages.map(msg => ({
            id: msg._id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        }
      }
    })
  } catch (error) {
    console.error('Get chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching chat'
    })
  }
}

export async function sendMessage(req, res) {
  try {
    const { chatId, message } = req.body

    // Validation
    if (!chatId || !message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and message are required'
      })
    }

    // Find chat and verify ownership
    const chat = await Chat.findOne({
      _id: chatId,
      owner: req.userId,
      isActive: true
    }).populate('project', 'systemPrompt fileIds')

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    chat.messages.push(userMessage)

    // Prepare messages for OpenAI API
    const messages = [
      {
        role: 'system',
        content: chat.project.systemPrompt || 'You are a helpful AI assistant.'
      },
      ...chat.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    try {
      // Call OpenAI API
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${config.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const aiResponse = openaiResponse.data.choices[0]?.message?.content || 
        'I apologize, but I was unable to generate a response.'

      // Add AI response to chat
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      chat.messages.push(assistantMessage)
      await chat.save()

      res.json({
        success: true,
        data: {
          userMessage: {
            id: userMessage._id,
            role: userMessage.role,
            content: userMessage.content,
            timestamp: userMessage.timestamp
          },
          assistantMessage: {
            id: assistantMessage._id,
            role: assistantMessage.role,
            content: assistantMessage.content,
            timestamp: assistantMessage.timestamp
          }
        }
      })

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError.response?.data || openaiError.message)
      
      // Still save user message, but provide error response
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }

      chat.messages.push(errorMessage)
      await chat.save()

      res.json({
        success: true,
        data: {
          userMessage: {
            id: userMessage._id,
            role: userMessage.role,
            content: userMessage.content,
            timestamp: userMessage.timestamp
          },
          assistantMessage: {
            id: errorMessage._id,
            role: errorMessage.role,
            content: errorMessage.content,
            timestamp: errorMessage.timestamp
          }
        }
      })
    }

  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    })
  }
}

export async function deleteChat(req, res) {
  try {
    const { id } = req.params

    const chat = await Chat.findOneAndUpdate(
      { _id: id, owner: req.userId, isActive: true },
      { isActive: false },
      { new: true }
    )

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    })
  } catch (error) {
    console.error('Delete chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting chat'
    })
  }
}