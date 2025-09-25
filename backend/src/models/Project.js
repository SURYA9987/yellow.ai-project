import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  systemPrompt: {
    type: String,
    default: 'You are a helpful AI assistant.'
  },
  fileIds: [{
    type: String // OpenAI file IDs
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
})

// Indexes for faster queries
projectSchema.index({ owner: 1, createdAt: -1 })
projectSchema.index({ owner: 1, name: 1 })

export default mongoose.model('Project', projectSchema)