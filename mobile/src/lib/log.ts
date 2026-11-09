// Jurnalul aplicației: același format și aceleași reguli de confidențialitate ca serverul (web/shared/log-format.ts).
// Liniile apar în Metro în dezvoltare și în `adb logcat` (eticheta ReactNativeJS) pe telefon; ultimele 100 rămân în memorie
// pentru un viitor buton „Trimite raportul”. Nimic nu pleacă singur de pe telefon.
import { formatLog, safePath, type LogFields, type LogLevel } from '../../../web/shared/log-format';
import type { RequestEnd } from '../../../web/shared/api-client';

const recent: string[] = [];

export function log(level: LogLevel, event: string, fields?: LogFields, error?: unknown) {
  const line = formatLog(level, event, fields, error);
  recent.push(line);
  if (recent.length > 100) recent.shift();
  // console.error/warn ar deschide panoul roșu sau galben al React Native și pentru erorile tratate; nivelul e în JSON.
  console.info(line);
}

export const recentLogs = () => [...recent];

/** O cerere API eșuată sau lentă. 401 fără cont și oprirea cerută de utilizator nu sunt erori. */
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

/** Erorile JavaScript neprinse (în afara ecranelor) ajung în jurnal înainte de comportamentul obișnuit. */
export function installGlobalErrorLogging() {
  const utils = (globalThis as { ErrorUtils?: ErrorUtilsShape }).ErrorUtils;
  if (!utils) return;
  const previous = utils.getGlobalHandler();
  utils.setGlobalHandler((error, isFatal) => {
    log('error', 'app_unhandled', { fatal: !!isFatal }, error);
    previous(error, isFatal);
  });
}
