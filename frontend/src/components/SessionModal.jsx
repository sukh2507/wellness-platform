import { useState, useEffect } from "react"
import { 
  Calendar, 
  Tag, 
  ExternalLink, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  User,
  Clock,
  FileText,
  Link
} from "lucide-react"

function SessionModal({ session, isOpen, onClose, onEdit, onDelete, isOwner = false }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEdit = () => {
    onEdit?.(session.id)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      onDelete?.(session.id)
      onClose()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const openJsonUrl = () => {
    if (session.jsonUrl) {
      window.open(session.jsonUrl, '_blank')
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
     <div 
  className={`glass rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 bg-gradient-to-br from-purple-500 via-pink-400 to-yellow-300 ${
    isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
  }`}
> 
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-purple-100">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {session.title || "Untitled Session"}
            </h2>
            
            {/* Status Badge */}
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                session.status === "published"
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                  : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-200"
              }`}
            >
              {session.status}
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Author Info */}
          {session.author && (
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Created by</p>
                <p className="font-semibold text-gray-800">{session.author}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {session.tags && session.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Tag className="h-5 w-5 text-purple-500 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {session.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-lg border border-purple-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Session File */}
          {session.jsonUrl && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FileText className="h-5 w-5 text-purple-500 mr-2" />
                Session File
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Link className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">
                      {session.jsonUrl}
                    </span>
                  </div>
                  <button
                    onClick={openJsonUrl}
                    className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-md hover:bg-purple-200 transition-colors flex items-center space-x-1 flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.createdAt && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">Created</span>
                </div>
                <p className="text-sm text-blue-600">{formatDate(session.createdAt)}</p>
              </div>
            )}

            {session.updatedAt && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Last Updated</span>
                </div>
                <p className="text-sm text-green-600">{formatDate(session.updatedAt)}</p>
              </div>
            )}
          </div>

          {/* Description/Additional Info */}
          {session.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{session.description}</p>
            </div>
          )}
        </div>

        {/* Actions Footer */}
<div className="flex items-center justify-between p-6 border-t border-purple-100 bg-gradient-to-r from-purple-400 via-pink-300 to-yellow-200 shadow-md">
          <div className="flex items-center space-x-2">
            {!isOwner && (
              <div className="flex items-center text-sm text-black">
                <Eye className="h-4 w-4 mr-1" />
                <span>View Only</span>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Session</span>
              </button>
              
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionModal