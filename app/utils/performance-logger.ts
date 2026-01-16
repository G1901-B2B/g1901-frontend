/**
 * Performance logging utility for debugging render times
 */

const LOG_ENDPOINT =
  "http://127.0.0.1:7242/ingest/92926a72-8323-4be7-928d-d365e86b8ef8";
const LOG_PATH = "c:\\projects\\.cursor\\debug.log";

export function logPerformance(metric: string, data: Record<string, unknown>) {
  const logEntry = {
    id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    location: metric,
    message: "Performance metric",
    data,
    sessionId: "perf-session",
    runId: "render-optimization",
    hypothesisId: "A",
  };

  // Log to console
  console.log(`[PERF] ${metric}`, data);

  // Try to log to file (Node.js environment)
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      const logLine = JSON.stringify(logEntry) + "\n";
      fs.appendFileSync(LOG_PATH, logLine, "utf8");
    } catch {
      // Ignore file write errors
    }
  }

  // Try to log via HTTP (browser environment)
  if (typeof fetch !== "undefined") {
    fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logEntry),
    }).catch(() => {
      // Ignore fetch errors
    });
  }
}

export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  return fn().then(
    (result) => {
      const duration = performance.now() - start;
      logPerformance(name, { duration: Math.round(duration) });
      return result;
    },
    (error) => {
      const duration = performance.now() - start;
      logPerformance(name, {
        duration: Math.round(duration),
        error: error.message,
      });
      throw error;
    }
  );
}

export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    logPerformance(name, { duration: Math.round(duration) });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logPerformance(name, {
      duration: Math.round(duration),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
