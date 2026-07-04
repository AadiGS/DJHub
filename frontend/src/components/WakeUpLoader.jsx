import { useState, useEffect, useRef } from 'react'
import { checkHealth } from '../api/client'

export default function WakeUpLoader({ children }) {
  const [isAwake, setIsAwake] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    if (isAwake) return

    // Set timer to show loader after 1 second if still not awake
    const timer = setTimeout(() => {
      if (!isAwake && isMounted.current) {
        setShowLoader(true)
      }
    }, 1000)

    const ping = async () => {
      try {
        await checkHealth()
        if (isMounted.current) {
          setIsAwake(true)
          setShowLoader(false)
        }
      } catch (err) {
        // failed or timeout, do nothing and wait for interval
      }
    }

    // Ping immediately
    ping()

    // Setup interval to retry every 5 seconds if not awake
    const interval = setInterval(() => {
      if (!isAwake && isMounted.current) {
        ping()
      }
    }, 5000)

    return () => {
      isMounted.current = false
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [isAwake])

  if (isAwake || !showLoader) {
    if (!isAwake && !showLoader) {
      // It's in the first 1000ms. We don't render children to avoid triggering
      // actual API calls to a sleeping server. 
      return null
    }
    return children
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Fake Header */}
      <div className="w-full h-14 bg-white border-b border-slate-200 animate-pulse flex items-center px-4 md:px-6">
        <div className="h-8 w-24 bg-slate-200 rounded-md"></div>
        <div className="ml-auto h-8 w-8 bg-slate-200 rounded-full"></div>
      </div>
      
      {/* Fake body layout */}
      <div className="w-full max-w-7xl px-4 py-8 flex flex-col gap-6 animate-pulse">
        {/* Fake title */}
        <div className="h-8 w-64 bg-slate-200 rounded-md mx-auto mb-8 mt-12"></div>
        
        {/* Fake grid of cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-48 bg-white border border-slate-200 rounded-xl"></div>
          <div className="h-48 bg-white border border-slate-200 rounded-xl"></div>
          <div className="h-48 bg-white border border-slate-200 rounded-xl"></div>
          <div className="h-48 bg-white border border-slate-200 rounded-xl hidden md:block"></div>
        </div>
      </div>

      {/* Floating Overlay Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/50 backdrop-blur-sm">
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Waking up the server... 🚀</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Since this is a free app, the backend takes about 30 seconds to wake up. Thanks for your patience!
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
