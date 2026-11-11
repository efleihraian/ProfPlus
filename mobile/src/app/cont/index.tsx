// Fila Cont (P-195), după modelul aplicațiilor cu meniu de cont: sus intrarea sau numele (cu editare),
// dedesubt secțiunile site-ului în care intri — Profil, Bibliotecă personală, Setări — și, la final, deconectarea.
import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuGroup, MenuRow } from '@/components/account/menu-row';
import { Notice } from '@/components/account/notice';
import { accountEditable } from '@/components/account/teaching-form';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/components/ui/coming-soon';
import { LibraryIcon, LogOutIcon, PencilIcon, SettingsIcon, UserIcon } from '@/components/ui/icons';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, ApiError, type AccountResponse } from '@/lib/api';
import { useAuth, type Outcome } from '@/lib/auth';
import { useAccount } from '@/lib/use-account';

export default function AccountScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { session, notice, signOut, signOutEverywhere } = useAuth();
  const { account, error, reload } = useAccount();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<'everywhere' | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  if (session === undefined) {
    return (
      <Screen title="Cont" loading />
    );
  }

  const user = account?.user;
  const teaching = user?.teaching;
  // P-201: rândurile meniului nu mai au descrieri; rămâne doar o atenționare când profilul cere ceva.
  const profileAlert = !user ? undefined : user.deleting ? 'Ștergerea contului este în curs' : !teaching ? 'Completează profilul didactic' : undefined;

  return (
    <Screen title="Cont" loading={!!session && !account && !error}>
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: theme.soft }]}>
          <UserIcon size={40} color={theme.softText} />
        </View>
        {session ? (
          <>
            <View style={styles.nameRow}>
              <ThemedText type="subtitle" style={styles.name} numberOfLines={2}>
                {user?.name || 'Contul tău'}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editează numele"
                hitSlop={8}
                onPress={() => (account && accountEditable(account) ? setEditing(true) : openBrowserAsync(SITE_URL + '/account'))}
                style={({ pressed }) => [styles.edit, { backgroundColor: pressed ? theme.fillStrong : theme.fill }]}>
                <PencilIcon color={theme.text} />
              </Pressable>
            </View>
            <ThemedText themeColor="muted">{session.user.email}</ThemedText>
            {error ? <ThemedText themeColor="dangerText">{error}</ThemedText> : null}
          </>
        ) : (
          <>
            <ThemedText themeColor="muted" style={styles.center}>
              Conectează-te pentru conversațiile, documentele și clasele tale. Același cont ca pe profplus.ro.
            </ThemedText>
            <View style={styles.signIn}>
              <Button onPress={() => router.push('/cont/intrare')}>Intră în cont</Button>
            </View>
          </>
        )}
      </View>
      {!session && notice ? <Notice outcome={{ message: notice }} /> : null}
      <Notice outcome={outcome} />

      <MenuGroup title="Gestionează contul">
        {session ? (
          <>
            <MenuRow icon={(c) => <UserIcon color={c} />} label="Profil" detail={profileAlert} detailAccent onPress={() => router.push('/cont/profil')} />
            <MenuRow icon={(c) => <LibraryIcon color={c} />} label="Bibliotecă personală" onPress={() => router.push('/cont/biblioteca')} />
          </>
        ) : null}
        <MenuRow icon={(c) => <SettingsIcon color={c} />} label="Setări" onPress={() => router.push('/cont/setari')} />
      </MenuGroup>

      {session ? (
        <MenuGroup title="Deconectare">
          <MenuRow icon={(c) => <LogOutIcon color={c} />} label="Ieși din cont" onPress={() => void signOut()} />
          <MenuRow
            icon={(c) => <LogOutIcon color={c} />}
            label="Deconectează toate dispozitivele"
            busy={busy === 'everywhere'}
            onPress={async () => {
              setBusy('everywhere');
              const result = await signOutEverywhere();
              setBusy(null);
              if ('error' in result) setOutcome(result);
            }}
          />
        </MenuGroup>
      ) : null}

      {account && editing ? (
        <NameEditor
          account={account}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setOutcome({ message: 'Numele a fost salvat.' });
            reload();
          }}
        />
      ) : null}
    </Screen>
  );
}

/** Editarea numelui afișat, într-o fereastră de jos (serverul păstrează profilul didactic neschimbat). */
function NameEditor({ account, onClose, onSaved }: { account: AccountResponse; onClose: () => void; onSaved: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(account.user?.name ?? '');
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  async function save() {
    setBusy(true);
    setOutcome(null);
    try {
      await api.account.update({ action: 'profile', name: name.trim() });
      onSaved();
    } catch (e) {
      setOutcome({ error: e instanceof ApiError ? e.message : 'Numele nu a putut fi salvat. Verifică internetul și încearcă din nou.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => {
        if (!busy) onClose();
      }}>
      <Pressable accessibilityLabel="Închide" style={styles.backdrop} onPress={() => {
          if (!busy) onClose();
        }} />
      <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border, paddingBottom: insets.bottom + Spacing.three }]}>
        <ThemedText type="subtitle" accessibilityRole="header">
          Numele afișat
        </ThemedText>
        <TextField label="Nume (opțional)" value={name} onChangeText={setName} maxLength={100} autoComplete="name" textContentType="name" autoFocus editable={!busy} onSubmitEditing={save} />
        <ThemedText type="small" themeColor="muted">
          Apare în ProfPlus și pe site. Poți lăsa câmpul gol.
        </ThemedText>
        <Notice outcome={outcome} />
        <Button onPress={save} loading={busy}>
          Salvează
        </Button>
        <Button variant="secondary" onPress={onClose} disabled={busy}>
          Anulează
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, maxWidth: '100%' },
  name: { flexShrink: 1, textAlign: 'center' },
  edit: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  signIn: { alignSelf: 'stretch' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: Spacing.three, gap: Spacing.three },
});
