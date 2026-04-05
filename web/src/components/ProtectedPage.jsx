import useAuthCheck from "../utils/useAuthCheck";

/**
 * 包装需要登录的页面
 */
export default function ProtectedPage({ children }) {
  const { loading } = useAuthCheck();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBFC] flex items-center justify-center">
        <div className="text-sm text-[#888]">验证身份中...</div>
      </div>
    );
  }

  return children;
}
