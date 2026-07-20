import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getSurveys, saveSurveys, DRAFT_KEY, LAST_PHOTO, EDIT_SURVEY_ID_KEY, EDIT_SURVEY_KEY } from '../utils/storage';

export default function PreviewScreen() {
  const router = useRouter();
  const [draft, setDraft] = useState(null);
  const [photo, setPhoto] = useState(null);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  useEffect(() => {
    const load = async () => {
      try {
        const d = await AsyncStorage.getItem(DRAFT_KEY);
        const p = await AsyncStorage.getItem(LAST_PHOTO);
        if (d) setDraft(JSON.parse(d));
        if (p) setPhoto(p);
      } catch (e) {
        console.warn(e);
      }
    };
    load();
  }, []);

  const submit = async () => {
    if (!draft) return;
    const newId = `SVY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const survey = { 
      ...draft, 
      id: newId, 
      createdAt: new Date().toISOString(), 
      photo 
    };
    
    try {
      const list = await getSurveys();
      const editId = await AsyncStorage.getItem(EDIT_SURVEY_ID_KEY);
      let updatedList;
      if (editId) {
        updatedList = list.map(item => item.id === editId ? { ...item, ...draft, photo, updatedAt: new Date().toISOString() } : item);
      } else {
        updatedList = [survey, ...list];
      }
      
      const success = await saveSurveys(updatedList);
      if (!success) {
        Alert.alert('Storage Warning', 'Report saved, but storage space is low.');
      }
      
      // Clear caches
      await AsyncStorage.removeItem(DRAFT_KEY);
      await AsyncStorage.removeItem(LAST_PHOTO);
      await AsyncStorage.removeItem(EDIT_SURVEY_ID_KEY);
      await AsyncStorage.removeItem(EDIT_SURVEY_KEY);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Survey Logged', editId ? 'Survey updated successfully.' : 'Survey report was saved to history database successfully!');
      router.push('/(tabs)/history');
    } catch (e) {
      console.warn(e);
      Alert.alert('Database Error', 'Failed to save survey. Try again.');
    }
  };

  const getPriorityColor = (p) => {
    const colorMap = {
      Low: themeColors.low,
      Medium: themeColors.medium,
      High: themeColors.high,
    };
    return colorMap[p] || themeColors.primary;
  };

  if (!draft) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <IconSymbol name="info" size={32} color={themeColors.textMuted} />
        <Text style={[styles.emptyText, { color: themeColors.textMuted, marginTop: 12 }]}>No active inspection draft available.</Text>
      </View>
    );
  }

  const pColor = getPriorityColor(draft.priority);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.right" size={22} color={themeColors.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Inspection Ticket Preview</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ticket Container */}
        <View style={[styles.ticketCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          {/* Top Ticket Strip */}
          <View style={[styles.priorityBanner, { backgroundColor: pColor + '12' }]}>
            <View style={[styles.indicatorDot, { backgroundColor: pColor }]} />
            <Text style={[styles.priorityText, { color: pColor }]}>{draft.priority.toUpperCase()} PRIORITY ALERT</Text>
          </View>

          {/* Ticket Header Details */}
          <View style={styles.section}>
            <Text style={[styles.ticketLabel, { color: themeColors.textMuted }]}>SITE LOCATION</Text>
            <Text style={[styles.siteText, { color: themeColors.text }]}>{draft.siteName}</Text>
            
            <View style={styles.metaGrid}>
              <View style={styles.gridCol}>
                <Text style={[styles.ticketLabel, { color: themeColors.textMuted }]}>CLIENT</Text>
                <Text style={[styles.metaVal, { color: themeColors.text }]}>{draft.clientName}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={[styles.ticketLabel, { color: themeColors.textMuted }]}>DATE LOGGED</Text>
                <Text style={[styles.metaVal, { color: themeColors.text }]}>{draft.date}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.ticketDivider, { borderColor: themeColors.border }]} />

          {/* Sensor Info Segment */}
          <View style={styles.section}>
            {/* GPS Location */}
            <View style={styles.infoRow}>
              <IconSymbol name="paperplane.fill" size={16} color={themeColors.primary} />
              <View style={styles.infoDetails}>
                <Text style={[styles.infoLabel, { color: themeColors.textMuted }]}>GPS Coordinates</Text>
                <Text style={[styles.infoVal, { color: themeColors.text }]}>{draft.locationCoords || 'No GPS Tag Attached'}</Text>
              </View>
            </View>

            {/* Contact number */}
            <View style={[styles.infoRow, { marginTop: 12 }]}>
              <IconSymbol name="person.fill" size={16} color={themeColors.accent} />
              <View style={styles.infoDetails}>
                <Text style={[styles.infoLabel, { color: themeColors.textMuted }]}>Contact Representative</Text>
                <Text style={[styles.infoVal, { color: themeColors.text }]}>{draft.contactPhone || 'No Contact Representative'}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.ticketDivider, { borderColor: themeColors.border }]} />

          {/* Notes & Description */}
          <View style={styles.section}>
            <Text style={[styles.ticketLabel, { color: themeColors.textMuted }]}>INSPECTION DETAILS</Text>
            <Text style={[styles.descValueText, { color: themeColors.text }]}>{draft.description}</Text>

            {draft.notes ? (
              <View style={[styles.notesContainer, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                <Text style={[styles.notesLabel, { color: themeColors.primary }]}>Additional Clipboard Notes:</Text>
                <Text style={[styles.notesText, { color: themeColors.text }]}>{draft.notes}</Text>
              </View>
            ) : null}
          </View>

          {/* Image preview */}
          {photo ? (
            <View style={styles.imageSection}>
              <Text style={[styles.ticketLabel, { color: themeColors.textMuted, marginHorizontal: 20, marginBottom: 8 }]}>EVIDENCE PHOTO</Text>
              <Image source={{ uri: photo }} style={styles.attachedImage} resizeMode="cover" />
            </View>
          ) : (
            <View style={[styles.noImageSection, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
              <IconSymbol name="camera.fill" size={24} color={themeColors.textMuted} />
              <Text style={[styles.noImageText, { color: themeColors.textMuted }]}>No site photo attached to this survey.</Text>
            </View>
          )}
        </View>

        {/* Action Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
            onPress={submit}
          >
            <Text style={styles.btnText}>Confirm & Log Survey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: themeColors.primary }]}
            onPress={() => router.push('/(tabs)/new-survey')}
          >
            <Text style={[styles.secondaryBtnText, { color: themeColors.primary }]}>Modify Details</Text>
          </TouchableOpacity>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  ticketCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  priorityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  section: {
    padding: 20,
  },
  ticketLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  siteText: {
    fontSize: 18,
    fontWeight: '800',
  },
  metaGrid: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  gridCol: {
    flex: 1,
  },
  metaVal: {
    fontSize: 14,
    fontWeight: '600',
  },
  ticketDivider: {
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    marginHorizontal: 12,
    height: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoDetails: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  descValueText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
  },
  imageSection: {
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    paddingTop: 16,
  },
  attachedImage: {
    width: '100%',
    height: 220,
  },
  noImageSection: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  noImageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  controlsContainer: {
    marginTop: 24,
    gap: 12,
  },
  primaryBtn: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
