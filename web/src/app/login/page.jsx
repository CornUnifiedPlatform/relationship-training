import { useState, useCallback, useEffect } from "react";
import { Heart, Lock, User, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          window.location.href = "/";
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          window.location.href = "/";
        } else {
          setError(data.error || "登录失败");
        }
      } catch (err) {
        setError("登录失败，请重试");
      } finally {
        setLoading(false);
      }
    },
    [username, password],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F3] via-[#FDE8F0] to-[#F3E8FF] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B8A] to-[#C084FC] mb-4 shadow-lg shadow-pink-200/50">
            <Heart size={28} color="white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] font-noto-sans-sc">
            恋爱训练
          </h1>
          <p className="text-sm text-[#888] mt-1">登录以继续</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#F0E4E8] p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                用户名
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CCC]">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="输入用户名"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#FF6B8A] focus:ring-2 focus:ring-[#FF6B8A]/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CCC]">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#FF6B8A] focus:ring-2 focus:ring-[#FF6B8A]/20 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] hover:shadow-lg hover:shadow-pink-200/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#999] mt-6">
          这是一个私人应用，只有授权用户可以访问
        </p>
      </div>
    </div>
  );
}
