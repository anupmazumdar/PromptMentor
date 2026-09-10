/**
 * Keep-alive ping utility for free-tier hosting (e.g. Render / Koyeb).
 * Periodically pings the service's public URL every 14 minutes to prevent cold-sleep spin-downs.
 */
export function setupKeepAlive(url?: string): void {
  const targetUrl = url || process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;

  if (!targetUrl || process.env.NODE_ENV !== 'production') {
    return;
  }

  const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes (Render sleeps at 15 mins)

  console.log(`⏱️ Keep-alive scheduler initialized for: ${targetUrl}/api/health`);

  setInterval(async () => {
    try {
      const pingUrl = `${targetUrl.replace(/\/$/, '')}/api/health`;
      const res = await fetch(pingUrl);
      if (res.ok) {
        console.log(`[Keep-Alive] Pinged ${pingUrl} - Status: ${res.status}`);
      }
    } catch (err: any) {
      console.warn(`[Keep-Alive] Ping failed: ${err?.message}`);
    }
  }, INTERVAL_MS);
}
