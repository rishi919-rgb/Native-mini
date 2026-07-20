import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@surveys_v1';
export const DRAFT_KEY = '@draft_survey';
export const LAST_PHOTO = '@last_photo';
export const EDIT_SURVEY_KEY = '@edit_survey';
export const EDIT_SURVEY_ID_KEY = '@editing_survey_id';

// Utility to compress base64 images to ~15KB to avoid QuotaExceededError
export async function compressPhoto(photoUri) {
  if (!photoUri || typeof photoUri !== 'string') return photoUri;
  if (!photoUri.startsWith('data:image')) return photoUri;
  if (photoUri.length < 30000) return photoUri; // Already small enough

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 400;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > MAX) { h *= MAX / w; w = MAX; }
          } else {
            if (h > MAX) { w *= MAX / h; h = MAX; }
          }
          canvas.width = Math.round(w);
          canvas.height = Math.round(h);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.5));
          } else {
            resolve(photoUri);
          }
        };
        img.onerror = () => resolve(photoUri);
        img.src = photoUri;
      });
    } catch (e) {
      return photoUri;
    }
  }
  return photoUri;
}

// Utility to deduplicate an array of survey objects by ID
export function deduplicateSurveys(list) {
  if (!Array.isArray(list)) return [];
  const map = new Map();
  for (const item of list) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

// Fetch all surveys safely with deduplication
export async function getSurveys() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return deduplicateSurveys(list);
  } catch (e) {
    console.warn('Error reading surveys from storage:', e);
    return [];
  }
}

// Save surveys safely with automatic photo compression and QuotaExceededError fallback protection
export async function saveSurveys(surveysList) {
  const cleanList = deduplicateSurveys(surveysList);
  
  // Compress any large photo base64 strings
  const compressedList = await Promise.all(
    cleanList.map(async (item) => {
      if (item && item.photo && typeof item.photo === 'string' && item.photo.length > 30000) {
        const compressed = await compressPhoto(item.photo);
        return { ...item, photo: compressed };
      }
      return item;
    })
  );

  const jsonString = JSON.stringify(compressedList);
  
  try {
    await AsyncStorage.setItem(STORAGE_KEY, jsonString);
    return true;
  } catch (e) {
    console.warn('Storage quota warning. Applying emergency fallback optimization...', e);
    
    // Fallback strategy 1: Strip large photo data URLs from items older than the most recent 2
    const trimmedList = compressedList.map((item, index) => {
      if (index >= 2 && item.photo && item.photo.length > 2000) {
        return { ...item, photo: null };
      }
      return item;
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedList));
      return true;
    } catch (e2) {
      // Fallback strategy 2: Keep only top 20 items and strip all photo URLs
      const compactList = trimmedList.slice(0, 20).map(item => ({ ...item, photo: null }));
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(compactList));
        return true;
      } catch (e3) {
        console.error('Critical storage failure:', e3);
        return false;
      }
    }
  }
}
