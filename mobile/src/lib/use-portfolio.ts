// Portofoliul profesorului: fișierele de pe server și rubricile „după caz” adăugate la obligatorii.
// Ca pe site, alegerea rubricilor opționale rămâne pe dispozitiv (pe site în browser, aici în AsyncStorage).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { api, ApiError, PORTFOLIO, type PortfolioFile } from '@/lib/api';
import { log } from '@/lib/log';

const EXTRA_KEY = 'profplus-portfolio-extra';

export function usePortfolio(enabled: boolean) {
  const [files, setFiles] = useState<PortfolioFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extra, setExtraState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem(EXTRA_KEY)
      .then((raw) => raw && setExtraState(JSON.parse(raw)))
      .catch((e) => log('warn', 'portfolio_extra_unreadable', undefined, e));
  }, []);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setError(null);
    try {
      setFiles((await api.portfolio.list()).documents);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Portofoliul nu poate fi încărcat acum. Verifică internetul.');
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setExtra = useCallback((id: string, on: boolean) => {
    setExtraState((current) => {
      const next = { ...current, [id]: on };
      AsyncStorage.setItem(EXTRA_KEY, JSON.stringify(next)).catch((e) => log('warn', 'portfolio_extra_unsaved', undefined, e));
      return next;
    });
  }, []);

  const bySlot = new Map<string, PortfolioFile[]>();
  for (const file of files ?? []) bySlot.set(file.slot, [...(bySlot.get(file.slot) ?? []), file]);

  // Progresul numără ca pe site: rubricile obligatorii plus cele „după caz” adăugate; dosarul de gradație (G) e separat.
  const counted = PORTFOLIO.flatMap((s) => s.items).filter((i) => !i[3] || extra[i[0]]);
  const done = counted.filter((i) => bySlot.has(i[0])).length;

  return { files, bySlot, error, reload, extra, setExtra, progress: { done, total: counted.length } };
}
