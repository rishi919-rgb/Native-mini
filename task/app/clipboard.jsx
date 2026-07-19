import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View, TouchableOpacity, useColorScheme, ScrollView, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ClipboardScreen() {
  const [clipboardText, setClipboardText] = useState('');
  const [pasteInput, setPasteInput] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const readClipboard = async () => {
    try {
      const txt = await Clipboard.getStringAsync();
      setClipboardText(txt);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    readClipboard();
  }, []);

  const copySurveyId = async () => {
    const id = `SVY-${Date.now().toString().slice(-6)}`;
    await Clipboard.setStringAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Survey ID Copied', `Generated ID: ${id}`);
    readClipboard();
  };

  const copyContactNumber = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      let phoneToCopy = '+91 98765 43210'; // Default fallback mock number
      let nameToCopy = 'Rishikesh (Student)';

      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers], limit: 5 });
        const validContact = data?.find(c => c.phoneNumbers && c.phoneNumbers[0] && c.phoneNumbers[0].number);
        if (validContact) {
          phoneToCopy = validContact.phoneNumbers[0].number;
          nameToCopy = validContact.name;
        }
      }

      await Clipboard.setStringAsync(phoneToCopy);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Contact Copied', `Copied ${nameToCopy}'s number: ${phoneToCopy}`);
      readClipboard();
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Unable to fetch contacts.');
    } finally {
      setLoading(false);
    }
  };

  const copyCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS location permission is required.');
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const text = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Location Copied', `Coordinates: ${text}`);
      readClipboard();
    } catch (e) {
      console.warn(e);
      Alert.alert('GPS Error', 'Unable to retrieve location.');
    } finally {
      setLoading(false);
    }
  };

  const pasteNotes = async () => {
    const txt = await Clipboard.getStringAsync();
    setPasteInput(txt);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearClipboard = async () => {
    await Clipboard.setStringAsync('');
    setClipboardText('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Cleared', 'Clipboard system buffer has been cleared.');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={themeColors.primary} />
            <Text style={[styles.loaderText, { color: themeColors.textMuted }]}>Accessing device sensors...</Text>
          </View>
        )}

        {/* Copy Tools Card */}
        <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>GENERATION & COPY ACTIONS</Text>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <TouchableOpacity style={[styles.actionRow, { borderBottomColor: themeColors.border }]} onPress={copySurveyId}>
            <View style={[styles.iconCircle, { backgroundColor: themeColors.primary + '12' }]}>
              <IconSymbol name="clipboard" size={20} color={themeColors.primary} />
            </View>
            <View style={styles.actionDetails}>
              <Text style={[styles.actionTitleText, { color: themeColors.text }]}>Copy Survey ID</Text>
              <Text style={[styles.actionDescText, { color: themeColors.textMuted }]}>Generate and copy a new SVY identifier</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={themeColors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionRow, { borderBottomColor: themeColors.border }]} onPress={copyContactNumber}>
            <View style={[styles.iconCircle, { backgroundColor: themeColors.accent + '12' }]}>
              <IconSymbol name="person.fill" size={20} color={themeColors.accent} />
            </View>
            <View style={styles.actionDetails}>
              <Text style={[styles.actionTitleText, { color: themeColors.text }]}>Copy Contact Number</Text>
              <Text style={[styles.actionDescText, { color: themeColors.textMuted }]}>Copy nearest directory contact phone number</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={themeColors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={copyCurrentLocation}>
            <View style={[styles.iconCircle, { backgroundColor: themeColors.success + '12' }]}>
              <IconSymbol name="paperplane.fill" size={18} color={themeColors.success} />
            </View>
            <View style={styles.actionDetails}>
              <Text style={[styles.actionTitleText, { color: themeColors.text }]}>Copy Current Location</Text>
              <Text style={[styles.actionDescText, { color: themeColors.textMuted }]}>Fetch current GPS coordinates to copy</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={themeColors.icon} />
          </TouchableOpacity>
        </View>

        {/* Current Clipboard Display */}
        <Text style={[styles.sectionTitle, { color: themeColors.textMuted, marginTop: 24 }]}>CURRENT CLIPBOARD STATE</Text>
        <View style={[styles.displayCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.displayText, { color: clipboardText ? themeColors.text : themeColors.textMuted }]}>
            {clipboardText || 'Device clipboard is empty'}
          </Text>
          <View style={styles.displayActions}>
            <TouchableOpacity style={styles.displayBtn} onPress={readClipboard}>
              <Text style={{ color: themeColors.primary, fontWeight: 'bold' }}>Refresh Buffer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.displayBtn} onPress={clearClipboard}>
              <Text style={{ color: themeColors.error, fontWeight: 'bold' }}>Clear Buffer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Paste Box Card */}
        <Text style={[styles.sectionTitle, { color: themeColors.textMuted, marginTop: 24 }]}>PASTE & INPUT TESTER</Text>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border, padding: 16 }]}>
          <View style={styles.pasteHeader}>
            <Text style={[styles.pasteTitleText, { color: themeColors.text }]}>Inspection Notes</Text>
            <TouchableOpacity style={[styles.pasteButton, { backgroundColor: themeColors.primary + '15' }]} onPress={pasteNotes}>
              <Text style={[styles.pasteButtonText, { color: themeColors.primary }]}>Paste from Clipboard</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.inputField, { borderColor: themeColors.border, color: themeColors.text }]}
            placeholder="Pasted clipboard notes will appear here..."
            placeholderTextColor={themeColors.textMuted}
            value={pasteInput}
            onChangeText={setPasteInput}
            multiline
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loaderText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionDescText: {
    fontSize: 12,
    marginTop: 2,
  },
  displayCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  displayText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    minHeight: 40,
  },
  displayActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  displayBtn: {
    paddingVertical: 4,
  },
  pasteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pasteTitleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  pasteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pasteButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});
