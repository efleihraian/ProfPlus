import { formatLog, safePath, type LogFields, type LogLevel } from '../../../web/shared/log-format';
import type { RequestEnd } from '../../../web/shared/api-client';

const recent: string[] = [];

export function log(level: LogLevel, event: string, fields?: LogFields, error?: unknown) {
  const line = formatLog(level, event, fields, error);
  recent.push(line);
  if (recent.length > 100) recent.shift();
  console.info(line);
}

export const recentLogs = () => [...recent];

export function logRequest({ method, path, ok, status, durationMs, error, aborted }: RequestEnd) {
  const fields = { method, path: safePath(path), status, durationMs };
  const slow = durationMs > (path.startsWith('/api/chat') ? 120_000 : 10_000);
  if (ok) {
    if (slow) log('warn', 'api_slow', fields);
  } else if (aborted) log('info', 'api_aborted', fields);
  else if (status === 0 || status >= 500) log('error', 'api_failure', fields, error);
  else if (status !== 401) log('warn', 'api_rejected', fields, error);
}

type ErrorUtilsShape = {
  getGlobalHandler: () => (error: unknown, isFatal?: boolean) => void;
  setGlobalHandler: (handler: (error: unknown, isFatal?: boolean) => void) => void;
};

export function installGlobalErrorLogging() {
  const utils = (globalThis as { ErrorUtils?: ErrorUtilsShape }).ErrorUtils;
  if (!utils) return;
  const previous = utils.getGlobalHandler();
  utils.setGlobalHandler((error, isFatal) => {
    log('error', 'app_unhandled', { fatal: !!isFatal }, error);
    previous(error, isFatal);
  });
}
