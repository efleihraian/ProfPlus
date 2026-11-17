import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CloseIcon, FileTextIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChatDocument } from '@/lib/api';

export const busyStatus = (status: string) => ['uploading', 'indexing', 'deleting'].includes(status);
const statusLabel = (status: string) =>
  status === 'ready' ? 'Gata · folosit de Profi' : status === 'indexing' ? 'Se pregătește…' : status === 'uploading' ? 'Se încarcă…' : status === 'deleting' ? 'Se șterge…' : 'Eroare · șterge și reîncarcă';

type Props = { documents: ChatDocument[]; uploading: string | null; disabled: boolean; onRemove: (id: string) => void };

export function ChatDocuments({ documents, uploading, disabled, onRemove }: Props) {
  const theme = useTheme();
  const [confirm, setConfirm] = useState<string | null>(null);
  if (!documents.length && !uploading) return null;
  return (
    <View style={styles.list} accessibilityLabel="Documentele conversației">
      {documents.map((document) => {
        const asking = confirm === document.id;
        return (
          <View key={document.id} style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <FileTextIcon size={18} color={theme.muted} />
            <View style={styles.name}>
              <ThemedText type="small" numberOfLines={1}>
                {document.name}
              </ThemedText>
              <ThemedText type="small" themeColor={document.status === 'ready' ? 'softText' : 'muted'}>
                {asking ? 'Atinge din nou ca să ștergi documentul' : statusLabel(document.status)}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={asking ? `Confirmă ștergerea: ${document.name}` : `Șterge ${document.name}`}
              disabled={disabled || busyStatus(document.status)}
              hitSlop={6}
              onPress={() => {
                if (!asking) {
                  setConfirm(document.id);
                  return;
                }
                setConfirm(null);
                onRemove(document.id);
              }}
              style={[styles.remove, { backgroundColor: asking ? theme.dangerSoft : theme.fill }]}>
              <CloseIcon size={12} color={asking ? theme.dangerText : theme.text} />
            </Pressable>
          </View>
        );
      })}
      {uploading ? (
        <ThemedText type="small" themeColor="muted" accessibilityLiveRegion="polite">
          Se încarcă: {uploading}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 6 },
  item: { minHeight: 52, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingHorizontal: Spacing.two, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  name: { flex: 1 },
  remove: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
