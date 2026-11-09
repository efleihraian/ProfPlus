// Datele contului de pe server (nume, profil didactic), citite din nou când se schimbă utilizatorul.
import { useCallback, useEffect, useRef, useState } from 'react';

import { api, ApiError, type AccountResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export function useAccount() {
  const { session } = useAuth();
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // undefined: sesiunea încă se citește; null: vizitator. Reîmprospătarea tokenului nu schimbă utilizatorul.
  const userId = session === undefined ? undefined : (session?.user.id ?? null);
  const shownFor = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (userId === undefined) return;
    let active = true;
    // Alt utilizator: datele vechi dispar imediat. Reîncărcare pentru același cont: rămân până sosesc cele noi.
    if (shownFor.current !== userId) setAccount(null);
    shownFor.current = userId;
    setError(null);
    api.account
      .get()
      .then((data) => active && setAccount(data))
      .catch((e: unknown) => active && setError(e instanceof ApiError ? e.message : 'Serverul ProfPlus nu răspunde.'));
    return () => {
      active = false;
    };
  }, [userId, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { account, error, reload, userId };
}
