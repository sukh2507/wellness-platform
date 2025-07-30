import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { Toaster } from "react-hot-toast"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import MySessions from "./pages/MySessions"
import Editor from "./pages/Editor"
import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-sessions"
            element={
              <ProtectedRoute>
                <MySessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(255, 255, 255, 0.95)",
              color: "#374151",
              border: "1px solid rgba(147, 51, 234, 0.2)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.1)",
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default App
