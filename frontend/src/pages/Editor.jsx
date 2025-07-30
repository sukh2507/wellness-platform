"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import AutoSaveToast from "../components/AutoSaveToast"
import { useDebounce } from "../hooks/useDebounce"
import { Save, Upload, Tag, LinkIcon, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

function Editor() {
  const [sessionData, setSessionData] = useState({
    title: "",
    content: "",
    tags: "",
    save_file_url: "",
    status: "draft",
  })
  const [autoSaveStatus, setAutoSaveStatus] = useState(null)
  const [showAutoSaveToast, setShowAutoSaveToast] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  
  const location = useLocation()
  const navigate = useNavigate()
  const { user, getToken } = useAuth()
  const searchParams = new URLSearchParams(location.search)
  const sessionId = searchParams.get("id")

  // Debounce the session data for auto-save
  const debouncedSessionData = useDebounce(sessionData, 5000)

  // Check authentication
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access the editor')
      navigate('/login')
    }
  }, [user, navigate])

  // Load session data if editing existing session
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId || !user) {
        setInitialLoad(false)
        return
      }

      const token = getToken()
      if (!token) {
        navigate('/login')
        return
      }

      try {
        setLoading(true)
        // Use the dedicated route for loading user's own session for editing
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sessions/my-sessions/${sessionId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Session not found')
          } else if (response.status === 403) {
            throw new Error('You do not have permission to edit this session')
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }

        const data = await response.json()
        
        if (data.success) {
          const session = data.data.session
          setSessionData({
            title: session.title || "",
            content: session.content || "",
            tags: session.tags ? session.tags.join(", ") : "",
            save_file_url: session.save_file_url || "",
            status: session.status || "draft",
          })
        } else {
          throw new Error(data.message || 'Failed to load session')
        }
      } catch (error) {
        console.error('Error loading session:', error)
        toast.error(`Failed to load session: ${error.message}`)
        // If session not found or access denied, redirect to dashboard
        if (error.message.includes('not found') || error.message.includes('permission')) {
          navigate('/dashboard')
        }
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    }

    loadSession()
  }, [sessionId, user, getToken, navigate])

  // Auto-save effect
  useEffect(() => {
    if (initialLoad || !sessionId || !user) return

    if (debouncedSessionData.title || debouncedSessionData.content || debouncedSessionData.save_file_url) {
      handleAutoSave()
    }
  }, [debouncedSessionData, sessionId, initialLoad, user])

  const handleAutoSave = async () => {
    const token = getToken()
    if (!token || !sessionId) return

    setAutoSaveStatus("saving")
    setShowAutoSaveToast(true)

    try {
      const tagsArray = sessionData.tags 
        ? sessionData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sessions/my-sessions/${sessionId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: sessionData.title,
            content: sessionData.content,
            tags: tagsArray,
            save_file_url: sessionData.save_file_url,
            status: sessionData.status
          }),
        }
      )

      if (response.ok) {
        setAutoSaveStatus("saved")
      } else {
        setAutoSaveStatus("error")
      }
    } catch (error) {
      console.error('Auto-save error:', error)
      setAutoSaveStatus("error")
    }
  }

  const handleInputChange = (field, value) => {
    setSessionData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async (publishStatus = "draft") => {
    const token = getToken()
    if (!token) {
      toast.error('Please log in to save sessions')
      return
    }

    if (!sessionData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (publishStatus === "published" && !sessionData.content.trim()) {
      toast.error('Please enter content before publishing')
      return
    }

    setSaving(true)

    try {
      const tagsArray = sessionData.tags 
        ? sessionData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []

      const payload = {
        title: sessionData.title,
        content: sessionData.content,
        tags: tagsArray,
        save_file_url: sessionData.save_file_url,
      }

      let url, method
      if (sessionId) {
        // Update existing session
        url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sessions/my-sessions/${sessionId}`
        method = 'PUT'
        payload.status = publishStatus
      } else {
        // Create new session
        if (publishStatus === "published") {
          url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sessions/my-sessions/publish`
        } else {
          url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sessions/my-sessions/save-draft`
        }
        method = 'POST'
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSessionData(prev => ({ ...prev, status: publishStatus }))
        
        if (publishStatus === "published") {
          toast.success('Session published successfully!')
        } else {
          toast.success('Draft saved successfully!')
        }

        // If this was a new session, redirect to edit mode
        if (!sessionId && data.data.session._id) {
          navigate(`/editor?id=${data.data.session._id}`, { replace: true })
        }
      } else {
        throw new Error(data.message || 'Failed to save session')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save session. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDraft = () => handleSave("draft")
  const handlePublish = () => handleSave("published")

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <Navbar />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="glass rounded-xl p-8 flex items-center space-x-4">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-gray-600">Loading session...</span>
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {sessionId ? "Edit Session" : "Create New Session"}
            </h1>
            <p className="text-gray-600">
              {sessionId ? "Update your wellness session" : "Design your wellness session"}
            </p>
          </div>

          <div className="glass gradient-glow rounded-xl p-8 space-y-8">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Session Title</label>
              <input
                type="text"
                value={sessionData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="input-field text-lg"
                placeholder="Enter session title..."
                disabled={saving}
              />
            </div>

            {/* Content Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Session Content</label>
              <textarea
                value={sessionData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="input-field min-h-[200px] resize-y"
                placeholder="Describe your wellness session..."
                disabled={saving}
              />
            </div>

            {/* Tags Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={sessionData.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  className="input-field pl-10"
                  placeholder="meditation, relaxation, mindfulness (comma-separated)"
                  disabled={saving}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            {/* Save File URL Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Save File URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="url"
                  value={sessionData.save_file_url}
                  onChange={(e) => handleInputChange("save_file_url", e.target.value)}
                  className="input-field pl-10"
                  placeholder="https://api.example.com/session-data.json"
                  disabled={saving}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">URL to your session configuration JSON file</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-purple-200">
              <button 
                onClick={handleSaveDraft} 
                disabled={saving}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>Save Draft</span>
              </button>

              <button 
                onClick={handlePublish} 
                disabled={saving}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
                <span>Publish Session</span>
              </button>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-between pt-4 border-t border-purple-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    sessionData.status === "published"
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                      : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {sessionData.status}
                </span>
              </div>

              <div className="text-xs text-gray-500">
                {sessionId ? "Auto-save enabled" : "Save to enable auto-save"}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AutoSaveToast 
        isVisible={showAutoSaveToast} 
        status={autoSaveStatus || "saved"} 
        onHide={() => setShowAutoSaveToast(false)}
      />
    </div>
  )
}

export default Editor