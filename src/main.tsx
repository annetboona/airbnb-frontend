import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "react-hot-toast"
import { StoreProvider } from "./store/StoreContext"
import { AuthProvider } from "./feactures/auth/context/AuthContext"
import App from "./App.tsx"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <AuthProvider>
            <App />
            <Toaster position="bottom-right" />
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </StoreProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)