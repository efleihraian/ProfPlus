import { File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

import type { PortfolioFile } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
};

export async function openPortfolioFile(file: Pick<PortfolioFile, 'id' | 'name'>) {
  if (!(await isAvailableAsync())) throw new Error('Telefonul nu permite deschiderea fișierelor din aplicație.');
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  if (!token) throw new Error('Intră din nou în cont ca să deschizi fișierul.');
  const name = file.name.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').slice(-120) || 'document';
  const ext = (/\.([a-z0-9]+)$/i.exec(name)?.[1] ?? '').toLowerCase();
  const target = new File(Paths.cache, name);
  const url = (process.env.EXPO_PUBLIC_API_URL ?? '') + '/api/documents/' + encodeURIComponent(file.id);
  const saved = await File.downloadFileAsync(url, target, { headers: { Authorization: 'Bearer ' + token }, idempotent: true });
  await shareAsync(saved.uri, { mimeType: MIME[ext] ?? 'application/octet-stream', dialogTitle: name });
}
