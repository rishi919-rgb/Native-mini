import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog helper.
 * Uses window.confirm on Web (where Alert.alert callbacks do not work),
 * and native Alert.alert on iOS/Android.
 */
export function confirmAction(title, message, onConfirm, confirmText = 'Confirm', style = 'default') {
  if (Platform.OS === 'web') {
    const ok = window.confirm(`${title}\n\n${message}`);
    if (ok && typeof onConfirm === 'function') {
      onConfirm();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: confirmText, style: style === 'destructive' ? 'destructive' : 'default', onPress: onConfirm },
      ]
    );
  }
}

/**
 * Cross-platform simple alert dialog helper.
 */
export function showAlert(title, message) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}
