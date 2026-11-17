import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { AccessibilityInfo, Alert, Pressable, StyleSheet, View } from 'react-native';

import { GradationAbout, InfoHeading, PortfolioAbout, PortfolioIntro } from '@/components/portfolio/portfolio-info';
import { PortfolioItem } from '@/components/portfolio/portfolio-item';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { cardSurface, radius, Spacing } from '@/constants/theme';
import { useDark, useTheme } from '@/hooks/use-theme';
import { api, ApiError, GRADATION, PORTFOLIO, type PortfolioFile, type PortfolioSection } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { log } from '@/lib/log';
import { openPortfolioFile } from '@/lib/portfolio-open';
import { pickDocument, takePhoto, uploadForm, type PickResult } from '@/lib/upload';
import { usePortfolio } from '@/lib/use-portfolio';

export default function DocumentsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { session } = useAuth();
  const signedIn = Boolean(session);
  const { files, bySlot, error, reload, extra, setExtra, progress } = usePortfolio(signedIn);
  const [open, setOpen] = useState<Record<string, boolean>>({ a: true });
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  if (session === null) {
    return (
      <Screen title="Documente personale" intro="Portofoliul profesional cerut de OMEC nr. 3.858/2026, cu progresul tău.">
        <Card>
          <ThemedText>Intră în cont ca să-ți vezi și să-ți completezi portofoliul. Fișierele rămân private, în contul tău.</ThemedText>
          <Button onPress={() => router.navigate('/cont/intrare')}>Intră în cont</Button>
        </Card>
      </Screen>
    );
  }

  async function upload(slot: string, pick: () => Promise<PickResult>) {
    if (busySlot) return;
    setFileError(null);
    const picked = await pick();
    if (!picked) return;
    if ('error' in picked) {
      setFileError(picked.error);
      return;
    }
    setBusySlot(slot);
    try {
      await api.documents.upload(uploadForm(picked.file, { scope: 'portfolio', slot }));
      AccessibilityInfo.announceForAccessibility('Fișier încărcat.');
    } catch (e) {
      log('error', 'portfolio_upload_failed', { slot, type: picked.file.type, size: picked.file.size ?? null }, e);
      setFileError(e instanceof ApiError ? e.message : 'Fișierul nu a putut fi încărcat. Verifică internetul.');
    } finally {
      await reload();
      setBusySlot(null);
    }
  }

  function replace(file: PortfolioFile) {
    const run = async (pick: () => Promise<PickResult>) => {
      if (busySlot) return;
      setFileError(null);
      const picked = await pick();
      if (!picked) return;
      if ('error' in picked) {
        setFileError(picked.error);
        return;
      }
      setBusySlot(file.slot);
      try {
        await api.documents.upload(uploadForm(picked.file, { scope: 'portfolio', slot: file.slot }));
        try {
          await api.documents.remove(file.id);
          AccessibilityInfo.announceForAccessibility('Fișier înlocuit.');
        } catch {
          setFileError('Fișierul nou este salvat, dar cel vechi nu a putut fi șters. Îl poți șterge separat.');
        }
      } catch (e) {
        log('error', 'portfolio_replace_failed', { slot: file.slot, type: picked.file.type, size: picked.file.size ?? null }, e);
        setFileError(e instanceof ApiError ? e.message : 'Fișierul nu a putut fi înlocuit. Verifică internetul.');
      } finally {
        await reload();
        setBusySlot(null);
      }
    };
    Alert.alert('Înlocuiești fișierul?', 'Alege fișierul nou; cel vechi se șterge după ce noul este salvat.', [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Fotografiază', onPress: () => void run(() => takePhoto(file.slot.toUpperCase())) },
      { text: 'Alege un fișier', onPress: () => void run(pickDocument) },
    ]);
  }

  async function openFile(file: PortfolioFile) {
    setFileError(null);
    try {
      await openPortfolioFile(file);
    } catch (e) {
      log('warn', 'portfolio_open_failed', { slot: file.slot }, e);
      setFileError(e instanceof Error && e.message ? e.message : 'Fișierul nu a putut fi deschis. Verifică internetul.');
    }
  }

  function remove(file: PortfolioFile) {
    Alert.alert('Ștergi fișierul?', `„${file.name}” va fi șters din portofoliu, pe telefon și pe site.`, [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Șterge',
        style: 'destructive',
        onPress: async () => {
          setBusySlot(file.slot);
          setFileError(null);
          try {
            await api.documents.remove(file.id);
            AccessibilityInfo.announceForAccessibility('Fișier șters.');
          } catch (e) {
            setFileError(e instanceof ApiError ? e.message : 'Ștergerea nu a reușit.');
          } finally {
            await reload();
            setBusySlot(null);
          }
        },
      },
    ]);
  }

  const section = (s: PortfolioSection, counted: boolean) => {
    const active = s.items.filter((i) => !i[3] || extra[i[0]]);
    const done = active.filter((i) => bySlot.has(i[0])).length;
    return (
      <Section key={s.id} section={s} done={done} total={active.length} counted={counted} open={!!open[s.id]} onToggle={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}>
        {s.items.map((item) => (
          <PortfolioItem
            key={item[0]}
            item={item}
            files={bySlot.get(item[0]) ?? []}
            active={!item[3] || !!extra[item[0]]}
            busy={busySlot === item[0]}
            onPhoto={() => upload(item[0], () => takePhoto(item[0].toUpperCase()))}
            onFile={() => upload(item[0], pickDocument)}
            onRemove={remove}
            onReplace={replace}
            onOpen={openFile}
            onGenerate={() => router.navigate({ pathname: '/asistent', params: { seed: 'Ajută-mă să pregătesc: ' + item[1] } })}
            onToggleExtra={(on) => setExtra(item[0], on)}
          />
        ))}
      </Section>
    );
  };

  return (
    <Screen title="Documente personale" loading={files === null && !error}>
      <PortfolioIntro />
      <Card soft>
        <ThemedText type="smallBold">
          {progress.done} din {progress.total} documente
        </ThemedText>
        <ProgressBar done={progress.done} total={progress.total} label="Progresul portofoliului" />
        <ThemedText type="small" themeColor="muted">
          Rubricile „după caz” intră în progres doar după ce le adaugi la obligatorii.
        </ThemedText>
      </Card>

      {fileError ? (
        <ThemedText accessibilityLiveRegion="polite" accessibilityRole="alert" themeColor="dangerText">{fileError}</ThemedText>
      ) : null}
      {error ? (
        <Card>
          <ThemedText themeColor="dangerText">{error}</ThemedText>
          <Button variant="secondary" onPress={reload}>
            Încearcă din nou
          </Button>
        </Card>
      ) : null}

      {files ? (
        <>
          <InfoHeading title="Portofoliul profesional" label="Despre portofoliul profesional">
            <PortfolioAbout />
          </InfoHeading>
          {PORTFOLIO.map((s) => section(s, true))}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoHeading title="Documente pentru gradația de merit" label="Despre dosarul pentru gradația de merit">
            <GradationAbout />
          </InfoHeading>
          {section(GRADATION, false)}
        </>
      ) : null}
    </Screen>
  );
}

