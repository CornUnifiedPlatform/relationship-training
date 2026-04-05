import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Loader2, Square, AlertCircle } from "lucide-react";
import ChatBubble from "../../../components/ChatBubble";
import ProtectedPage from "../../../components/ProtectedPage";

export default function TrainChatPage({ params }) {
  const { sessionId } = params;
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [ending, setEnding] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { data: session, isLoading } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error("训练不存在");
      return res.json();
    },
  });

  // Initialize local messages from DB
  useEffect(() => {
    if (session?.messages && localMessages.length === 0) {
      setLocalMessages(session.messages);
    }
  }, [session]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Send message
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);
    setError(null);

    // Optimistic: add user message
    const userMsg = { role: "user", content: text, id: Date.now() };
    setLocalMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: parseInt(sessionId),
          message: text,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "对话出错了");
      }

      const data = await res.json();

      // Add crush response
      const crushMsg = {
        role: "crush",
        content: data.crush,
        id: Date.now() + 1,
      };
      setLocalMessages((prev) => [...prev, crushMsg]);

      // Add coach tip if exists
      if (data.coach) {
        const coachMsg = {
          role: "coach",
          content: data.coach,
          id: Date.now() + 2,
        };
        setTimeout(() => {
          setLocalMessages((prev) => [...prev, coachMsg]);
        }, 500);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, sessionId]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // End session
  const handleEnd = useCallback(async () => {
    setEnding(true);
    try {
      // Generate report
      const reportRes = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: parseInt(sessionId) }),
      });

      if (!reportRes.ok) {
        throw new Error("生成报告失败");
      }

      window.location.href = `/report/${sessionId}`;
    } catch (err) {
      console.error(err);
      setError(err.message);
      setEnding(false);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
        <Loader2 size={24} className="text-[#FF6B8A]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#888] mb-4">训练不存在</p>
          <a href="/dashboard" className="text-[#FF6B8A] no-underline">
            返回训练中心
          </a>
        </div>
      </div>
    );
  }

  const isCompleted = session.status === "completed";
  const crushName = session.crush_name || session.slug || "❤";

  return (
    <ProtectedPage>
      <div className="h-screen flex flex-col bg-[#FFFBFC]">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-[#F0E4E8] px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-[#FFF0F3] transition-colors text-[#888] hover:text-[#1A1A2E] no-underline"
              >
                <ArrowLeft size={18} />
              </a>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B8A] to-[#FF8FA3] flex items-center justify-center text-white text-sm font-bold">
                  {crushName[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1A1A2E]">
                    {crushName}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#999]">{session.scene}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#FFF0F3] text-[#FF6B8A]">
                      {session.feedback_mode === "实时提示"
                        ? "🔴 实时"
                        : "🔵 复盘"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!isCompleted && (
              <button
                onClick={handleEnd}
                disabled={ending || localMessages.length < 2}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[#FF6B8A] bg-[#FFF0F3] hover:bg-[#FFE4EC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {ending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Square size={14} />
                )}
                {ending ? "生成报告中..." : "结束训练"}
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="max-w-2xl mx-auto">
            {/* Scene intro */}
            <div className="text-center mb-6 px-4">
              <div className="inline-block px-4 py-2 rounded-full bg-[#F3E8FF]/50 border border-[#DDD6FE]">
                <span className="text-xs text-[#7C5CFC]">
                  {session.scene} · {session.feedback_mode}
                </span>
              </div>
              <p className="text-xs text-[#CCC] mt-2">对方正在等你开口 ↓</p>
            </div>

            {localMessages.map((msg, i) => (
              <ChatBubble
                key={msg.id || i}
                role={msg.role}
                content={msg.content}
                crushName={crushName}
              />
            ))}

            {sending && (
              <div className="flex justify-start mb-3 px-4">
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B8A] to-[#FF8FA3] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {crushName[0]}
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-[#F0E4E8] shadow-sm">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-[#CCC] rounded-full typing-dot"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-[#CCC] rounded-full typing-dot"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-[#CCC] rounded-full typing-dot"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mx-4 mb-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        {!isCompleted && (
          <div className="flex-shrink-0 bg-white border-t border-[#F0E4E8] px-4 py-3">
            <div className="max-w-2xl mx-auto flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你想说的话..."
                  rows={1}
                  disabled={sending || ending}
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#FF6B8A] focus:ring-2 focus:ring-[#FF6B8A]/20 transition-all resize-none disabled:opacity-50 disabled:bg-gray-50"
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending || ending}
                className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] flex items-center justify-center text-white hover:shadow-lg transition-all disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes typingBounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-4px); }
          }
          .typing-dot {
            animation: typingBounce 1.2s infinite ease-in-out;
          }
        `}</style>
      </div>
    </ProtectedPage>
  );
}
