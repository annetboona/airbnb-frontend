import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import LoginForm from "../Components/loginForm"

export default function LoginPage() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            AIR<span className="text-orange-500 italic">BNB.</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>

        {/* LoginForm calls the API, gives us the token on success */}
        <LoginForm
          onSuccess={async (token) => {
            await loginWithToken(token) // decodes JWT, fetches /auth/me profile, stores token
            navigate("/dashboard")
          }}
        />

        {/* Sign up link */}
        <p className="text-center text-xs text-gray-400 mt-4">
          <Link to="/forgot-password" className="text-gray-600 hover:text-orange-500 font-medium">
            Forgot password?
          </Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-4">
          <span className="text-gray-600">Don't have an account?</span>
          <Link
            to="/signup"
            className="text-orange-500 hover:text-orange-700 font-semibold ml-1"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}