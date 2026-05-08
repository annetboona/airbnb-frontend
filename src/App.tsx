import { lazy, Suspense, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import Spinner from "./shared/Components/Spinner"
import NotFound from "./shared/Components/NotFound"
import ProtectedRoute from "./shared/Components/ProtectedRoute"
import ListingsPage from "./feactures/listings/pages/ListingsPage"
import LoginPage from "./feactures/auth/pages/LoginPage"
import Navbar from "./shared/Components/Navbar"
import HomePage from "./feactures/listings/pages/HomePage"

const DashboardPage = lazy(() => import("./feactures/auth/pages/Dashboard"))
const ListingDetail = lazy(() => import("./feactures/listings/pages/ListingDetail"))
NProgress.configure({ showSpinner: false, speed: 400 })

function App() {
  const location = useLocation()

  useEffect(() => {
    NProgress.start()
    const t = setTimeout(() => NProgress.done(), 100)
    return () => clearTimeout(t)
  }, [location])

  return (
    <>
      <Navbar />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App;