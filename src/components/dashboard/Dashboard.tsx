import React, { useState } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { ChatInterface } from '../chat/ChatInterface';
import { ProjectModal } from '../modals/ProjectModal';
import { useProjects } from '../../hooks/useProjects';
import { useChats } from '../../hooks/useChats';
import { Bot, MessageCircle, Plus } from 'lucide-react';
import type { Project, Chat } from '../../types';

export function Dashboard() {
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [selectedChat, setSelectedChat] = useState<Chat | undefined>();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const { createChat } = useChats(selectedProject?.id);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedChat(undefined);
  };

  const handleNewProject = () => {
    setShowProjectModal(true);
  };

  const handleNewChat = async () => {
    if (!selectedProject) return;
    
    try {
      const chat = await createChat(`Chat ${new Date().toLocaleDateString()}`);
      setSelectedChat(chat);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleProjectCreated = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        selectedProject={selectedProject}
        selectedChat={selectedChat}
        onProjectSelect={handleProjectSelect}
        onChatSelect={setSelectedChat}
        onNewChat={handleNewChat}
        onNewProject={handleNewProject}
      />

      <main className="flex-1 flex flex-col">
        {selectedProject && selectedChat ? (
          <ChatInterface
            project={selectedProject}
            chat={selectedChat}
          />
        ) : selectedProject ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start a new conversation
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
                  onClick={handleNewProject}
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

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}