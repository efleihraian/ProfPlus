import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

import { log } from '@/lib/log';

export type ChatImage = { name: string; data: string };
export const MAX_CHAT_PHOTOS = 15;
const MAX_BYTES = 4 * 1024 * 1024;
export const MAX_CHAT_PHOTOS_TOTAL = 12 * 1024 * 1024;
const QUALITY = 0.35;
const bytesOf = (photo: ChatImage) => (photo.data.length - photo.data.indexOf(',') - 1) * 0.75;
export const photosBytes = (photos: ChatImage[]) => photos.reduce((sum, photo) => sum + bytesOf(photo), 0);
const NOTICE_KEY = 'profplus-photo-notice-v1';

async function noticeAccepted(): Promise<boolean> {
  try {
    if (await SecureStore.getItemAsync(NOTICE_KEY)) return true;
  } catch {
  }
  const accepted = await new Promise<boolean>((resolve) =>
    Alert.alert(
      'Fotografii trimise lui Profi',
      'Fotografia este trimisă o singură dată, fără date de localizare, serviciului AI (OpenAI), doar pentru răspunsul la acest mesaj. ProfPlus nu o salvează; în conversație rămâne doar mențiunea că ai atașat o fotografie.\n\nNu fotografia elevi, fețe sau date personale (nume, note, catalog). Permisiunea camerei o poți retrage din setările telefonului. Detalii: profplus.ro/confidentialitate.',
      [
        { text: 'Renunț', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Am înțeles', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    ),
  );
  if (accepted) {
    try {
      await SecureStore.setItemAsync(NOTICE_KEY, new Date().toISOString());
    } catch {
    }
  }
  return accepted;
}

export async function takeChatPhoto(): Promise<{ photo: ChatImage } | { error: string } | null> {
  if (!(await noticeAccepted())) return null;
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    log('info', 'camera_permission_denied', { canAskAgain: permission.canAskAgain, where: 'chat' });
    return {
      error: permission.canAskAgain
        ? 'Fără acces la cameră nu putem fotografia exercițiul.'
        : 'Accesul la cameră este oprit. Îl poți porni din Setări → Aplicații → ProfPlus → Permisiuni.',
    };
  }
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: QUALITY, exif: false, base64: true });
  if (result.canceled) return null;
  const photo = toChatImage(result.assets[0]);
  return typeof photo === 'string' ? { error: photo } : { photo };
}

function toChatImage(asset: ImagePicker.ImagePickerAsset): ChatImage | string {
  const mime = asset.mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
  if (!asset.base64 || (asset.mimeType && !['image/jpeg', 'image/jpg', 'image/png'].includes(asset.mimeType)))
    return 'Fotografia nu a putut fi pregătită. Alege o fotografie JPG sau PNG.';
  if ((asset.base64.length * 3) / 4 > MAX_BYTES) return 'Fotografia este prea mare. Încearcă din nou, mai de aproape.';
  const time = new Date().toTimeString().slice(0, 5);
  return { name: `Fotografie ${time}.${mime === 'image/png' ? 'png' : 'jpg'}`, data: `data:${mime};base64,${asset.base64}` };
}

export async function pickChatPhotos(room: number): Promise<{ photos: ChatImage[]; error?: string } | null> {
  if (room <= 0) return { photos: [], error: `Poți atașa cel mult ${MAX_CHAT_PHOTOS} fotografii la un mesaj.` };
  if (!(await noticeAccepted())) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: room > 1,
    selectionLimit: room,
    quality: QUALITY,
    exif: false,
    base64: true,
  });
  if (result.canceled) return null;
  const photos: ChatImage[] = [];
  let error: string | undefined;
  for (const asset of result.assets.slice(0, room)) {
    const photo = toChatImage(asset);
    if (typeof photo === 'string') error = photo;
    else photos.push(photo);
  }
  if (result.assets.length > room) error = `Am păstrat primele ${MAX_CHAT_PHOTOS} fotografii.`;
  return { photos, error };
}

export function withinTotal(current: ChatImage[], added: ChatImage[]): { photos: ChatImage[]; error?: string } {
  const photos = [...current];
  let skipped = 0;
  for (const photo of added) {
    if (photos.length >= MAX_CHAT_PHOTOS || photosBytes([...photos, photo]) > MAX_CHAT_PHOTOS_TOTAL) skipped++;
    else photos.push(photo);
  }
  return skipped ? { photos, error: `${skipped === 1 ? 'O fotografie nu a mai încăput' : skipped + ' fotografii nu au mai încăput'} în limita unui mesaj (${MAX_CHAT_PHOTOS} fotografii, 12 MB în total).` } : { photos };
}

export const photoMarker = (count: number) => (count === 1 ? '[1 fotografie atașată temporar]' : `[${count} fotografii atașate temporar]`);
