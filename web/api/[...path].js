const routes = [
  {
    pattern: /^analyze$/,
    load: () => import("../src/app/api/analyze/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^auth\/check$/,
    load: () => import("../src/app/api/auth/check/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^auth\/expo-web-success$/,
    load: () => import("../src/app/api/auth/expo-web-success/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^auth\/login$/,
    load: () => import("../src/app/api/auth/login/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^auth\/logout$/,
    load: () => import("../src/app/api/auth/logout/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^auth\/token$/,
    load: () => import("../src/app/api/auth/token/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^chat$/,
    load: () => import("../src/app/api/chat/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^profiles$/,
    load: () => import("../src/app/api/profiles/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^profiles\/([^/]+)$/,
    load: () => import("../src/app/api/profiles/[id]/route.js"),
    params: (match) => ({ id: match[1] }),
  },
  {
    pattern: /^report$/,
    load: () => import("../src/app/api/report/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^sessions$/,
    load: () => import("../src/app/api/sessions/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^sessions\/([^/]+)$/,
    load: () => import("../src/app/api/sessions/[id]/route.js"),
    params: (match) => ({ id: match[1] }),
  },
  {
    pattern: /^__create\/check-social-secrets$/,
    load: () => import("../src/app/api/__create/check-social-secrets/route.js"),
    params: () => ({}),
  },
  {
    pattern: /^__create\/ssr-test$/,
    load: () => import("../src/app/api/__create/ssr-test/route.js"),
    params: () => ({}),
  },
];

function getPathFromRequest(req) {
  const path = req.query.path;
  if (Array.isArray(path)) {
    return path.join("/");
  }
  return path || "";
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

async function toWebRequest(req) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `${protocol}://${host}`);
  const method = req.method || "GET";
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else if (value != null) {
      headers.set(key, value);
    }
  }

  const init = {
    method,
    headers,
  };

  if (method !== "GET" && method !== "HEAD") {
    const body = await readBody(req);
    if (body) {
      init.body = body;
      init.duplex = "half";
    }
  }

  return new Request(url, init);
}

async function sendWebResponse(res, response) {
  res.statusCode = response.status;

  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value);
  }

  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}

export default async function handler(req, res) {
  const path = getPathFromRequest(req);

  for (const route of routes) {
    const match = path.match(route.pattern);
    if (!match) continue;

    try {
      const module = await route.load();
      const method = (req.method || "GET").toUpperCase();
      const routeHandler = module[method];

      if (typeof routeHandler !== "function") {
        res.statusCode = 405;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      const request = await toWebRequest(req);
      const response = await routeHandler(request, { params: route.params(match) });
      await sendWebResponse(res, response);
      return;
    } catch (error) {
      console.error("API handler error:", error);
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Internal server error",
        }),
      );
      return;
    }
  }

  res.statusCode = 404;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ error: "Not found" }));
}
