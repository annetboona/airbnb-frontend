import { lazy, Suspense, useEffect } from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import Spinner from "./shared/Components/Spinner"
import NotFound from "./shared/Components/NotFound"
import ProtectedRoute from "./shared/Components/ProtectedRoute"
import LoginPage from "./feactures/auth/pages/LoginPage"
import ForgotPasswordPage from "./feactures/auth/pages/ForgotPasswordPage"
import ResetPasswordPage from "./feactures/auth/pages/ResetPasswordPage"
import Navbar from "./shared/Components/Navbar"
import SignUp from "./feactures/auth/pages/SignUp"
import DashboardLayout from "./feactures/dashboard/DashboardLayout"
import DashboardOverview from "./feactures/dashboard/DashboardOverview"
import DashboardProfilePage from "./feactures/dashboard/pages/DashboardProfilePage"
import GuestBookingsPage from "./feactures/dashboard/pages/GuestBookingsPage"
import GuestFindStayPage from "./feactures/dashboard/pages/GuestFindStayPage"
import GuestAiAssistantPage from "./feactures/dashboard/pages/GuestAiAssistantPage"
import GuestBecomeHostPage from "./feactures/dashboard/pages/Guestbecomehostpage "
import HostMyListingsPage from "./feactures/dashboard/pages/HostMyListingsPage"
import HostListingFormPage from "./feactures/dashboard/pages/HostListingFormPage"
import HostPhotosPage from "./feactures/dashboard/pages/HostPhotosPage"
import HostBookingRequestsPage from "./feactures/dashboard/pages/HostBookingRequestsPage"
import HostAiDescriptionPage from "./feactures/dashboard/pages/HostAiDescriptionPage"
import AdminStatsPage from "./feactures/dashboard/pages/AdminStatsPage"
import AdminUsersPage from "./feactures/dashboard/pages/AdminUsersPage"
import AdminListingsPage from "./feactures/dashboard/pages/AdminListingsPage"
import AdminBookingsPage from "./feactures/dashboard/pages/AdminBookingsPage"
import AdminHostRequestsPage from "./feactures/dashboard/pages/Adminhostrequestspage"
import { useAuth } from "./feactures/auth/hooks/useAuth"
import ChatWidget from "./shared/Components/ChatWidget"


const HomePage = lazy(() => import("./feactures/listings/pages/HomePage"))
const ListingsPage = lazy(() => import("./feactures/listings/pages/ListingsPage"))
const ListingDetail = lazy(() => import("./feactures/listings/pages/ListingDetail"))

NProgress.configure({ showSpinner: false, speed: 400 })
function DashboardIndex() {
  const { user, profile } = useAuth()
  const role = profile?.role || user?.role

  if (role === "ADMIN") return <Navigate to="/dashboard/admin/stats" replace />
  if (role === "HOST")  return <Navigate to="/dashboard/overview" replace />
  return <Navigate to="/dashboard/overview" replace />
}
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
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardIndex />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="profile" element={<DashboardProfilePage />} />

            {/* ── Guest ───────────────────────────────────────────────────── */}
            <Route
              path="bookings"
              element={
                <ProtectedRoute roles={["GUEST"]}>
                  <GuestBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="find-stay"
              element={
                <ProtectedRoute roles={["GUEST"]}>
                  <GuestFindStayPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="assistant"
              element={
                <ProtectedRoute roles={["GUEST"]}>
                  <GuestAiAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="become-host"
              element={
                <ProtectedRoute roles={["GUEST"]}>
                  <GuestBecomeHostPage />
                </ProtectedRoute>
              }
            />

            {/* ── Host ────────────────────────────────────────────────────── */}
            <Route
              path="my-listings"
              element={
                <ProtectedRoute roles={["HOST"]}>
                  <HostMyListingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="listings/new"
              element={
                <ProtectedRoute roles={["HOST"]}>
                  <HostListingFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="listings/:id/edit"
              element={
                <ProtectedRoute roles={["HOST"]}>
                  <HostListingFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="listings/:id/photos"
              element={
                <ProtectedRoute roles={["HOST"]}>
                  <HostPhotosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="requests"
              element={
                <ProtectedRoute roles={["HOST"]}>
                  <HostBookingRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="ai-description"
              element={
                <ProtectedRoute roles={["HOST"]}>
                  <HostAiDescriptionPage />
                </ProtectedRoute>
              }
            />

            {/* ── Admin ───────────────────────────────────────────────────── */}
            <Route
              path="admin/stats"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminStatsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/listings"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminListingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/bookings"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/host-requests"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminHostRequestsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ChatWidget />
    </>
  )
}

export default App