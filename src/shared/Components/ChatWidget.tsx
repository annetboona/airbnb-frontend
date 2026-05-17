import { useRef, useState } from "react"
import api from "../../lib/axios"
import { MessageSquare, Send, X } from "lucide-react"

type ChatMessage = { role: "user" | "assistant"; text: string }

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const sessionRef = useRef<string | null>(null)
  
  if (!sessionRef.current) {
    const sid = typeof crypto !== "undefined" && "randomUUID" in crypto 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionRef.current = `anon-session-${sid}`
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
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I'm unavailable right now." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-80 sm:w-96 h-[30rem] flex flex-col overflow-hidden mb-4 transition-all duration-300 transform origin-bottom-right">
          {/* Header */}
          <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} />
              <h3 className="font-semibold text-sm">Airbnb Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-orange-100 transition">
              <X size={20} />
            </button>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                Hi! Ask me about locations, pricing, or how booking works. I'm here to help!
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "ml-auto bg-orange-500 text-white"
                    : "mr-auto bg-white border border-gray-100 text-gray-800 shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <p className="text-xs text-gray-400">Typing…</p>}
          </div>

          {/* Input area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Type a message…"
              className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition flex items-center justify-center"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-xl shadow-orange-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center animate-bounce"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  )
}
