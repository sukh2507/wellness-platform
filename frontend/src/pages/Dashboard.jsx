"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import SessionCard from "../components/SessionCard"
import { Plus, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user, getToken } = useAuth()

  // Fetch public sessions from API
  const fetchPublicSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = getToken()
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add authorization header if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sessions`, 
        {
          method: 'GET',
          headers,
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSessions(data.data.sessions || [])
      } else {
        throw new Error(data.message || 'Failed to fetch sessions')
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      setError(error.message)
      toast.error('Failed to load sessions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicSessions()
  }, [])

  const handleSessionClick = (sessionId) => {
    if (!user) {
      toast.error('Please log in to view session details')
      navigate('/login')
      return
    }
    
    // For public sessions viewed from dashboard, we can either:
    // 1. Navigate to a read-only view
    // 2. Navigate to editor if user owns the session
    // For now, let's navigate to editor (it will handle permissions)
    navigate(`/editor?id=${sessionId}`)
  }

  const handleCreateNew = () => {
    if (!user) {
      toast.error('Please log in to create sessions')
      navigate('/login')
      return
    }
    navigate("/editor")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <Navbar />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="glass rounded-xl p-8 flex items-center space-x-4">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-gray-600">Loading wellness sessions...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <Navbar />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="glass rounded-xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Sessions</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={fetchPublicSessions} 
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Navbar />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
              <p className="text-gray-600">Discover published wellness sessions</p>
            </div>
            <button onClick={handleCreateNew} className="btn-primary flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create New</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session, index) => (
              <div key={session._id} style={{ animationDelay: `${index * 100}ms` }}>
                <SessionCard 
                  session={{
                    id: session._id,
                    title: session.title,
                    tags: session.tags || [],
                    jsonUrl: session.save_file_url,
                    status: session.status,
                    createdAt: session.created_at,
                    updatedAt: session.updated_at,
                    author: session.user_id?.email
                  }} 
                  onClick={() => handleSessionClick(session._id)} 
                  showActions={false} // Don't show edit/delete for public sessions
                />
              </div>
            ))}
          </div>

          {sessions.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="glass rounded-xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No sessions found</h3>
                <p className="text-gray-600 mb-4">Be the first to create a wellness session</p>
                <button onClick={handleCreateNew} className="btn-primary">
                  Create Session
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard