export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: any) => {
    console.error(
      `[ERROR] [${new Date().toISOString()}] ${message}`,
      error instanceof Error ? error.message : error || ''
    );
  },
  http: (method: string, url: string, status: number, durationMs: number) => {
    console.log(`[HTTP] ${method} ${url} ${status} - ${durationMs.toFixed(1)}ms`);
  },
};
