// Un mesaj din conversație: al profesorului (dreapta, verde deschis) sau al lui Profi (stânga, card alb cu surse).
import { openBrowserAsync } from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { DocumentCard, DocumentViewer } from '@/components/chat/document-view';
import { MarkdownText } from '@/components/chat/markdown-text';
import { ProfiAvatar } from '@/components/profi';
import { ThemedText } from '@/components/themed-text';
import { cardSurface, Spacing } from '@/constants/theme';
import { useDark, useTheme } from '@/hooks/use-theme';
import type { ChatMessage, ChatSource } from '@/lib/api';

function sourceLabel(source: ChatSource) {
  const details = [source.schoolClass, source.publisher, source.page ? `p. ${source.page}` : null].filter(Boolean).join(' · ');
  // P-210: fragment dintr-un material partajat de un profesor și verificat; originalul nu se deschide.
  if (source.shared) return `${source.title} — material partajat de un profesor`;
  return details ? `${source.title} — ${details}` : source.title;
}

// Manualele și paginile web se deschid în browser; documentele proprii cer contul, deci rămân doar ca titlu.
const openable = (source: ChatSource) => source.kind !== 'document' && /^https:\/\//.test(source.url);

// `opened`: documentul abia generat se deschide singur, ca pe site.
// `onFollowUp` (P-211): propunerile Fun Prof de sub ultimul răspuns trimit cererea direct.
export function MessageBubble({ message, opened = false, onFollowUp }: { message: ChatMessage; opened?: boolean; onFollowUp?: (text: string) => void }) {
  const theme = useTheme();
  const dark = useDark();
  const [reading, setReading] = useState(opened);

  if (message.role === 'user') {
    return (
      <View style={[styles.user, { backgroundColor: theme.soft }]}>
        <ThemedText selectable>{message.content}</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.assistant, { backgroundColor: theme.surface, borderColor: theme.border }, cardSurface(dark)]}>
      <View style={styles.author}>
        <ProfiAvatar />
        <ThemedText type="smallBold" themeColor="softText">
          Profi
        </ThemedText>
      </View>
      {message.document ? (
        <>
          <DocumentCard document={message.document} onOpen={() => setReading(true)} />
          <DocumentViewer document={message.document} sources={message.sources} visible={reading} onClose={() => setReading(false)} />
        </>
      ) : (
        <MarkdownText content={message.content} />
      )}
      {message.warnings?.length ? (
        <View style={[styles.warning, { backgroundColor: theme.dangerSoft, borderColor: theme.dangerBorder }]}>
          {message.warnings.map((warning) => (
            <ThemedText key={warning} type="small" themeColor="dangerText">
              {warning}
            </ThemedText>
          ))}
        </View>
      ) : null}
      {message.sources?.length ? (
        <View style={[styles.sources, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="muted">
            Surse
          </ThemedText>
          {message.sources.map((source) =>
            openable(source) ? (
              <Pressable key={source.id} accessibilityRole="link" onPress={() => openBrowserAsync(source.url)} style={styles.source}>
                <ThemedText type="small" themeColor="accentText">
                  [{source.id}] {sourceLabel(source)}
                </ThemedText>
              </Pressable>
            ) : (
              <ThemedText key={source.id} type="small" themeColor="muted" style={styles.source}>
                [{source.id}] {sourceLabel(source)}
              </ThemedText>
            ),
          )}
        </View>
      ) : null}
      {onFollowUp && message.followUps?.length ? (
        <View style={styles.followUps} accessibilityLabel="Propuneri pentru pasul următor">
          {message.followUps.map((text) => (
            <Pressable
              key={text}
              accessibilityRole="button"
              onPress={() => onFollowUp(text)}
              style={({ pressed }) => [styles.followUp, { backgroundColor: pressed ? theme.fillStrong : theme.soft, borderColor: theme.border }]}>
              <ThemedText type="small">{text}</ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  followUps: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  followUp: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8 },
  user: { alignSelf: 'flex-end', maxWidth: '88%', borderRadius: 22, borderBottomRightRadius: 6, paddingVertical: 12, paddingHorizontal: 16 },
  assistant: { alignSelf: 'stretch', borderRadius: 22, borderBottomLeftRadius: 6, padding: 16, gap: Spacing.two },
  author: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  warning: { borderRadius: 14, padding: 12, gap: 4 },
  sources: { borderTopWidth: 1, paddingTop: Spacing.two, gap: 2 },
  source: { paddingVertical: 6 },
});
