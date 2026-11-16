// Fișierul exportat ajunge în memoria temporară a aplicației, apoi în meniul de partajare al telefonului
// (WhatsApp, email, salvare în Fișiere). Aplicația nu păstrează o copie proprie: exportul următor o înlocuiește.
import { File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

export async function shareExportedFile(base64: string, name: string, mime: string) {
  if (!(await isAvailableAsync())) throw new Error('Telefonul nu permite partajarea fișierelor.');
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(base64, { encoding: 'base64' });
  await shareAsync(file.uri, { mimeType: mime, dialogTitle: name });
}
