import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Shape, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, GRADATION_INFO, PORTFOLIO_INFO } from '@/lib/api';
import { log } from '@/lib/log';

export const INTRO_ID = 'documente-intro';
const LOCAL_KEY = 'profplus-tour-' + INTRO_ID;

export function PortfolioAbout({ brief = false }: { brief?: boolean }) {
  return (
    <>
      <ThemedText type="small">{PORTFOLIO_INFO.about}</ThemedText>
      <ThemedText type="small">
        La fiecare document fotografiezi sau încarci fișierele tale (ori le generezi cu Profi, unde se poate). Bara arată cât ai completat.
      </ThemedText>
      {!brief ? <>
        <ThemedText type="small" themeColor="subtle">
          {PORTFOLIO_INFO.note}
        </ThemedText>
        <ThemedText type="small" themeColor="subtle">
          {PORTFOLIO_INFO.privacy}
        </ThemedText>
      </> : null}
    </>
  );
}

export function GradationAbout() {
  return (
    <>
      <ThemedText type="small">{GRADATION_INFO.about}</ThemedText>
      <ThemedText type="small" themeColor="subtle">
        {GRADATION_INFO.note}
      </ThemedText>
    </>
  );
}

export function InfoHeading({ title, label, children }: { title: string; label: string; children: ReactNode }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.heading}>
      <View style={styles.headingRow}>
        <ThemedText type="subtitle" accessibilityRole="header" style={styles.headingText}>
          {title}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((o) => !o)}
          hitSlop={8}
          style={({ pressed }) => [styles.info, { borderColor: open ? theme.borderStrong : theme.border, backgroundColor: pressed ? theme.fillStrong : theme.surface }]}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={open ? theme.text : theme.muted} strokeWidth={2.2} strokeLinecap="round">
            <Path d="M12 11v6" />
            <Path d="M12 7.5v.01" />
          </Svg>
        </Pressable>
      </View>
      {open ? <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View> : null}
    </View>
  );
}

export function PortfolioIntro() {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const local = await AsyncStorage.getItem(LOCAL_KEY).catch(() => null);
      if (local === 'done') return;
      const seen = await api.tours.list().then(({ tours }) => tours.includes(INTRO_ID), () => false);
      if (seen) await AsyncStorage.setItem(LOCAL_KEY, 'done').catch(() => undefined);
      else if (!cancelled) setVisible(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const close = () => {
    setVisible(false);
    AsyncStorage.setItem(LOCAL_KEY, 'done').catch((e) => log('warn', 'portfolio_intro_unsaved', undefined, e));
    api.tours.mark(INTRO_ID).catch((e) => log('warn', 'portfolio_intro_unsynced', undefined, e));
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.sheetContent}>
            <ThemedText type="subtitle" accessibilityRole="header">
              Cum funcționează Documentele personale
            </ThemedText>
            <ThemedText type="smallBold">Portofoliul profesional</ThemedText>
            <PortfolioAbout brief />
            <ThemedText type="smallBold" style={styles.gap}>
              Documente pentru gradația de merit
            </ThemedText>
            <GradationAbout />
          </ScrollView>
          <View style={styles.sheetActions}>
            <Button onPress={close}>Am înțeles</Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  heading: { gap: Spacing.two, paddingHorizontal: 4 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headingText: { flexShrink: 1 },
  info: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  panel: { borderWidth: 1, borderRadius: Shape.control, padding: 14, gap: 8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: Spacing.three },
  sheet: { borderRadius: Shape.card, maxHeight: '88%', overflow: 'hidden' },
  sheetContent: { padding: Spacing.three + 4, gap: 8 },
  sheetActions: { padding: Spacing.three, paddingTop: 0, alignItems: 'flex-end' },
  gap: { marginTop: 8 },
});
