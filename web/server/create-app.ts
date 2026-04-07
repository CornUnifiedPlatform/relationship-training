import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { serializeError } from 'serialize-error';
import ws from 'ws';
import NeonAdapter from '../__create/adapter';
import { getHTMLForErrorPage } from '../__create/get-html-for-error-page';
import { isAuthAction } from '../__create/is-auth-action';
import * as analyzeRoute from '../src/app/api/analyze/route';
import * as authCheckRoute from '../src/app/api/auth/check/route';
import * as authExpoWebSuccessRoute from '../src/app/api/auth/expo-web-success/route';
import * as authLoginRoute from '../src/app/api/auth/login/route';
import * as authLogoutRoute from '../src/app/api/auth/logout/route';
import * as authTokenRoute from '../src/app/api/auth/token/route';
import * as chatRoute from '../src/app/api/chat/route';
import * as profilesRoute from '../src/app/api/profiles/route';
import * as profileByIdRoute from '../src/app/api/profiles/[id]/route';
import * as reportRoute from '../src/app/api/report/route';
import * as sessionsRoute from '../src/app/api/sessions/route';
import * as sessionByIdRoute from '../src/app/api/sessions/[id]/route';
import * as checkSocialSecretsRoute from '../src/app/api/__create/check-social-secrets/route';
import * as ssrTestRoute from '../src/app/api/__create/ssr-test/route';

neonConfig.webSocketConstructor = ws;

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = NeonAdapter(pool);

let appPromise: Promise<Hono> | null = null;

function registerApiRoute(
  app: Hono,
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  path: string,
  routeModule: Record<string, unknown>,
  exportName: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
) {
  const routeHandler = routeModule[exportName];
  if (typeof routeHandler !== 'function') {
    return;
  }

  app[method](path, async (c) => {
    return routeHandler(c.req.raw, { params: c.req.param() });
  });
}

function registerApiRoutes(app: Hono) {
  registerApiRoute(app, 'post', '/api/analyze', analyzeRoute, 'POST');
  registerApiRoute(app, 'get', '/api/auth/check', authCheckRoute, 'GET');
  registerApiRoute(app, 'get', '/api/auth/expo-web-success', authExpoWebSuccessRoute, 'GET');
  registerApiRoute(app, 'post', '/api/auth/login', authLoginRoute, 'POST');
  registerApiRoute(app, 'post', '/api/auth/logout', authLogoutRoute, 'POST');
  registerApiRoute(app, 'get', '/api/auth/token', authTokenRoute, 'GET');
  registerApiRoute(app, 'post', '/api/chat', chatRoute, 'POST');
  registerApiRoute(app, 'get', '/api/profiles', profilesRoute, 'GET');
  registerApiRoute(app, 'post', '/api/profiles', profilesRoute, 'POST');
  registerApiRoute(app, 'get', '/api/profiles/:id', profileByIdRoute, 'GET');
  registerApiRoute(app, 'put', '/api/profiles/:id', profileByIdRoute, 'PUT');
  registerApiRoute(app, 'delete', '/api/profiles/:id', profileByIdRoute, 'DELETE');
  registerApiRoute(app, 'post', '/api/report', reportRoute, 'POST');
  registerApiRoute(app, 'get', '/api/sessions', sessionsRoute, 'GET');
  registerApiRoute(app, 'post', '/api/sessions', sessionsRoute, 'POST');
  registerApiRoute(app, 'get', '/api/sessions/:id', sessionByIdRoute, 'GET');
  registerApiRoute(app, 'put', '/api/sessions/:id', sessionByIdRoute, 'PUT');
  registerApiRoute(app, 'get', '/api/__create/check-social-secrets', checkSocialSecretsRoute, 'GET');
  registerApiRoute(app, 'get', '/api/__create/ssr-test', ssrTestRoute, 'GET');
}

