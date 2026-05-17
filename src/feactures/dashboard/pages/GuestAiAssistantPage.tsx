import { useRef, useState } from "react"
import { useAuth } from "../../auth/hooks/useAuth"
import api from "../../../lib/axios"
import toast from "react-hot-toast"
import { MessageSquare, Send } from "lucide-react"

type ChatMessage = { role: "user" | "assistant"; text: string }

export default function GuestAiAssistantPage() {
  const { user } = useAuth()
  const sessionRef = useRef<string | null>(null)
  if (!sessionRef.current) {
    const sid =
      typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionRef.current = `user-${(user as any)?.id ?? user?.userId ?? "anon"}-session-${sid}`
  }
  const sessionId = sessionRef.current

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  async function send() {
    const text = input.trim()
    if (!text) return
    setInput("")
    setMessages((m) => [...m, { role: "user", text }])
    setLoading(true)
    try {
      const { data } = await api.post<{ reply: string | { content: unknown } }>("/ai/chat", { message: text, sessionId })

      // FIX: Defensively extract reply text in case the backend returns a
      // LangChain AIMessage object instead of a plain string.
      // (Root cause: chatChain was missing .pipe(new StringOutputParser()))
      const raw = data.reply
      let replyText: string
      if (typeof raw === "string") {
        replyText = raw
      } else if (raw && typeof (raw as any).content === "string") {
        replyText = (raw as any).content
      } else if (raw && Array.isArray((raw as any).content)) {
        replyText = (raw as any).content
          .map((c: unknown) => (typeof c === "string" ? c : (c as any)?.text ?? ""))
          .join("")
      } else {
        replyText = JSON.stringify(raw)
      }

      setMessages((m) => [...m, { role: "assistant", text: replyText }])
    } catch {
      toast.error("Assistant is unavailable right now")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl flex flex-col gap-4 h-[calc(100vh-10rem)]">
      <div>
        <h1 className="text-2xl font-bol text-gray-500 flex items-center gap-2">
          <MessageSquare className="text-orange-500" size={26} />
          AI assistant
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-12">Ask about locations, pricing, or how booking works.</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === "user"
                ? "ml-auto bg-orange-500 text-white"
                : "mr-auto bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <p className="text-xs text-gray-400">Thinking…</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Message…"
          className="flex-1 rounded-full border dark:border-gray-600 shadow-2xl px-4 py-2 text-sm outline-none focus:border-orange-400"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-full p-3"
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}