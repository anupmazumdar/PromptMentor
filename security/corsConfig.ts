import cors, { CorsOptions } from 'cors';

const allowedOrigins: string[] = [
  'https://promptmentor.anupmazumdar.me',
  'https://prompt-mentor-one.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim().replace(/\/$/, '')] : [])
].filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow non-browser requests (e.g. curl, server-to-server, health checks or keep-alive pings)
    if (!origin) return callback(null, true);

    // Strict exact match against explicit allowlist (no substring or wildcard matching)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400 // 24 hours preflight cache
};

export const corsMiddleware = cors(corsOptions);
