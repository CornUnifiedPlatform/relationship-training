export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const correctUsername = process.env.APP_USERNAME;
    const correctPassword = process.env.APP_PASSWORD;

    if (!correctUsername || !correctPassword) {
      return Response.json({ error: "未配置登录凭据" }, { status: 500 });
    }

    if (username === correctUsername && password === correctPassword) {
      // 登录成功 — 用 new Response 才能正确设置 Set-Cookie
      const token = Buffer.from(`authenticated:${Date.now()}`).toString(
        "base64",
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
        },
      });
    }

    return Response.json({ error: "用户名或密码错误" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "登录失败" }, { status: 500 });
  }
}
