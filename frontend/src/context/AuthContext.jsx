import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`

  useEffect(() => {
    const token = localStorage.getItem("wellness_token")
    const userData = localStorage.getItem("wellness_user")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login request to:', `${API_BASE_URL}/login`)
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      console.log('AuthContext: Login response status:', response.status)
      
      const data = await response.json()
      console.log('AuthContext: Login response data:', data)

      if (response.ok && data.success) {
        const { user: userData, token } = data.data

        // Store token and user data
        localStorage.setItem("wellness_token", token)
        localStorage.setItem("wellness_user", JSON.stringify(userData))
        setUser(userData)

        return true
      } else {
        console.error('Login failed:', data.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (email, password, name) => {
    try {
      console.log('AuthContext: Starting register request to:', `${API_BASE_URL}/register`)
      console.log('AuthContext: Register payload:', { email, name, password: '***' })
      
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      })

      console.log('AuthContext: Register response status:', response.status)
      console.log('AuthContext: Register response headers:', Object.fromEntries(response.headers.entries()))
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('AuthContext: Response is not JSON, content-type:', contentType)
        const textResponse = await response.text()
        console.error('AuthContext: Response text:', textResponse)
        return false
      }

      const data = await response.json()
      console.log('AuthContext: Register response data:', data)

      if (response.ok && data.success) {
        const { user: userData, token } = data.data

        // Store token and user data
        localStorage.setItem("wellness_token", token)
        localStorage.setItem("wellness_user", JSON.stringify(userData))
        setUser(userData)

        return true
      } else {
        console.error('Registration failed:', data.message || 'Unknown error')
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("wellness_token")
    localStorage.removeItem("wellness_user")
    setUser(null)
    navigate("/login")
  }

  // Optional: Function to get the stored token
  const getToken = () => {
    return localStorage.getItem("wellness_token")
  }

  // Optional: Function to refresh token
  const refreshToken = async () => {
    const token = getToken()
    if (!token) return false

    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const newToken = data.data.token
        localStorage.setItem("wellness_token", newToken)
        return true
      } else {
        // Token refresh failed, logout user
        logout()
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register, 
        logout, 
        loading, 
        getToken, 
        refreshToken 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}