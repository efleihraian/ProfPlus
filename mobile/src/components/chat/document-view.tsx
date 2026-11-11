// Documentele generate: în conversație apar ca o pagină, iar la deschidere se citesc ca pe hârtie, cu Word și PDF alături.
import { openBrowserAsync } from 'expo-web-browser';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DocumentExport } from '@/components/chat/document-export';
import { MarkdownText, PAPER_FONT } from '@/components/chat/markdown-text';
import { ThemedText } from '@/components/themed-text';
import { SITE_URL } from '@/components/ui/coming-soon';
import { Colors, radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChatSource, GeneratedDocument } from '@/lib/api';
import { documentPreview, documentText } from '@/lib/document-view';

const paper = Colors.light;

export function DocumentCard({ document, onOpen }: { document: GeneratedDocument; onOpen: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Deschide documentul ${document.title}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.soft, borderColor: theme.softBorder }, pressed && styles.pressed]}>
      <View style={[styles.sheet, { backgroundColor: paper.surface, borderColor: paper.border }]}>
        <ThemedText style={[styles.sheetTitle, { color: paper.text }]} numberOfLines={2}>
          {document.title}
        </ThemedText>
        <ThemedText style={[styles.sheetText, { color: paper.muted }]} numberOfLines={3}>
          {documentPreview(document.content, document.title)}
        </ThemedText>
      </View>
      <ThemedText type="linkPrimary">Deschide documentul</ThemedText>
    </Pressable>
  );
}

type ViewerProps = { document: GeneratedDocument; sources?: ChatSource[]; visible: boolean; onClose: () => void };

export function DocumentViewer({ document, sources, visible, onClose }: ViewerProps) {
  const theme = useTheme();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemedText type="subtitle" accessibilityRole="header" numberOfLines={1} style={styles.flex}>
            Document
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
            <ThemedText type="linkPrimary">Închide</ThemedText>
          </Pressable>
        </View>
        <ScrollView style={styles.flex} contentContainerStyle={styles.desk}>
          <View style={[styles.page, { backgroundColor: paper.surface, borderColor: paper.border }]}>
            <ThemedText accessibilityRole="header" selectable style={[styles.title, { color: paper.text }]}>
              {document.title}
            </ThemedText>
            <MarkdownText content={documentText(document.content, document.title)} paper />
          </View>
        </ScrollView>
        <View style={[styles.footer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <DocumentExport document={document} sources={sources} />
          <Pressable accessibilityRole="link" onPress={() => openBrowserAsync(SITE_URL)} style={styles.site}>
            <ThemedText type="small" themeColor="muted">
              Editarea se face pe profplus.ro
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: 12, gap: Spacing.two },
  pressed: { opacity: 0.8 },
  sheet: { borderWidth: 1, borderRadius: radius.xs, padding: 14, gap: 6 },
  sheetTitle: { fontFamily: PAPER_FONT, fontSize: 17, lineHeight: 23, fontWeight: 700, textAlign: 'center' },
  sheetText: { fontFamily: PAPER_FONT, fontSize: 13, lineHeight: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: 6, borderBottomWidth: 1 },
  close: { minHeight: 44, justifyContent: 'center' },
  desk: { padding: Spacing.two },
  page: { borderWidth: 1, borderRadius: radius.xs, paddingHorizontal: 20, paddingVertical: 24, gap: Spacing.three },
  title: { fontFamily: PAPER_FONT, fontSize: 21, lineHeight: 28, fontWeight: 700, textAlign: 'center' },
  footer: { borderTopWidth: 1, padding: Spacing.two, gap: 4 },
  site: { minHeight: 32, alignItems: 'center', justifyContent: 'center' },
});
