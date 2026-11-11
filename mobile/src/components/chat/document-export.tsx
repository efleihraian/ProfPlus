// Export Word și PDF: aplicația deschide invizibil pagina de export a site-ului, deci fișierul iese identic cu cel de pe
// profplus.ro (formule, Times New Roman, surse). Documentul e dat paginii direct pe telefon, nu trece printr-un server.
import { useEffect, useRef, useState, type ComponentType, type RefAttributes } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { WebView as NativeWebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/components/ui/coming-soon';
import { Spacing } from '@/constants/theme';
import type { ChatSource, GeneratedDocument } from '@/lib/api';
import { shareExportedFile } from '@/lib/document-share';
import { log } from '@/lib/log';
import { appExportFormats, documentShape, type ExportFormat } from '../../../../web/shared/document-formats';

type AppFormat = Exclude<ExportFormat, 'tex'>;
const LABELS: Record<AppFormat, string> = { pptx: 'PowerPoint', docx: 'Word', pdf: 'PDF' };

// P-168: butoanele urmează tipul documentului (prezentare → PowerPoint, PDF, Word; document text → Word, PDF).
type Format = AppFormat;
type Result = { ready: true } | { ok: true; base64: string; name: string; mime: string; warnings: string[] } | { ok: false; error: string };

// Tipurile bibliotecii nu se potrivesc cu React Native 0.88 (propsurile devin `never`), deci declarăm ce folosim de aici.
type Page = { injectJavaScript: (code: string) => void };
type PageProps = ViewProps & {
  source: { uri: string };
  originWhitelist: string[];
  onMessage: (event: { nativeEvent: { data: string } }) => void;
  onError: () => void;
  onHttpError: () => void;
};
const WebView = NativeWebView as unknown as ComponentType<PageProps & RefAttributes<Page>>;

const EXPORT_URL = SITE_URL + '/mobile-export';
const TIMEOUT_MS = 60_000;
const UNAVAILABLE = 'Exportul nu a mers. Verifică internetul și reîncearcă.';

export function DocumentExport({ document, sources }: { document: GeneratedDocument; sources?: ChatSource[] }) {
  const [format, setFormat] = useState<Format | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const page = useRef<Page>(null);
  // Text documents keep Word first (as before); presentations put PowerPoint first.
  const shape = documentShape(document.title, document.content);
  const formats: AppFormat[] = shape === 'presentation' ? appExportFormats(shape) : ['docx', 'pdf'];

  useEffect(() => {
    if (!format) return;
    const timer = setTimeout(() => {
      log('error', 'document_export_timeout', { format });
      setError(UNAVAILABLE);
      setFormat(null);
    }, TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [format]);

  function start(next: Format) {
    setError(null);
    setWarnings([]);
    setFormat(next);
  }

  function fail(event: string, message: string, cause?: unknown) {
    log('error', event, { format }, cause);
    setError(message);
    setFormat(null);
  }

  async function onMessage(event: { nativeEvent: { data: string } }) {
    let result: Result;
    try {
      result = JSON.parse(event.nativeEvent.data) as Result;
    } catch (e) {
      fail('document_export_failed', UNAVAILABLE, e);
      return;
    }
    if ('ready' in result) {
      const request = JSON.stringify({ format, document, sources: sources ?? [] });
      page.current?.injectJavaScript(`window.profplusExport(${request});true;`);
      return;
    }
    if (!result.ok) {
      fail('document_export_failed', result.error);
      return;
    }
    try {
      setWarnings(result.warnings);
      await shareExportedFile(result.base64, result.name, result.mime);
      setFormat(null);
    } catch (e) {
      fail('document_share_failed', e instanceof Error ? e.message : 'Fișierul nu a putut fi partajat.', e);
    }
  }

  return (
    <View style={styles.box}>
      <View style={styles.buttons}>
        {formats.map((item) => (
          <View key={item} style={styles.button}>
            <Button variant="secondary" loading={format === item} disabled={!!format} onPress={() => start(item)}>
              {LABELS[item]}
            </Button>
          </View>
        ))}
      </View>
      {error ? (
        <ThemedText type="small" themeColor="dangerText" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}
      {warnings.map((warning) => (
        <ThemedText key={warning} type="small" themeColor="muted">
          {warning}
        </ThemedText>
      ))}
      {format ? (
        <WebView
          ref={page}
          source={{ uri: EXPORT_URL }}
          originWhitelist={[SITE_URL]}
          onMessage={onMessage}
          onError={() => fail('document_export_page_failed', UNAVAILABLE)}
          onHttpError={() => fail('document_export_page_failed', UNAVAILABLE)}
          style={styles.hidden}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: Spacing.two },
  buttons: { flexDirection: 'row', gap: Spacing.two },
  button: { flex: 1 },
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
