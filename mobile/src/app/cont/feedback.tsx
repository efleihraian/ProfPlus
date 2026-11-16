// P-291 — feedback din aplicație, ca pe site: tipul, textul și cel mult 5 imagini din galerie (selectorul sistemului, fără acces
// la toată galeria). P-310: fără lista „Feedback-ul tău”; textul sugerat urmează tipul ales. Imaginile sunt reîncodate ca JPEG, fără EXIF (deci fără locație).
import Constants from 'expo-constants';
import { File as LocalFile } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Choice } from '@/components/account/choice';
import { Notice } from '@/components/account/notice';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CloseIcon } from '@/components/ui/icons';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, ApiError } from '@/lib/api';
import type { Outcome } from '@/lib/auth';
import { log } from '@/lib/log';
import {
  FEEDBACK_CATEGORIES, FEEDBACK_MAX_IMAGES, FEEDBACK_MAX_IMAGE_BYTES, FEEDBACK_MAX_TEXT, FEEDBACK_MIN_TEXT,
  feedbackPlaceholder, type FeedbackCategory,
} from '../../../../web/shared/feedback';

type Picked = { uri: string; size?: number };

export default function FeedbackScreen() {
  const theme = useTheme();
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [text, setText] = useState('');
  const [images, setImages] = useState<Picked[]>([]);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const length = text.trim().length;


  async function pick() {
    setOutcome(null);
    const room = FEEDBACK_MAX_IMAGES - images.length;
    if (room <= 0) return;
    // Calitatea 0,4 ține o fotografie sau o captură de ecran sub 2 MB, cu textul lizibil.
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: room, quality: 0.4, exif: false });
    if (result.canceled) return;
    const chosen = result.assets.slice(0, room).map((asset) => ({ uri: asset.uri, size: asset.fileSize }));
    const tooBig = chosen.filter((image) => typeof image.size === 'number' && image.size > FEEDBACK_MAX_IMAGE_BYTES);
    if (tooBig.length) setOutcome({ error: 'O imagine depășește 2 MB și nu a fost adăugată.' });
    setImages((current) => [...current, ...chosen.filter((image) => !tooBig.includes(image))].slice(0, FEEDBACK_MAX_IMAGES));
  }

  async function submit() {
    setOutcome(null);
    if (!category || length < FEEDBACK_MIN_TEXT) return;
    const form = new FormData();
    form.append('category', category);
    form.append('body', text);
    form.append('platform', Platform.OS === 'ios' ? 'ios' : 'android');
    form.append('page', '/cont/feedback');
    form.append('appVersion', Constants.expoConfig?.version ?? '');
    images.forEach((image, index) => {
      const part = { name: `imagine-${index + 1}.jpg`, type: 'image/jpeg', bytes: () => new LocalFile(image.uri).bytes() };
      form.append('images', part as unknown as Blob);
    });
    setBusy(true);
    try {
      await api.feedback.submit(form);
      setCategory(null);
      setText('');
      setImages([]);
      setOutcome({ message: 'Mulțumim! Am primit feedback-ul tău.' });
    } catch (e) {
      log('error', 'feedback_submit_failed', { status: e instanceof ApiError ? e.status : undefined }, e);
      setOutcome({ error: e instanceof ApiError ? e.message : 'Feedback-ul nu a putut fi trimis. Verifică internetul și reîncearcă.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Feedback" intro="Spune-ne ce nu merge sau ce ți-ar fi de folos. Citim fiecare mesaj." back>
      <Card>
        <ThemedText type="smallBold" themeColor="muted">Despre ce este?</ThemedText>
        <View accessibilityRole="radiogroup" style={styles.choices}>
          {FEEDBACK_CATEGORIES.map((c) => (
            <Choice key={c.id} kind="radio" label={`${c.label} · ${c.hint}`} selected={category === c.id} disabled={busy} onPress={() => setCategory(c.id)} />
          ))}
        </View>
        <TextField
          label="Mesajul tău"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={FEEDBACK_MAX_TEXT}
          editable={!busy}
          placeholder={feedbackPlaceholder(category)}
          style={styles.text}
        />
        <ThemedText type="small" themeColor="muted" style={styles.count}>{length} / {FEEDBACK_MAX_TEXT}</ThemedText>
        {images.length ? (
          <View style={styles.images}>
            {images.map((image, index) => (
              <View key={image.uri} style={[styles.thumb, { borderColor: theme.border }]}>
                <Image source={{ uri: image.uri }} style={styles.thumbImage} accessibilityLabel={`Imaginea ${index + 1}`} />
                <Pressable accessibilityRole="button" accessibilityLabel={`Scoate imaginea ${index + 1}`} hitSlop={8} disabled={busy}
                  onPress={() => setImages((current) => current.filter((item) => item.uri !== image.uri))} style={styles.remove}>
                  <CloseIcon color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        {images.length < FEEDBACK_MAX_IMAGES ? (
          <Button variant="secondary" onPress={() => void pick()} disabled={busy}>{`Adaugă imagini (${images.length}/${FEEDBACK_MAX_IMAGES})`}</Button>
        ) : null}
        <ThemedText type="small" themeColor="muted">Nu include date despre elevi (nume, note) în text sau în capturi.</ThemedText>
        <Notice outcome={outcome} />
        <Button onPress={() => void submit()} loading={busy} disabled={!category || length < FEEDBACK_MIN_TEXT}>
          {busy ? 'Se trimite…' : 'Trimite feedback'}
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  choices: { gap: Spacing.two },
  text: { minHeight: 120, textAlignVertical: 'top' },
  count: { alignSelf: 'flex-end' },
  images: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  thumb: { width: 84, height: 84, borderRadius: radius.sm, borderWidth: 1, overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  remove: { position: 'absolute', top: 4, right: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(20,16,10,0.7)', alignItems: 'center', justifyContent: 'center' },
});
