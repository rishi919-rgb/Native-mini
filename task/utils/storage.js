import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@surveys_v1';
export const DRAFT_KEY = '@draft_survey';
export const LAST_PHOTO = '@last_photo';
export const EDIT_SURVEY_KEY = '@edit_survey';
export const EDIT_SURVEY_ID_KEY = '@editing_survey_id';

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

// Save surveys safely with QuotaExceededError fallback protection
export async function saveSurveys(surveysList) {
  const cleanList = deduplicateSurveys(surveysList);
  const jsonString = JSON.stringify(cleanList);
  
  try {
    await AsyncStorage.setItem(STORAGE_KEY, jsonString);
    return true;
  } catch (e) {
    console.warn('QuotaExceededError or Storage Write Error detected. Applying fallback optimization...', e);
    
    // Fallback strategy 1: Strip large photo data URLs from items older than the most recent 2
    const trimmedList = cleanList.map((item, index) => {
      if (index >= 2 && item.photo && item.photo.length > 5000) {
        return { ...item, photo: null };
      }
      return item;
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedList));
      return true;
    } catch (e2) {
      console.warn('Second attempt storage fallback: Trimming to latest 20 items without large photos.', e2);
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
