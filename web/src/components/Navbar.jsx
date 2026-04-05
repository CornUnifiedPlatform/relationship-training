import { Heart, Home, BarChart3, LogOut } from "lucide-react";

export default function Navbar() {
  const isHome =
    typeof window !== "undefined" && window.location.pathname === "/";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 border-b border-[#F0E4E8]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 no-underline">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B8A] to-[#C084FC] flex items-center justify-center">
            <Heart size={18} color="white" fill="white" />
          </div>
          <span className="text-lg font-semibold text-[#1A1A2E] font-noto-sans-sc">
            恋爱训练
          </span>
        </a>

        <div className="flex items-center gap-2">
          {!isHome && (
            <a
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-[#666] hover:text-[#1A1A2E] hover:bg-[#FFF0F3] transition-all no-underline"
            >
              <Home size={16} />
              <span className="hidden sm:inline">首页</span>
            </a>
          )}
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-[#FF6B8A] to-[#C084FC] hover:shadow-lg hover:shadow-pink-200/50 transition-all no-underline"
          >
            <BarChart3 size={16} />
            <span>训练中心</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-[#666] hover:text-[#FF6B8A] hover:bg-[#FFF0F3] transition-all"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">退出</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
