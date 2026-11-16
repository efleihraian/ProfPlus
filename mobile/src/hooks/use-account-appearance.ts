import { useEffect } from 'react';

import { mobilePreferences } from '@/lib/api';
import { applyAccountTheme, loadThemeChoice, subscribeThemeEdits, type ThemeChoice } from '@/lib/appearance';
import { DEFAULT_AI_MODEL } from '../../../web/lib/ai-models';

export function useAccountAppearance(userId?: string) {
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const client = mobilePreferences(userId);
    let chosen: ThemeChoice | undefined;
    let ready = false;
    let saving = false;
    let pending = false;

    function write(value: ThemeChoice) {
      pending = true;
      if (!ready || saving || controller.signal.aborted) return;
      pending = false;
      saving = true;
      void client.save({theme: value === 'auto' ? 'system' : value, model: DEFAULT_AI_MODEL}, controller.signal)
        .catch(() => {})
        .finally(() => {
          saving = false;
          if (pending && chosen) write(chosen);
        });
    }
    const unsubscribe = subscribeThemeEdits(value => {
      chosen = value;
      applyAccountTheme(value);
      write(value);
    });
    void client.read(controller.signal).then(async response => {
      if (controller.signal.aborted || response.userId !== 'supabase:' + userId) return;
      const device = await loadThemeChoice();
      if (controller.signal.aborted) return;
      ready = true;
      if (chosen) {
        write(chosen);
      } else if (response.preferences) {
        const theme = response.preferences.theme;
        applyAccountTheme(theme === 'system' ? 'auto' : theme);
      } else {
        write(device);
      }
    }).catch(() => {
      if (controller.signal.aborted) return;
      ready = true;
      if (chosen) write(chosen);
    });
    return () => {
      controller.abort();
      unsubscribe();
      applyAccountTheme(null);
    };
  }, [userId]);
}
