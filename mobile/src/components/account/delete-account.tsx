import { useState } from 'react';
import { Linking, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Notice } from '@/components/account/notice';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AccountResponse } from '@/lib/api';
import { useAuth, type Outcome } from '@/lib/auth';

type Props = { account: AccountResponse; visible: boolean; onClose: () => void; onRetry: () => void };

export function DeleteAccount({ account, visible, onClose, onRetry }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { deleteAccount, requestDeletionCode } = useAuth();
  const linked = account.user?.linkedProviders ?? [];
  const [confirmation, setConfirmation] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const pending = !!account.user?.deleting;
  const ready = account.deletionEnabled && confirmation === 'STERGE' && (pending || sent && /^\d{6,10}$/.test(code));

  async function sendCode() {
    setBusy(true);
    setOutcome(null);
    const result = await requestDeletionCode();
    if ('message' in result) {
      setCode('');
      setSent(true);
    }
    setOutcome(result);
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    setOutcome(null);
    const result = await deleteAccount(code);
    setBusy(false);
    if ('error' in result) {
      setOutcome(result);
      onRetry();
    }
  }

  function close() {
    if (busy) return;
    setConfirmation('');
    setCode('');
    setSent(false);
    setOutcome(null);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled">
        <ThemedText type="subtitle" accessibilityRole="header">
          {pending ? 'Reia ștergerea contului' : 'Ștergi contul ProfPlus?'}
        </ThemedText>
        <ThemedText>
          Se șterg profilul, conversațiile, proiectele, documentele încărcate și indexurile lor pentru AI. Manualele comune rămân în bibliotecă.
        </ThemedText>
        <ThemedText>Operația este definitivă. Nu îți șterge contul Google sau Apple. Dacă revii ulterior, se creează un cont ProfPlus nou.</ThemedText>
        <ThemedText type="small" themeColor="muted">
          Copiile de siguranță și logurile furnizorilor pot avea perioade separate de păstrare; nu promitem ștergerea lor instantanee. Dacă ștergerea eșuează, o poți relua de aici.
        </ThemedText>
        {linked.includes('apple') ? (
          <View style={styles.block}>
            <ThemedText type="small" themeColor="muted">
              Pentru a opri și autorizarea Apple: contul Apple → Autentificare și securitate → Autentificare cu Apple → ProfPlus → Oprește utilizarea.
            </ThemedText>
            <Button variant="secondary" onPress={() => void Linking.openURL('https://account.apple.com/')}>
              Deschide contul Apple
            </Button>
          </View>
        ) : null}
        {!account.deletionEnabled ? (
          <ThemedText themeColor="dangerText">Ștergerea automată necesită activarea configurației serverului. Nu au fost șterse date.</ThemedText>
        ) : null}
        <TextField label="Scrie STERGE pentru confirmare" value={confirmation} onChangeText={setConfirmation} autoCapitalize="characters" autoCorrect={false} editable={!busy} />
        {!pending && account.deletionEnabled ? (
          <>
            <Button variant="secondary" disabled={busy} onPress={() => void sendCode()}>
              {sent ? 'Retrimite codul' : 'Trimite codul pe e-mail'}
            </Button>
            {sent ? <TextField label="Cod din e-mail" value={code} onChangeText={text => setCode(text.trim())} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={10} editable={!busy} /> : null}
          </>
        ) : null}
        <Notice outcome={outcome} />
        <Button variant="danger" onPress={remove} loading={busy} disabled={!ready}>
          {pending ? 'Reia ștergerea' : 'Șterge definitiv contul'}
        </Button>
        <Button variant="secondary" onPress={close} disabled={busy}>
          Anulează
        </Button>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  block: { gap: Spacing.two },
});
