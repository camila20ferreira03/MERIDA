import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  HomeIcon,
  BeakerIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  PlusCircleIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { Leaf } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Management', href: '/management', icon: PlusCircleIcon },
  { name: 'Species', href: '/species', icon: BeakerIcon },
  { name: 'Responsibles', href: '/responsibles', icon: UserGroupIcon },
]

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/management')) return 'Management'
    if (path.includes('/species')) return 'Species Thresholds'
    if (path.includes('/responsibles')) return 'Alert Responsibles'
    return 'MERIDA Smart Grow'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-col bg-white">
            <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-green-600 to-emerald-600">
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-lg p-1.5">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-white text-lg font-bold">MERIDA </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group hover:bg-green-50 hover:text-green-600 flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-screen flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center px-6 bg-gradient-to-r from-green-600 to-emerald-600">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-lg p-1.5">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-white text-lg font-bold">MERIDA</span>
            </div>
          </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Decorative Navbar */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-lg">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button + Page title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <div className="hidden lg:block bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <h1 className="text-white font-semibold text-lg">{getPageTitle()}</h1>
                </div>
                <div className="lg:hidden">
                  <div className="flex items-center gap-2">
                    <div className="bg-white rounded-lg p-1">
                      <Leaf className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-white text-lg font-bold">MERIDA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Notifications + User */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
                  <p className="text-xs text-white/80">Administrator</p>
                </div>
                <button className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors">
                  <UserCircleIcon className="h-8 w-8" />
                </button>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg px-4 py-2 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Decorative bottom border */}
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