function Section({
  section,
  done,
  total,
  counted,
  open,
  onToggle,
  children,
}: {
  section: PortfolioSection;
  done: number;
  total: number;
  counted: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const theme = useTheme();
  const dark = useDark();
  return (
    <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.surface }, cardSurface(dark)]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Secțiunea ${section.letter}: ${section.title}, ${done} din ${total}`}
        onPress={onToggle}
        style={styles.sectionHeader}>
        <View style={[styles.letter, { backgroundColor: counted ? theme.soft : theme.tag }]}>
          <ThemedText type="smallBold" themeColor={counted ? 'softText' : 'muted'}>
            {section.letter}
          </ThemedText>
        </View>
        <View style={styles.sectionText}>
          <ThemedText type="smallBold">{section.title}</ThemedText>
          <ThemedText type="small" themeColor="muted">
            {done} din {total}
            {counted ? '' : ' · separat de progres'}
          </ThemedText>
        </View>
        <ThemedText themeColor="muted">{open ? '−' : '+'}</ThemedText>
      </Pressable>
      {open ? <View style={styles.items}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderRadius: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: 14, minHeight: 56 },
  letter: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  sectionText: { flex: 1, gap: 2 },
  items: { padding: Spacing.two, paddingTop: 0, gap: Spacing.two },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.two },
});
