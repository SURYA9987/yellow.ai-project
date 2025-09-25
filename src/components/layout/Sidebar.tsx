import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { useChats } from '../../hooks/useChats';
import { 
  Plus, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Bot, 
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit
} from 'lucide-react';
import type { Project, Chat } from '../../types';

interface SidebarProps {
  selectedProject?: Project;
  selectedChat?: Chat;
  onProjectSelect: (project: Project) => void;
  onChatSelect: (chat: Chat) => void;
  onNewChat: () => void;
  onNewProject: () => void;
}

export function Sidebar({ 
  selectedProject, 
  selectedChat,
  onProjectSelect,
  onChatSelect,
  onNewChat,
  onNewProject
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const { projects } = useProjects();
  const { chats, deleteChat } = useChats(selectedProject?.id);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChatDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      await deleteChat(chatId);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div className="flex-1 space-y-2 p-2">
          <button
            onClick={onNewProject}
            className="w-full h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            title="New Project"
          >
            <Bot className="w-5 h-5 text-gray-400" />
          </button>
          
          <button
            onClick={onNewChat}
            disabled={!selectedProject}
            className="w-full h-10 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded-lg flex items-center justify-center transition-colors"
            title="New Chat"
          >
            <MessageCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-2">
          <button
            onClick={signOut}
            className="w-full h-10 bg-red-600/20 hover:bg-red-600/30 rounded-lg flex items-center justify-center transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">ChatBot Platform</h1>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-gray-300 text-sm truncate">{user?.email}</span>
        </div>
      </div>

      {/* Projects Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Projects
          </h2>
          <button
            onClick={onNewProject}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title="New Project"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onProjectSelect(project)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedProject?.id === project.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{project.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chats Section */}
      {selectedProject && (
        <div className="flex-1 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Chats
            </h2>
            <button
              onClick={onNewChat}
              className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
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
                  onClick={() => onChatSelect(chat)}
                  className="w-full text-left p-3 pr-8"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate text-gray-300">{chat.title}</span>
                  </div>
                </button>
                
                <button
                  onClick={(e) => handleChatDelete(chat.id, e)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600/20 rounded transition-all"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}