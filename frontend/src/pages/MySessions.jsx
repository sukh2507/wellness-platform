"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import SessionCard from "../components/SessionCard"
import { Plus, Loader2, Search, Filter, FileText, Eye } from "lucide-react"
import toast from "react-hot-toast"

function MySessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState({ total: 0, draft: 0, published: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSessions: 0
  })
  
  const navigate = useNavigate()
  const { user, getToken } = useAuth()

  // Check authentication
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to view your sessions')
      navigate('/login')
    }
  }, [user, navigate])

  // Fetch user's sessions from API
  const fetchMySessions = async (page = 1, search = "", status = "all") => {
    try {
      setLoading(true)
      setError(null)
      
      const token = getToken()
      if (!token) {
        navigate('/login')
        return
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })
      
      if (search.trim()) {
        params.append('search', search.trim())
      }
      
      if (status !== 'all') {
        params.append('status', status)
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sessions/my-sessions?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please log in again')
          navigate('/login')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSessions(data.data.sessions || [])
        setSummary(data.data.summary || { total: 0, draft: 0, published: 0 })
        setPagination(data.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalSessions: 0
        })
      } else {
        throw new Error(data.message || 'Failed to fetch sessions')
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      setError(error.message)
      toast.error('Failed to load your sessions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMySessions(1, searchTerm, statusFilter)
    }
  }, [user, searchTerm, statusFilter])

  const handleSessionClick = (sessionId) => {
    navigate(`/editor?id=${sessionId}`)
  }

  const handleCreateNew = () => {
    navigate("/editor")
  }

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return
    }

    try {
      const token = getToken()
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sessions/my-sessions/${sessionId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Session deleted successfully')
        // Refresh sessions list
        fetchMySessions(pagination.currentPage, searchTerm, statusFilter)
      } else {
        throw new Error(data.message || 'Failed to delete session')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete session. Please try again.')
    }
  }

  const handlePageChange = (newPage) => {
    fetchMySessions(newPage, searchTerm, statusFilter)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  if (loading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <Navbar />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="glass rounded-xl p-8 flex items-center space-x-4">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-gray-600">Loading your sessions...</span>
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
                  onClick={() => fetchMySessions(1, searchTerm, statusFilter)} 
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">My Sessions</h1>
              <p className="text-gray-600">Manage your wellness sessions</p>
            </div>
            <button onClick={handleCreateNew} className="btn-primary flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create New</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Drafts</p>
                  <p className="text-2xl font-bold text-gray-800">{summary.draft}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Published</p>
                  <p className="text-2xl font-bold text-gray-800">{summary.published}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="glass rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="input-field pl-10"
                  placeholder="Search sessions..."
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="input-field pl-10 pr-8 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Drafts</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sessions Grid */}
          {loading && sessions.length > 0 && (
            <div className="text-center mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600 mx-auto" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                    updatedAt: session.updated_at
                  }} 
                  onClick={() => handleSessionClick(session._id)}
                  onDelete={() => handleDeleteSession(session._id)}
                  showActions={true} // Show edit/delete for user's own sessions
                />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sessions.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="glass rounded-xl p-8 max-w-md mx-auto">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No sessions match your search' 
                    : 'No sessions yet'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first wellness session to get started'
                  }
                </p>
                <button onClick={handleCreateNew} className="btn-primary">
                  Create Session
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MySessions