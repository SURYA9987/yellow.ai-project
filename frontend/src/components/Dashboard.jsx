import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsAPI, chatAPI, getToken, setToken } from '../api/client'
import AgentChat from './AgentChat'
import FileUploader from './FileUploader'
import { 
  Plus, 
  Bot, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Search,
  Edit3,
  Trash2,
  User,
  ChevronLeft,
  ChevronRight,
  Upload,
  Loader2
} from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [chats, setChats] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedChat, setSelectedChat] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showFileUploader, setShowFileUploader] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/login')
      return
    }

    const userData = localStorage.getItem('chattyagent_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    loadProjects()
  }, [navigate])

  useEffect(() => {
    if (selectedProject) {
      loadChats(selectedProject.id)
    }
  }, [selectedProject])

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll({ search: searchTerm })
      setProjects(response.data.data.projects)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChats = async (projectId) => {
    try {
      const response = await chatAPI.getAll({ projectId })
      setChats(response.data.data.chats)
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('chattyagent_user')
    navigate('/login')
  }

  const handleProjectSelect = (project) => {
    setSelectedProject(project)
    setSelectedChat(null)
  }

  const handleNewChat = async () => {
    if (!selectedProject) return
    
    try {
      const response = await chatAPI.create({
        projectId: selectedProject.id,
        title: `Chat ${new Date().toLocaleDateString()}`
      })
      const newChat = response.data.data.chat
      setChats(prev => [newChat, ...prev])
      setSelectedChat(newChat)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this chat?')) return
    
    try {
      await chatAPI.delete(chatId)
      setChats(prev => prev.filter(chat => chat.id !== chatId))
      if (selectedChat?.id === chatId) {
        setSelectedChat(null)
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this project and all its chats?')) return
    
    try {
      await projectsAPI.delete(projectId)
      setProjects(prev => prev.filter(project => project.id !== projectId))
      if (selectedProject?.id === projectId) {
        setSelectedProject(null)
        setSelectedChat(null)
        setChats([])
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-white">ChattyAgent</h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          
          {!sidebarCollapsed && user && (
            <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-300 text-sm truncate">{user.name || user.email}</span>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search projects..."
                />
              </div>
            </div>

            {/* Projects Section */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  AI Agents
                </h2>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                  title="Create New Agent"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`group relative rounded-lg transition-colors ${
                      selectedProject?.id === project.id
                        ? 'bg-blue-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <button
                      onClick={() => handleProjectSelect(project)}
                      className="w-full text-left p-3 pr-8"
                    >
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <div className="min-w-0">
                          <span className="block truncate text-gray-300 font-medium">
                            {project.name}
                          </span>
                          {project.description && (
                            <span className="block truncate text-xs text-gray-500">
                              {project.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingProject(project)
                          setShowProjectModal(true)
                        }}
                        className="p-1 hover:bg-blue-600/20 rounded transition-all"
                        title="Edit Agent"
                      >
                        <Edit3 className="w-3 h-3 text-blue-400" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="p-1 hover:bg-red-600/20 rounded transition-all"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chats Section */}
            {selectedProject && (
              <div className="flex-1 p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Conversations
                  </h2>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowFileUploader(true)}
                      className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                      title="Upload Files"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNewChat}
                      className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                      title="New Chat"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1 overflow-y-auto">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group relative rounded-lg transition-colors ${
                        selectedChat?.id === chat.id
                          ? 'bg-blue-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedChat(chat)}
                        className="w-full text-left p-3 pr-8"
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span className="truncate text-gray-300">{chat.title}</span>
                        </div>
                      </button>
                      
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600/20 rounded transition-all"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className={`${sidebarCollapsed ? 'w-full justify-center' : 'w-full justify-start'} flex items-center gap-2 p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {selectedProject && selectedChat ? (
          <AgentChat 
            project={selectedProject} 
            chat={selectedChat}
            onChatUpdate={(updatedChat) => {
              setChats(prev => prev.map(chat => 
                chat.id === updatedChat.id ? updatedChat : chat
              ))
            }}
          />
        ) : selectedProject ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Create a new chat to start talking with your AI agent "{selectedProject.name}".
              </p>
              <button
                onClick={handleNewChat}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {projects.length === 0 ? 'Create your first AI agent' : 'Select an agent'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {projects.length === 0 
                  ? 'Get started by creating your first AI agent with custom prompts and behavior.'
                  : 'Choose an agent from the sidebar to start chatting.'
                }
              </p>
              {projects.length === 0 && (
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Agent
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false)
          setEditingProject(null)
        }}
        project={editingProject}
        onProjectSaved={(project) => {
          if (editingProject) {
            setProjects(prev => prev.map(p => p.id === project.id ? project : p))
            if (selectedProject?.id === project.id) {
              setSelectedProject(project)
            }
          } else {
            setProjects(prev => [project, ...prev])
            setSelectedProject(project)
          }
          setShowProjectModal(false)
          setEditingProject(null)
        }}
      />

      {showFileUploader && selectedProject && (
        <FileUploader
          projectId={selectedProject.id}
          onClose={() => setShowFileUploader(false)}
        />
      )}
    </div>
  )
}

// Project Modal Component
function ProjectModal({ isOpen, onClose, project, onProjectSaved }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        systemPrompt: project.systemPrompt || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        systemPrompt: 'You are a helpful AI assistant.'
      })
    }
    setError('')
  }, [project, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let response
      if (project) {
        response = await projectsAPI.update(project.id, formData)
      } else {
        response = await projectsAPI.create(formData)
      }
      
      onProjectSaved(response.data.data.project)
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving project')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {project ? 'Edit AI Agent' : 'Create New AI Agent'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-500 rotate-45" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Customer Support Bot"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of your agent's purpose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Prompt
            </label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Define your agent's personality, role, and behavior..."
            />
            <p className="mt-2 text-sm text-gray-500">
              The system prompt defines how your AI agent behaves and responds to users.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : (project ? 'Update Agent' : 'Create Agent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}