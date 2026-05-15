import { useState, } from "react"
import { Outlet, useNavigate, NavLink } from "react-router-dom"
import { useAuth } from "../auth/hooks/useAuth"
import { getDashboardNav } from "./dashboardNav"
import { Menu, LogOut, X } from "lucide-react"



export default function DashboardLayout() {
  const { user,  logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const role = user?.role ?? "GUEST"
  const groups = getDashboardNav(role)



  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const linkClass = (isActive: boolean) =>
    `group flex w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-orange-400 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-orange-500"
    }`

  const SidebarContent = () => (
    <>
      <div className="px-6 pt-3 pb-1">
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            role === "ADMIN"
              ? "bg-r-100 text-orange-600"
              : role === "HOST"
              ? "bg-orange-400 text-gray-100"
              : "bg-gray-200 text-orange-700"
          }`}
        >
          {role}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((group) => (
          <div key={group.heading}>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest px-3 mb-2">
              {group.heading}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to + item.label}>
                  <NavLink
                    to={item.to}
                    end
                    className={({ isActive }) => linkClass(isActive)}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    {({ isActive }) => (
                      <span className="flex items-center gap-3">
                        <item.Icon
                          size={18}
                          className={isActive ? "text-orange-500" : "text-gray-400 group-hover:text-orange-500"}
                        />
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 bg-amber-50">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-300 hover:text-gray-200 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar (drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white flex flex-col shrink-0 shadow-xl transform transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar (collapsible) */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-white border-r border-gray-100 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header — menu toggle only, no search bar here */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center px-4 sm:px-6 gap-4 shrink-0">
          {/* Desktop toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden lg:flex w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full items-center justify-center transition-colors"
          >
            <Menu size={18} />
          </button>
          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen((v) => !v)}
            className="flex lg:hidden w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full items-center justify-center transition-colors"
          >
            <Menu size={18} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}