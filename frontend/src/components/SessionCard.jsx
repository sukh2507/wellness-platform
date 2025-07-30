import { useState } from "react"
import { Calendar, Tag, ExternalLink, Trash2, Edit, Eye } from "lucide-react"
import SessionModal from "./SessionModal" // Make sure this path is correct

function SessionCard({ session, onClick, onDelete, onEdit, showActions = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleCardClick = (e) => {
    // Don't trigger onClick if user clicked on action buttons
    if (e.target.closest('.action-button')) return
    setIsModalOpen(true)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(session.id)
  }

  return (
    <>
      <div 
        className="glass rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group animate-fade-in"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
              {session.title || "Untitled Session"}
            </h3>

            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${
                session.status === "published"
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                  : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-200"
              }`}
            >
              {session.status}
            </span>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="action-button p-2 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(session.id)
                }}
                title="Edit session"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                className="action-button p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                onClick={handleDelete}
                title="Delete session"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {session.tags && session.tags.length > 0 && (
          <div className="flex items-center mb-4">
            <Tag className="h-4 w-4 text-purple-500 mr-2" />
            <div className="flex flex-wrap gap-1">
              {session.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {session.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                  +{session.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {session.jsonUrl && (
          <div className="flex items-center mb-4 text-sm text-gray-600">
            <ExternalLink className="h-4 w-4 mr-2" />
            <span className="truncate">
              {session.jsonUrl.length > 40 
                ? `${session.jsonUrl.substring(0, 40)}...` 
                : session.jsonUrl
              }
            </span>
          </div>
        )}

        {session.author && (
          <div className="flex items-center mb-4 text-sm text-gray-600">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 mr-2"></div>
            <span>by {session.author}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-purple-100">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              {session.updatedAt 
                ? `Updated ${formatDate(session.updatedAt)}`
                : session.createdAt 
                  ? `Created ${formatDate(session.createdAt)}`
                  : 'No date'
              }
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {!showActions && (
              <div className="flex items-center text-xs text-purple-600">
                <Eye className="h-3 w-3 mr-1" />
                <span>View</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <SessionModal
        session={session}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={onEdit}
        onDelete={onDelete}
        isOwner={showActions}
      />
    </>
  )
}

export default SessionCard
