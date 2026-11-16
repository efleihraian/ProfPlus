// Alegerea unui fișier pentru încărcare: o fotografie făcută acum cu camera (senzorul camerei) sau un fișier din telefon.
// Serverul acceptă pentru portofoliu PDF, DOC, DOCX, PPTX, TXT, MD, HTML, JPG și PNG, de cel mult 10 MB (app/api/documents).
import * as DocumentPicker from 'expo-document-picker';
import { File as LocalFile } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { log } from '@/lib/log';

export type PickedFile = { uri: string; name: string; type: string; size?: number };
export type PickResult = { file: PickedFile } | { error: string } | null;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'text/html',
  'image/jpeg',
  'image/png',
];

const tooLarge = (size?: number) => typeof size === 'number' && size > MAX_UPLOAD_BYTES;

/** Fotografiază un document. Permisiunea camerei se cere doar acum, la prima folosire. */
export async function takePhoto(label: string): Promise<PickResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    log('info', 'camera_permission_denied', { canAskAgain: permission.canAskAgain });
    return {
      error: permission.canAskAgain
        ? 'Fără acces la cameră nu putem fotografia documentul.'
        : 'Accesul la cameră este oprit. Îl poți porni din Setări → Aplicații → ProfPlus → Permisiuni.',
    };
  }
  // Calitatea 0,7 păstrează textul lizibil și ține poza mult sub 10 MB.
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, exif: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (tooLarge(asset.fileSize)) return { error: 'Fotografia depășește 10 MB. Încearcă din nou, mai de aproape.' };
  const date = new Date().toISOString().slice(0, 10);
  return { file: { uri: asset.uri, name: `Fotografie ${label} ${date}.jpg`, type: asset.mimeType ?? 'image/jpeg', size: asset.fileSize } };
}

/** Alege un fișier existent (PDF, Word, poză etc.). */
/** Biblioteca personală primește doar documente (fără poze), ca pe site. */
export const LIBRARY_TYPES = DOCUMENT_TYPES.filter((type) => !type.startsWith('image/'));

export async function pickDocument(types: string[] = DOCUMENT_TYPES): Promise<PickResult> {
  const result = await DocumentPicker.getDocumentAsync({ type: types, copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (tooLarge(asset.size)) return { error: 'Fișierul depășește 10 MB. Alege unul mai mic.' };
  return { file: { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream', size: asset.size } };
}

/** Corpul multipart al încărcării. Fetch-ul Expo nu acceptă forma veche React Native `{uri}`, ci o parte cu
 * `name`, `type` și `bytes()`; octeții se citesc din fișierul local abia la trimitere (cel mult 10 MB). */
export function uploadForm(file: PickedFile, fields: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  const part = { name: file.name, type: file.type, bytes: () => new LocalFile(file.uri).bytes() };
  form.append('file', part as unknown as Blob);
  return form;
}
