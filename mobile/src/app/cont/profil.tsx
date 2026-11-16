// Cont → Profil (P-195): profilul didactic, conectarea și securitatea, apoi ștergerea contului.
import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { DeleteAccount } from '@/components/account/delete-account';
import { Notice } from '@/components/account/notice';
import { SecurityCard } from '@/components/account/security-card';
import { accountEditable, TeachingForm } from '@/components/account/teaching-form';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SITE_URL } from '@/components/ui/coming-soon';
import { Screen } from '@/components/ui/screen';
import { useAuth, type Outcome } from '@/lib/auth';
import { useAccount } from '@/lib/use-account';

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { account, error, reload } = useAccount();
  const [saved, setSaved] = useState<Outcome | null>(null);
  const [deleting, setDeleting] = useState(false);

  // După ieșire sau ștergere, ecranul nu mai are cont: înapoi la meniul Cont.
  useEffect(() => {
    if (session === null) router.back();
  }, [session, router]);

  const user = account?.user;
  if (!account || !user || account.provider !== 'supabase') {
    return (
      <Screen title="Profil" back>
        {error ? <ThemedText themeColor="dangerText">{error}</ThemedText> : <ActivityIndicator accessibilityLabel="Se încarcă profilul" />}
      </Screen>
    );
  }

  return (
    <Screen title="Profil" back>
      {user.deleting ? (
        <Card>
          <ThemedText themeColor="dangerText">Ștergerea contului este în curs. Accesul la conversații și documente este blocat. Reia ștergerea de mai jos.</ThemedText>
        </Card>
      ) : null}
      <Card eyebrow="Profil didactic">
        {!user.teaching && !user.deleting ? <ThemedText themeColor="muted">Completează profilul ca Profi să aleagă manualele potrivite.</ThemedText> : null}
        <TeachingForm
          key={JSON.stringify(user.teaching ?? null)}
          account={account}
          disabled={!!user.deleting}
          onSaved={(message) => {
            setSaved({ message });
            reload();
          }}
        />
        <Notice outcome={saved} />
      </Card>
      {!user.deleting ? <SecurityCard account={account} /> : null}
      <Button variant="danger" onPress={() => (accountEditable(account) ? setDeleting(true) : openBrowserAsync(SITE_URL + '/account'))}>
        {user.deleting ? 'Reia ștergerea contului' : 'Șterge contul'}
      </Button>
      {accountEditable(account) ? <DeleteAccount account={account} visible={deleting} onClose={() => setDeleting(false)} /> : null}
    </Screen>
  );
}
