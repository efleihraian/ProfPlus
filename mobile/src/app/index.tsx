// Acasă (P-258), după macheta titularului, ca pe site: „Ce pregătim azi?” cu trei carduri mari (Test, Fișă de lucru,
// Proiect de lecție), „Mai poți crea” cu celelalte tipuri (inclusiv Fun Prof) și portofoliul cu progresul.
// Un card deschide Asistentul cu felul documentului deja ales; fără cont, duce la intrarea în cont.
// Clasele rămân în bara de jos (fila „Clase”).
// P-261: lângă Profi, o casetă de text în bula lui: textul ajunge în caseta Asistentului; explicația portofoliului e sub „i”.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { HomeNews } from '@/components/home-news';
import { InfoHeading } from '@/components/portfolio/portfolio-info';
import { Profi } from '@/components/profi';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUpIcon } from '@/components/ui/icons';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { brand, radius, Spacing } from '@/constants/theme';
import { useDark, useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import type { DocumentType } from '@/lib/chat-options';
import { usePortfolio } from '@/lib/use-portfolio';

const MAIN: { type: DocumentType; tone: 'dark' | 'soft' | 'plain'; title: string; text: string; cta: string }[] = [
  { type: 'test', tone: 'dark', title: 'Test', text: 'Itemi pe niveluri de dificultate, din manualele tale, cu barem dacă vrei.', cta: 'Creează un test' },
  { type: 'worksheet', tone: 'soft', title: 'Fișă de lucru', text: 'Exerciții pentru oră sau pentru temă, pe unul sau mai multe niveluri.', cta: 'Creează o fișă' },
  { type: 'lesson', tone: 'plain', title: 'Proiect de lecție', text: 'Planul orei, cu etape, timpi și activități, gata de printat.', cta: 'Creează un proiect' },
];
const MORE: { type: DocumentType; label: string; d: string; warm?: boolean }[] = [
  { type: 'theory', label: 'Fișă de teorie', d: 'M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2zM22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z' },
  { type: 'planning', label: 'Planificare', d: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2' },
  { type: 'unit', label: 'Unitate de învățare', d: 'M12 3 21 8 12 13 3 8ZM3 12.5l9 5 9-5M3 16.5l9 5 9-5' },
  { type: 'rubric', label: 'Barem', d: 'M4 5h16v14H4zM7.5 9l1.5 1.5L11.5 8M7.5 15l1.5 1.5 2.5-2.5M14 9.5h3M14 15.5h3' },
  { type: 'presentation', label: 'Prezentare', d: 'M3 4h18M4 4v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4M12 15v5M8 20h8M8 11l3-3 2 2 3-3' },
  { type: 'fun', label: 'Fun Prof', warm: true, d: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01' },
];

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const dark = useDark();
  const { session } = useAuth();
  const signedIn = Boolean(session);
  const { progress } = usePortfolio(signedIn);
  const [text, setText] = useState('');
  // Caseta lui Profi: textul ajunge în caseta Asistentului; fără cont, la intrarea în cont.
  const ask = () => {
    const message = text.trim();
    if (!message) return;
    if (session === null) router.navigate('/cont/intrare');
    else {
      router.navigate({ pathname: '/asistent', params: { seed: message } });
      setText('');
    }
  };
  const pick = (type: DocumentType) => {
    if (session === null) router.navigate('/cont/intrare');
    else router.navigate({ pathname: '/asistent', params: { type } });
  };
  const tone = (t: (typeof MAIN)[number]['tone']) =>
    t === 'dark'
      ? { card: { backgroundColor: theme.dark }, title: brand.onAccent, text: brand.onAccent, ctaBg: theme.surface, ctaText: theme.text }
      : t === 'soft'
        ? { card: { backgroundColor: theme.soft, borderColor: theme.softBorder, borderWidth: 1 }, title: theme.text, text: theme.muted, ctaBg: theme.accent, ctaText: brand.onAccent }
        : { card: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, title: theme.text, text: theme.muted, ctaBg: theme.text, ctaText: theme.surface };

  return (
    <Screen loading={session === undefined}>
      <View style={styles.headText}>
        <ThemedText type="title" accessibilityRole="header">
          Ce pregătim azi?
        </ThemedText>
      </View>
      <View style={styles.head}>
        <View style={[styles.say, { backgroundColor: theme.soft, borderColor: theme.softBorder }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Scrie-mi ce pregătim azi…"
            placeholderTextColor={theme.muted}
            accessibilityLabel="Scrie-i lui Profi; mesajul se deschide în Asistentul virtual"
            returnKeyType="send"
            onSubmitEditing={ask}
            maxLength={4000}
            style={[styles.sayInput, { color: theme.text }]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Trimite lui Profi"
            accessibilityState={{ disabled: !text.trim() }}
            disabled={!text.trim()}
            onPress={ask}
            style={[styles.saySend, { opacity: text.trim() ? 1 : 0.4, backgroundColor: theme.accent }]}>
            <ArrowUpIcon size={18} color={brand.onAccent} />
          </Pressable>
        </View>
        <Profi width={72} />
      </View>

      {session === null ? (
        <Card title="Cont ProfPlus">
          <ThemedText themeColor="muted">Creează un cont ca să generezi materiale și să-ți păstrezi clasele și documentele.</ThemedText>
          <Button onPress={() => router.navigate({pathname: '/cont/intrare', params: {mod: 'cont-nou'}})}>Creează cont</Button>
          <Button variant="secondary" onPress={() => router.navigate('/cont/intrare')}>Intră în cont</Button>
        </Card>
      ) : null}

      {MAIN.map((card) => {
        const c = tone(card.tone);
        return (
          <Pressable
            key={card.type}
            accessibilityRole="button"
            accessibilityLabel={`${card.title}: ${card.text} ${card.cta}`}
            onPress={() => pick(card.type)}
            style={({ pressed }) => [styles.main, c.card, pressed && styles.pressed]}>
            <ThemedText style={[styles.mainTitle, { color: c.title }]}>{card.title}</ThemedText>
            <ThemedText style={{ color: c.text }}>{card.text}</ThemedText>
            <View style={[styles.cta, { backgroundColor: c.ctaBg }]}>
              <ThemedText type="smallBold" style={{ color: c.ctaText }}>
                {card.cta} →
              </ThemedText>
            </View>
          </Pressable>
        );
      })}

      <ThemedText type="subtitle" accessibilityRole="header">
        Mai poți crea
      </ThemedText>
      <View style={styles.moreGrid}>
        {MORE.map((card) => (
          <Pressable
            key={card.type}
            accessibilityRole="button"
            accessibilityLabel={`Creează: ${card.label}`}
            onPress={() => pick(card.type)}
            style={({ pressed }) => [styles.more, { backgroundColor: theme.surface, borderColor: pressed ? theme.accent : theme.border }]}>
            <View style={[styles.moreIcon, { backgroundColor: card.warm ? (dark ? '#3A2A14' : '#FDF0DC') : theme.soft }]}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={card.warm ? (dark ? '#F5C27A' : '#8A4B00') : theme.softText} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d={card.d} />
              </Svg>
            </View>
            <ThemedText type="smallBold" style={styles.moreLabel}>
              {card.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Card>
        <InfoHeading title="Portofoliul profesional, mereu în ordine" label="Despre portofoliul profesional">
          <ThemedText type="small">
            Conform noii metodologii (OMEC nr. 3.858/2026), fiecare profesor trebuie să aibă un portofoliu profesional. Acesta contează la definitivat, grade
            didactice, evaluarea anuală, inspecții și gradații de merit. ProfPlus păstrează toate documentele din structura-cadru, pe secțiuni, cu opisul actualizat
            automat. Pe cele pe care le poți redacta, le generezi împreună cu Profi.
          </ThemedText>
        </InfoHeading>
        <ThemedText type="small" themeColor="muted">
          Obligatoriu din anul școlar 2026–2027, după OMEC nr. 3.858/2026.
        </ThemedText>
        {signedIn ? (
          <>
            <ThemedText type="small" themeColor="muted">
              {progress.done} din {progress.total} documente adăugate
            </ThemedText>
            <ProgressBar done={progress.done} total={progress.total} label="Progresul portofoliului" />
          </>
        ) : null}
        <Button onPress={() => router.navigate('/documente')}>Mergi la Documente personale</Button>
      </Card>

      {session !== undefined ? <HomeNews key={session?.user.id ?? 'visitor'} accountId={session?.user.id} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.one },
  headText: { gap: 4 },
  say: { flex: 1, marginBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: radius.md, borderBottomRightRadius: 4, paddingLeft: 14, padding: 4 },
  sayInput: { flex: 1, minHeight: 40, fontSize: 16 },
  saySend: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  main: { borderRadius: radius.md, padding: 22, gap: 10 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  mainTitle: { fontSize: 28, lineHeight: 32, fontWeight: '600' },
  cta: { alignSelf: 'flex-start', minHeight: 44, borderRadius: radius.md, paddingHorizontal: 16, justifyContent: 'center', marginTop: 4 },
  moreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  more: { flexGrow: 1, flexBasis: '45%', minHeight: 68, borderRadius: radius.md, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  moreIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  moreLabel: { flex: 1 },
});
