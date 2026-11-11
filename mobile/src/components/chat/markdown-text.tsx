// Afișează răspunsurile lui Profi: titluri, liste, paragrafe, **îngroșat** și citări [n].
// Formulele LaTeX simple devin text lizibil (lib/readable-math.ts).
import { Platform, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withMath } from '@/lib/readable-math';

/** Fontul paginii de document, cel mai apropiat de Times New Roman din exportul Word și PDF. */
export const PAPER_FONT = Platform.select({ ios: 'Times New Roman', default: 'serif' });

function Inline({ text, paper }: { text: string; paper?: boolean }) {
  const current = useTheme();
  const theme = paper ? Colors.light : current;
  const parts = withMath(text).split(/(\*\*[^*]+\*\*|\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Text key={i} style={styles.bold}>
            {part.slice(2, -2)}
          </Text>
        ) : /^\[\d+\]$/.test(part) ? (
          <Text key={i} style={[styles.citation, { color: theme.accentText }]}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </>
  );
}

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());

/** `paper`: pagina albă a unui document, cu aceleași culori și în tema întunecată. */
export function MarkdownText({ content, paper }: { content: string; paper?: boolean }) {
  const current = useTheme();
  const theme = paper ? Colors.light : current;
  const text = paper ? { color: theme.text, fontFamily: PAPER_FONT } : undefined;
  const blocks = content.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return (
    <View style={styles.blocks}>
      {blocks.map((block, b) => {
        const lines = block.split('\n').filter((l) => l.trim());
        if (!lines.length) return null;
        if (lines.length === 1 && /^\s*(?:-{3,}|\*{3,})\s*$/.test(lines[0])) {
          return <View key={b} style={[styles.rule, { backgroundColor: theme.border }]} />;
        }
        if (lines.length > 1 && lines[0].includes('|') && /^\s*\|?\s*:?-{3,}/.test(lines[1])) {
          return (
            <View key={b} style={[styles.table, { borderColor: theme.borderStrong }]}>
              {lines
                .filter((_, i) => i !== 1)
                .map((line, r) => (
                  <View key={r} style={[styles.row, r > 0 && styles.rowLine, { borderColor: theme.borderStrong }]}>
                    {cells(line).map((cell, c) => (
                      <ThemedText key={c} type="small" style={[styles.cell, c > 0 && styles.cellLine, { borderColor: theme.borderStrong }, r === 0 && styles.bold, text]}>
                        <Inline text={cell} paper={paper} />
                      </ThemedText>
                    ))}
                  </View>
                ))}
            </View>
          );
        }
        const heading = /^(#{1,4})\s+(.*)$/.exec(lines[0]);
        if (heading && lines.length === 1) {
          return (
            <ThemedText key={b} type={heading[1].length <= 2 ? 'subtitle' : 'smallBold'} accessibilityRole="header" style={text}>
              <Inline text={heading[2]} paper={paper} />
            </ThemedText>
          );
        }
        if (lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
          return (
            <View key={b} style={styles.list}>
              {lines.map((line, i) => {
                const m = /^(\s*)([-*•]|\d+[.)])\s+(.*)$/.exec(line)!;
                return (
                  <View key={i} style={[styles.item, { paddingLeft: Math.min(m[1].length, 6) * 4 }]}>
                    <ThemedText style={[styles.marker, { color: theme.accentText }, paper && text]}>{/\d/.test(m[2]) ? m[2] : '•'}</ThemedText>
                    <ThemedText style={[styles.itemText, text]}>
                      <Inline text={m[3]} paper={paper} />
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          );
        }
        return (
          <ThemedText key={b} selectable style={text}>
            {lines.map((line, i) => {
              const h = /^#{1,4}\s+(.*)$/.exec(line);
              return (
                <Text key={i} style={h ? styles.bold : undefined}>
                  {i ? '\n' : ''}
                  <Inline text={h ? h[1] : line} paper={paper} />
                </Text>
              );
            })}
          </ThemedText>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  blocks: { gap: 10 },
  list: { gap: 4 },
  item: { flexDirection: 'row', gap: 8 },
  marker: { minWidth: 18, fontWeight: 600 },
  itemText: { flex: 1 },
  bold: { fontWeight: 700 },
  rule: { height: 1 },
  table: { borderWidth: 1 },
  row: { flexDirection: 'row' },
  rowLine: { borderTopWidth: 1 },
  cell: { flex: 1, padding: 6 },
  cellLine: { borderLeftWidth: 1 },
  citation: { fontWeight: 600, fontSize: 13 },
});
