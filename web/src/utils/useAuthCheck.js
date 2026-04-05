import { useEffect, useState } from "react";

/**
 * 检查用户是否已登录
 * 未登录则跳转到 /login
 */
export default function useAuthCheck() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { loading, authenticated };
}