export async function createApp({
  handlePageRequest,
}: {
  handlePageRequest?: (request: Request) => Promise<Response> | Response;
} = {}) {
  if (appPromise) {
    return appPromise;
  }

  appPromise = (async () => {
    const app = new Hono();

    app.use('*', requestId());

    app.use('*', (c, next) => {
      const currentRequestId = c.get('requestId');
      return als.run({ requestId: currentRequestId }, () => next());
    });

    app.use(contextStorage());

    app.onError((err, c) => {
      if (c.req.method !== 'GET') {
        return c.json(
          {
            error: 'An error occurred in your app',
            details: serializeError(err),
          },
          500,
        );
      }
      return c.html(getHTMLForErrorPage(err), 200);
    });

    if (process.env.CORS_ORIGINS) {
      app.use(
        '/*',
        cors({
          origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
        }),
      );
    }

    for (const method of ['post', 'put', 'patch'] as const) {
      app[method](
        '*',
        bodyLimit({
          maxSize: 4.5 * 1024 * 1024,
          onError: (c) => c.json({ error: 'Body size limit exceeded' }, 413),
        }),
      );
    }

    if (process.env.AUTH_SECRET) {
      app.use(
        '*',
        initAuthConfig((c) => ({
          secret: c.env.AUTH_SECRET,
          pages: {
            signIn: '/account/signin',
            signOut: '/account/logout',
          },
          skipCSRFCheck,
          session: {
            strategy: 'jwt',
          },
          callbacks: {
            session({ session, token }) {
              if (token.sub) {
                session.user.id = token.sub;
              }
              return session;
            },
          },
          cookies: {
            csrfToken: {
              options: {
                secure: true,
                sameSite: 'none',
              },
            },
            sessionToken: {
              options: {
                secure: true,
                sameSite: 'none',
              },
            },
            callbackUrl: {
              options: {
                secure: true,
                sameSite: 'none',
              },
            },
          },
          providers: [
            ...(process.env.NEXT_PUBLIC_CREATE_ENV === 'DEVELOPMENT'
              ? [
                  Credentials({
                    id: 'dev-social',
                    name: 'Development Social Sign-in',
                    credentials: {
                      email: { label: 'Email', type: 'email' },
                      name: { label: 'Name', type: 'text' },
                      provider: { label: 'Provider', type: 'text' },
                    },
                    authorize: async (credentials) => {
                      const { email, name, provider } = credentials;
                      if (!email || typeof email !== 'string') return null;

                      const existing = await adapter.getUserByEmail(email);
                      if (existing) return existing;

                      const allowedProviders = new Set(['google', 'facebook', 'twitter', 'apple']);
                      const providerName =
                        typeof provider === 'string' &&
                        allowedProviders.has(provider.toLowerCase())
                          ? provider.toLowerCase()
                          : 'google';
                      const newUser = await adapter.createUser({
                        emailVerified: null,
                        email,
                        name:
                          typeof name === 'string' && name.length > 0
                            ? name
                            : undefined,
                      });
                      await adapter.linkAccount({
                        type: 'oauth',
                        userId: newUser.id,
                        provider: providerName,
                        providerAccountId: `dev-${newUser.id}`,
                      });
                      return newUser;
                    },
                  }),
                ]
              : []),
            Credentials({
              id: 'credentials-signin',
              name: 'Credentials Sign in',
              credentials: {
                email: {
                  label: 'Email',
                  type: 'email',
                },
                password: {
                  label: 'Password',
                  type: 'password',
                },
              },
              authorize: async (credentials) => {
                const { email, password } = credentials;
                if (!email || !password) {
                  return null;
                }
                if (typeof email !== 'string' || typeof password !== 'string') {
                  return null;
                }

                const user = await adapter.getUserByEmail(email);
                if (!user) {
                  return null;
                }
                const matchingAccount = user.accounts.find(
                  (account) => account.provider === 'credentials',
                );
                const accountPassword = matchingAccount?.password;
                if (!accountPassword) {
                  return null;
                }

                const isValid = await verify(accountPassword, password);
                if (!isValid) {
                  return null;
                }

                return user;
              },
            }),
            Credentials({
              id: 'credentials-signup',
              name: 'Credentials Sign up',
              credentials: {
                email: {
                  label: 'Email',
                  type: 'email',
                },
                password: {
                  label: 'Password',
                  type: 'password',
                },
                name: { label: 'Name', type: 'text' },
                image: { label: 'Image', type: 'text', required: false },
              },
              authorize: async (credentials) => {
                const { email, password, name, image } = credentials;
                if (!email || !password) {
                  return null;
                }
                if (typeof email !== 'string' || typeof password !== 'string') {
                  return null;
                }

                const user = await adapter.getUserByEmail(email);
                if (!user) {
                  const newUser = await adapter.createUser({
                    emailVerified: null,
                    email,
                    name: typeof name === 'string' && name.length > 0 ? name : undefined,
                    image: typeof image === 'string' && image.length > 0 ? image : undefined,
                  });
                  await adapter.linkAccount({
                    extraData: {
                      password: await hash(password),
                    },
                    type: 'credentials',
                    userId: newUser.id,
                    providerAccountId: newUser.id,
                    provider: 'credentials',
                  });
                  return newUser;
                }
                return null;
              },
            }),
          ],
        })),
      );
    }

    app.all('/integrations/:path{.+}', async (c) => {
      const queryParams = c.req.query();
      const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

      return proxy(url, {
        method: c.req.method,
        body: c.req.raw.body ?? null,
        // @ts-expect-error runtime supports duplex
        duplex: 'half',
        redirect: 'manual',
        headers: {
          ...c.req.header(),
          'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST,
          'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST,
          Host: process.env.NEXT_PUBLIC_CREATE_HOST,
          'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
        },
      });
    });

    app.use('/api/auth/*', async (c, next) => {
      if (isAuthAction(c.req.path)) {
        return authHandler()(c, next);
      }
      return next();
    });

    registerApiRoutes(app);

    if (handlePageRequest) {
      app.notFound((c) => handlePageRequest(c.req.raw));
    }

    return app;
  })();

  return appPromise;
}
