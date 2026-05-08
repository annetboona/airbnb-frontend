import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import LoginForm from "../Components/loginForm"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (email: string, password: string) => {
    const ok = login(email, password)
    if (ok) navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            List<span className="text-orange-500 italic">On.</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>
        <LoginForm onSubmit={handleSubmit} />
        <p className="text-center text-xs text-gray-400 mt-6">
          <p className="text-gray-600 mt-1">Don't have Account <span className="text-orange-500 hover:text-orange-700 p-2 font-semibold text-15"><a href="#">Sign Up</a></span></p>
        </p>
      </div>
    </div>
  )
}