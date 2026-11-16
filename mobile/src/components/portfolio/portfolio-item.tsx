// O rubrică din portofoliu: stare, fișierele încărcate și acțiunile (fotografiază, încarcă, generează cu Profi).
// P-257: starea e un semn în stânga titlului (bifă verde / X roșu / cerc punctat pentru „după caz”), fără descriere.
// După titlu, o pictogramă de document deschide fișierul; cu mai multe fișiere, „+N” arată lista numerotată în ordinea
// încărcării, fiecare cu „Înlocuiește” și „Șterge”. Cu un singur fișier, × și „Înlocuiește” stau înaintea celorlalte butoane.
import { openBrowserAsync } from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { brand, radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PortfolioFile, PortfolioItem as Item } from '@/lib/api';

type Props = {
  item: Item;
  files: PortfolioFile[];
  active: boolean;
  busy: boolean;
  onPhoto: () => void;
  onFile: () => void;
  onRemove: (file: PortfolioFile) => void;
  onReplace: (file: PortfolioFile) => void;
  onOpen: (file: PortfolioFile) => void;
  onGenerate: () => void;
  onToggleExtra: (on: boolean) => void;
};

export function PortfolioItem({ item, files: unsorted, active, busy, onPhoto, onFile, onRemove, onReplace, onOpen, onGenerate, onToggleExtra }: Props) {
  const theme = useTheme();
  const [, name, , optional, generate, link, linkLabel] = item;
  const files = [...unsorted].sort((a, b) => a.createdAt - b.createdAt);
  const [listOpen, setListOpen] = useState(false);
  const added = files.length > 0;
  const single = files.length === 1 ? files[0] : null;
  const state = added ? 'ok' : active ? 'missing' : 'optional';

  return (
    <View style={[styles.item, { backgroundColor: theme.fill }, !active && !added && styles.dimmed]}>
      <View style={styles.titleRow}>
        <StatusMark state={state} />
        <ThemedText type="smallBold" style={styles.name}>
          {name}
        </ThemedText>
        {added ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Deschide ${files[0].name}`}
            onPress={() => onOpen(files[0])}
            hitSlop={8}
            style={({ pressed }) => [styles.fileIcon, { backgroundColor: pressed ? theme.fillStrong : theme.surface, borderColor: theme.border }]}>
            <DocumentIcon color={theme.accentText} />
          </Pressable>
        ) : null}
        {files.length > 1 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Toate cele ${files.length} fișiere`}
            accessibilityState={{ expanded: listOpen }}
            onPress={() => setListOpen((o) => !o)}
            hitSlop={8}
            style={({ pressed }) => [styles.more, { backgroundColor: pressed ? theme.fillStrong : theme.surface, borderColor: theme.border }]}>
            <ThemedText type="smallBold" themeColor="accentText">
              +{files.length - 1}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      {optional && active && !added ? (
        <ThemedText type="small" themeColor="muted">
          După caz · adăugat de tine
        </ThemedText>
      ) : null}
      {files.some((f) => f.status !== 'portfolio') ? (
        <ThemedText type="small" themeColor="dangerText">
          Un fișier nu s-a încărcat sau șters complet. Înlocuiește-l sau șterge-l.
        </ThemedText>
      ) : null}

      {listOpen && files.length > 1
        ? files.map((file, index) => (
            <View key={file.id} style={[styles.file, { borderColor: theme.border }]}>
              <Pressable accessibilityRole="link" accessibilityLabel={`Deschide ${file.name}`} onPress={() => onOpen(file)} hitSlop={6} style={styles.fileName}>
                <ThemedText type="small" themeColor="accentText" numberOfLines={2}>
                  {index + 1}. {file.name}
                </ThemedText>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Înlocuiește ${file.name}`} disabled={busy} onPress={() => onReplace(file)} hitSlop={8} style={styles.link}>
                <ThemedText type="smallBold" themeColor="accentText">
                  Înlocuiește
                </ThemedText>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Șterge ${file.name}`} disabled={busy} onPress={() => onRemove(file)} hitSlop={8} style={styles.link}>
                <ThemedText type="smallBold" themeColor="dangerText">
                  Șterge
                </ThemedText>
              </Pressable>
            </View>
          ))
        : null}

      {optional && !added ? (
        <Pressable accessibilityRole="button" onPress={() => onToggleExtra(!active)} style={styles.link}>
          <ThemedText type="smallBold" themeColor="accentText">
            {active ? '− Scoate din obligatorii' : '+ Adaugă la obligatorii'}
          </ThemedText>
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        {busy ? <ActivityIndicator color={theme.accentText} accessibilityLabel="Se încarcă" /> : null}
        {single ? <Action label="×" accessibilityLabel={`Șterge ${single.name}`} onPress={() => onRemove(single)} disabled={busy} danger /> : null}
        {single ? <Action label="Înlocuiește" accessibilityLabel={`Înlocuiește ${single.name}`} onPress={() => onReplace(single)} disabled={busy} /> : null}
        {link ? <Action label={linkLabel ?? 'Deschide'} onPress={() => openBrowserAsync(link)} disabled={busy} /> : null}
        {generate ? <Action label="Generează cu Profi" onPress={onGenerate} disabled={busy} /> : null}
        <Action label="Fotografiază" onPress={onPhoto} disabled={busy} />
        <Action label={added ? 'Adaugă fișier' : 'Încarcă'} onPress={onFile} disabled={busy} primary />
      </View>
    </View>
  );
}

function StatusMark({ state }: { state: 'ok' | 'missing' | 'optional' }) {
  const theme = useTheme();
  const label = state === 'ok' ? 'Adăugat' : state === 'missing' ? 'Lipsește' : 'După caz, neadăugat';
  const tone = state === 'ok' ? { backgroundColor: theme.okSoft, borderColor: theme.okText } : state === 'missing' ? { backgroundColor: theme.dangerSoft, borderColor: theme.dangerText } : { borderColor: theme.borderStrong, borderStyle: 'dashed' as const };
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={[styles.mark, tone]}>
      {state === 'ok' ? (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.okText} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <Path d="m5 12 5 5 9-10" />
        </Svg>
      ) : state === 'missing' ? (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={theme.dangerText} strokeWidth={3} strokeLinecap="round">
          <Path d="M6 6l12 12" />
          <Path d="M18 6 6 18" />
        </Svg>
      ) : null}
    </View>
  );
}

function DocumentIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Path d="M14 2v6h6" />
      <Path d="M9 13h6M9 17h4" />
    </Svg>
  );
}

function Action({ label, accessibilityLabel, onPress, disabled, primary, danger }: { label: string; accessibilityLabel?: string; onPress: () => void; disabled?: boolean; primary?: boolean; danger?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        primary ? { backgroundColor: theme.dark } : { backgroundColor: pressed ? theme.fillStrong : theme.surface },
        disabled && styles.dimmed,
      ]}>
      <ThemedText type="smallBold" themeColor={danger ? 'dangerText' : undefined} style={primary ? styles.onPrimary : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { borderRadius: 20, padding: 16, gap: 8 },
  dimmed: { opacity: 0.6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  name: { flexShrink: 1, fontSize: 18, lineHeight: 24 },
  fileIcon: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  more: { minWidth: 34, height: 34, borderRadius: 17, borderWidth: 1, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  file: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderTopWidth: 1, paddingTop: 8, marginTop: 2 },
  fileName: { flex: 1, minHeight: 36, justifyContent: 'center' },
  link: { minHeight: 36, justifyContent: 'center', alignSelf: 'flex-start' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 4 },
  action: { minHeight: 44, borderRadius: radius.pill, paddingHorizontal: 16, justifyContent: 'center' },
  onPrimary: { color: brand.onAccent },
});
