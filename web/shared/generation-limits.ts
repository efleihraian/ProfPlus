/** One wall-clock budget, including preparation, provider streams and saving. Pings never extend it. */
export const GENERATION_TIMEOUT_MS = 340_000;
export const CHAT_TIMEOUT_MS = 360_000;
export const GENERATION_TIMEOUT_MESSAGE = 'Generarea a depășit limita de timp. Poți reîncerca din conversație.';

/** A race is necessary too: some adapters do not stop their promise when fetch is aborted. */
export function generationDeadline(parent?: AbortSignal | null, ms = GENERATION_TIMEOUT_MS) {
  const controller = new AbortController();
  const stop = () => controller.abort(parent?.reason ?? new Error('GENERATION_STOPPED'));
  if (parent?.aborted) stop();
  else parent?.addEventListener('abort', stop, {once: true});
  const timer = setTimeout(() => controller.abort(new Error('GENERATION_TIMEOUT')), ms);
  const wait = <T>(work: Promise<T>): Promise<T> => new Promise((resolve, reject) => {
    const cancel = () => reject(controller.signal.reason);
    if (controller.signal.aborted) { work.catch(() => {}); cancel(); return; }
    controller.signal.addEventListener('abort', cancel, {once: true});
    work.then(resolve, reject).finally(() => controller.signal.removeEventListener('abort', cancel));
  });
  return {signal: controller.signal, wait, dispose() {clearTimeout(timer); parent?.removeEventListener('abort', stop);}};
}
