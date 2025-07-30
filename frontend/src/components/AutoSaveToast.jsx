"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock } from "lucide-react"

function AutoSaveToast({ isVisible, status }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="glass gradient-glow rounded-xl px-4 py-3 flex items-center space-x-2 animate-fade-in-up">
        {status === "saving" ? (
          <>
            <Clock className="h-4 w-4 text-yellow-600 animate-spin" />
            <span className="text-sm text-yellow-700">Auto-saving...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">Auto-saved</span>
          </>
        )}
      </div>
    </div>
  )
}

export default AutoSaveToast
