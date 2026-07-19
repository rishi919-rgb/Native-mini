import React from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, useColorScheme, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const STORAGE_KEY = '@surveys_v1';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const clearDatabase = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Wipe Local Database',
      'This will delete all saved inspection survey reports. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              await AsyncStorage.removeItem('@draft_survey');
              await AsyncStorage.removeItem('@last_photo');
              await AsyncStorage.removeItem('@last_location');
              await AsyncStorage.removeItem('@last_contact');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Database Wiped', 'All field inspection records have been deleted.');
            } catch (e) {
              console.warn(e);
              Alert.alert('Error', 'Unable to reset database storage.');
            }
          },
        },
      ]
    );
  };

  const loadMockSurveys = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const mockData = [
      {
        id: 'SVY-784012',
        siteName: 'Terminal 2 Expansion (Aerodrome)',
        clientName: 'Mumbai Airport Authority',
        description: 'Safety check on concrete girder support pillars. Minor hairline fractures detected on girder G-14. No critical danger but recommends re-examination in 30 days.',
        priority: 'Medium',
        date: '19/07/2026',
        contactPhone: '+91 99887 76655',
        locationCoords: '19.0896, 72.8656',
        notes: 'Inspection team consisted of Rishikesh and 2 site engineers. Weather: Sunny, 32°C.',
        photo: null
      },
      {
        id: 'SVY-481920',
        siteName: 'Seaside Bridge Corridor (Pillar 24)',
        clientName: 'MMRDA Infrastructure',
        description: 'Critical warning! Corrosion detected on main suspension anchor bolt caps. Needs immediate reinforcement to prevent load structural failures.',
        priority: 'High',
        date: '18/07/2026',
        contactPhone: '+91 90001 20002',
        locationCoords: '19.0222, 72.8150',
        notes: 'Pasted from clipboard: Anchor bolts show rust depth of 1.2mm.',
        photo: null
      },
      {
        id: 'SVY-110482',
        siteName: 'Greenfield Eco Office Park',
        clientName: 'Godrej Properties',
        description: 'Foundation pouring and piling work completed. Checked reinforcement rebar cage sizing. Everything conforms with approved blueprints and standards.',
        priority: 'Low',
        date: '15/07/2026',
        contactPhone: '+91 98888 77777',
        locationCoords: '19.1120, 72.9102',
        notes: 'Work progressing on schedule.',
        photo: null
      }
    ];

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      // Prepends mock items
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...mockData, ...existing]));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Mock Data Injected', 'Injected 3 realistic field inspection records. View them in the History tab!');
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Unable to inject mock data.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Theme Settings */}
        <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>THEMING & VISUALS</Text>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingTitle, { color: themeColors.text }]}>System Dark Mode</Text>
              <Text style={[styles.settingDesc, { color: themeColors.textMuted }]}>Follow device appearance settings</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colorScheme === 'dark' ? themeColors.primary + '18' : '#e2e8f0' }]}>
              <Text style={[styles.statusText, { color: colorScheme === 'dark' ? themeColors.primary : '#475569' }]}>
                {colorScheme === 'dark' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {/* Database controls */}
        <Text style={[styles.sectionTitle, { color: themeColors.textMuted, marginTop: 24 }]}>LOCAL DATABASE CONTROLS</Text>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <TouchableOpacity style={[styles.actionRow, { borderBottomColor: themeColors.border }]} onPress={loadMockSurveys}>
            <View style={[styles.iconCircle, { backgroundColor: themeColors.primary + '12' }]}>
              <IconSymbol name="plus.circle.fill" size={20} color={themeColors.primary} />
            </View>
            <View style={styles.actionDetails}>
              <Text style={[styles.actionTitle, { color: themeColors.text }]}>Inject Mock Inspection Data</Text>
              <Text style={[styles.actionDesc, { color: themeColors.textMuted }]}>Load 3 realistic surveys for testing</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={themeColors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={clearDatabase}>
            <View style={[styles.iconCircle, { backgroundColor: themeColors.error + '12' }]}>
              <IconSymbol name="trash" size={20} color={themeColors.error} />
            </View>
            <View style={styles.actionDetails}>
              <Text style={[styles.actionTitle, { color: themeColors.error }]}>Wipe Local Database</Text>
              <Text style={[styles.actionDesc, { color: themeColors.textMuted }]}>Permanently delete all inspection records</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={themeColors.icon} />
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <Text style={[styles.sectionTitle, { color: themeColors.textMuted, marginTop: 24 }]}>SYSTEM INFORMATION</Text>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border, padding: 16 }]}>
          <View style={styles.systemInfoItem}>
            <Text style={[styles.sysLabel, { color: themeColors.textMuted }]}>App Name</Text>
            <Text style={[styles.sysVal, { color: themeColors.text }]}>Smart Field Survey App</Text>
          </View>
          <View style={[styles.sysDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.systemInfoItem}>
            <Text style={[styles.sysLabel, { color: themeColors.textMuted }]}>Developer Coordinator</Text>
            <Text style={[styles.sysVal, { color: themeColors.text }]}>Rishikesh (CE • Year 2)</Text>
          </View>
          <View style={[styles.sysDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.systemInfoItem}>
            <Text style={[styles.sysLabel, { color: themeColors.textMuted }]}>Framework Platform</Text>
            <Text style={[styles.sysVal, { color: themeColors.text }]}>Expo Router v54.0.0</Text>
          </View>
          <View style={[styles.sysDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.systemInfoItem}>
            <Text style={[styles.sysLabel, { color: themeColors.textMuted }]}>Client Engine Version</Text>
            <Text style={[styles.sysVal, { color: themeColors.text }]}>v1.0.0 (Production Build)</Text>
          </View>
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
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
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  systemInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sysLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sysVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  sysDivider: {
    height: 0.5,
    width: '100%',
    marginVertical: 6,
  },
});
