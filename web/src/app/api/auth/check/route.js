export async function GET(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth_token="));

  // token 只在登录成功时由服务端设置，存在即有效
  if (match && match.split("=")[1]) {
    return Response.json({ authenticated: true });
  }

  return Response.json({ authenticated: false }, { status: 401 });
}
