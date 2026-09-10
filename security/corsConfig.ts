import cors, { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow non-browser requests (e.g. curl, server-to-server, mobile or keep-alive pings)
    if (!origin) return callback(null, true);

    if (allowedOrigins.some((allowed) => allowed === origin || (allowed.includes('*') && origin.endsWith(allowed.replace('*', ''))))) {
      return callback(null, true);
    }

    // In non-production or if FRONTEND_URL is not strictly set, allow for development ease
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400 // 24 hours preflight cache
};

export const corsMiddleware = cors(corsOptions);
