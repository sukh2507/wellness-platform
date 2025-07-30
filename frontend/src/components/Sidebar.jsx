"use client"
import { useLocation, Link } from "react-router-dom"
import { Home, FileText, Edit3, X } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Sessions", href: "/my-sessions", icon: FileText },
  { name: "Editor", href: "/editor", icon: Edit3 },
]

function Sidebar({ isOpen, onClose }) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-64 glass gradient-glow transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-purple-200/30">
          <h2 className="text-lg font-semibold gradient-text">Navigation</h2>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg glass-hover">
            <X className="h-5 w-5 text-purple-600" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
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
  )
}

export default Sidebar
