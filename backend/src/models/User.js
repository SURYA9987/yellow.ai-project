import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  name: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
})

// Index for faster queries
userSchema.index({ email: 1 })

export default mongoose.model('User', userSchema)