import { useState, useEffect } from 'react'
import { filesAPI } from '../api/client'
import { Upload, X, File, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function FileUploader({ projectId, onClose }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)

  useEffect(() => {
    loadFiles()
  }, [projectId])

  const loadFiles = async () => {
    try {
      const response = await filesAPI.getProjectFiles(projectId)
      setFiles(response.data.data.files)
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const handleFileSelect = (selectedFiles) => {
    Array.from(selectedFiles).forEach(uploadFile)
  }

  const uploadFile = async (file) => {
    setUploading(true)
    setUploadStatus(null)

    try {
      const response = await filesAPI.upload(projectId, file)
      const uploadedFile = response.data.data.file
      
      setFiles(prev => [...prev, uploadedFile])
      setUploadStatus({
        type: 'success',
        message: `${file.name} uploaded successfully`
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.message || `Failed to upload ${file.name}`
      })
    } finally {
      setUploading(false)
      setTimeout(() => setUploadStatus(null), 5000)
    }
  }

  const deleteFile = async (fileId, filename) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return

    try {
      await filesAPI.delete(projectId, fileId)
      setFiles(prev => prev.filter(file => file.id !== fileId))
      setUploadStatus({
        type: 'success',
        message: `${filename} deleted successfully`
      })
    } catch (error) {
      console.error('Error deleting file:', error)
      setUploadStatus({
        type: 'error',
        message: `Failed to delete ${filename}`
      })
    }
    
    setTimeout(() => setUploadStatus(null), 3000)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = e.dataTransfer.files
    handleFileSelect(droppedFiles)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              File Manager
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Status Message */}
        {uploadStatus && (
          <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${
            uploadStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{uploadStatus.message}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Files
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop files here, or click to select files
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
              accept=".txt,.csv,.json,.pdf,.doc,.docx"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Select Files
                </>
              )}
            </label>
            <p className="text-xs text-gray-400 mt-2">
              Supported: TXT, CSV, JSON, PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>

          {/* Files List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Uploaded Files ({files.length})
            </h3>
            
            {files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <File className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {file.filename}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.bytes)} • {formatDate(file.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteFile(file.id, file.filename)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              How file uploads work
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Files are uploaded to OpenAI and associated with this project</li>
              <li>• Your AI agent can reference these files in conversations</li>
              <li>• Supported formats: text files, documents, and structured data</li>
              <li>• Files are automatically processed and indexed for search</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}