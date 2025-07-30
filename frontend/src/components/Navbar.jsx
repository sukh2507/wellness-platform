"use client"
import { useState } from "react"
import { useLocation, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { LogOut, Menu, X, Home, FileText, Edit3 } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Sessions", href: "/my-sessions", icon: FileText },
  { name: "Editor", href: "/editor", icon: Edit3 },
]

function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <nav className="glass gradient-glow sticky top-0 z-50 px-4 py-3 border-b border-purple-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleMobileMenu} 
              className="lg:hidden p-2 rounded-lg glass-hover"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-purple-600" />
              ) : (
                <Menu className="h-5 w-5 text-purple-600" />
              )}
            </button>
            <h1 className="text-xl font-bold gradient-text">Wellness Platform</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md border border-purple-200"
                      : "text-gray-600 hover:text-purple-600 glass-hover"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-sm">
              <span className="text-gray-600">Welcome </span>
              <span className="text-purple-600 font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg glass-hover text-pink-600 hover:text-pink-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Mobile overlay */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 lg:hidden" 
            onClick={closeMobileMenu} 
          />
          
          {/* Mobile menu */}
          <div className="fixed top-16 left-0 right-0 z-50 mx-4 glass gradient-glow rounded-xl border border-purple-200/30 lg:hidden">
            <nav className="p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md border border-purple-200"
                            : "text-gray-600 hover:text-purple-600 glass-hover"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </>
      )}
    </>
  )
}

export default Navbar