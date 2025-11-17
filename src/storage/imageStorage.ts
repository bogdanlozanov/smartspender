import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const RECEIPT_IMAGES_DIR = `${FileSystem.documentDirectory}receipts`;

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(RECEIPT_IMAGES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(RECEIPT_IMAGES_DIR, { intermediates: true });
  }
};

export const saveImage = async (uri: string): Promise<string> => {
  await ensureDirExists();
  const extension = uri.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const destination = `${RECEIPT_IMAGES_DIR}/${filename}`;

  if (Platform.OS === 'ios') {
    await FileSystem.copyAsync({ from: uri, to: destination });
  } else {
    try {
      await FileSystem.moveAsync({ from: uri, to: destination });
    } catch {
      await FileSystem.copyAsync({ from: uri, to: destination });
    }
  }

  return destination;
};

export const deleteImage = async (uri: string) => {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.warn('Failed to delete image', error);
  }
};

export const clearAllImages = async () => {
  try {
    await FileSystem.deleteAsync(RECEIPT_IMAGES_DIR, { idempotent: true });
    await ensureDirExists();
  } catch (error) {
    console.warn('Failed to clear receipt images', error);
  }
};
