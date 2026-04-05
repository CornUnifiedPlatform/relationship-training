/**
 * 验证请求是否已登录
 */
export function checkAuth(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth_token="));

  const hasToken = match && match.split("=")[1];
  return { authenticated: !!hasToken };
}
