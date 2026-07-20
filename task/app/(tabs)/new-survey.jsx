import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View, TouchableOpacity, Image, ScrollView, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const DRAFT_KEY = '@draft_survey';
const LAST_PHOTO = '@last_photo';
const EDIT_SURVEY_KEY = '@edit_survey';
const EDIT_SURVEY_ID_KEY = '@editing_survey_id';

export default function NewSurvey() {
  const router = useRouter();
  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [editingSurveyId, setEditingSurveyId] = useState(null);

  // New assignment fields
  const [contactPhone, setContactPhone] = useState('');
  const [locationCoords, setLocationCoords] = useState('');
  const [notes, setNotes] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({});
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  useEffect(() => {
    // Auto-fill today's date if empty
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    setDate(`${day}/${month}/${year}`);
  }, []);

  const loadDraft = async () => {
    try {
      const editRaw = await AsyncStorage.getItem(EDIT_SURVEY_KEY);
      const editId = await AsyncStorage.getItem(EDIT_SURVEY_ID_KEY);
      if (editRaw && editId) {
        const item = JSON.parse(editRaw);
        setSiteName(item.siteName || '');
        setClientName(item.clientName || '');
        setDescription(item.description || '');
        setPriority(item.priority || 'Medium');
        setDate(item.date || '');
        setContactPhone(item.contactPhone || '');
        setLocationCoords(item.locationCoords || '');
        setNotes(item.notes || '');
        setEditingSurveyId(editId);
        const photo = item.photo || await AsyncStorage.getItem(LAST_PHOTO);
        if (photo) setAttachedPhoto(photo);
      } else {
        setEditingSurveyId(null);
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          setSiteName(d.siteName || '');
          setClientName(d.clientName || '');
          setDescription(d.description || '');
          setPriority(d.priority || 'Medium');
          if (d.date) setDate(d.date);
          setContactPhone(d.contactPhone || '');
          setLocationCoords(d.locationCoords || '');
          setNotes(d.notes || '');
        }
        const photo = await AsyncStorage.getItem(LAST_PHOTO);
        if (photo) setAttachedPhoto(photo);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const cancelEditing = async () => {
    try {
      await AsyncStorage.removeItem(EDIT_SURVEY_KEY);
      await AsyncStorage.removeItem(EDIT_SURVEY_ID_KEY);
      await AsyncStorage.removeItem(DRAFT_KEY);
      await AsyncStorage.removeItem(LAST_PHOTO);
      setSiteName('');
      setClientName('');
      setDescription('');
      setPriority('Medium');
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      setDate(`${day}/${month}/${year}`);
      setContactPhone('');
      setLocationCoords('');
      setNotes('');
      setAttachedPhoto(null);
      setEditingSurveyId(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert('Editing Cancelled', 'Form reset for new survey.');
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    // Load draft every time screen is focused
    const unsub = router.addListener?.('focus', () => {
      loadDraft();
    });
    loadDraft();
    return () => unsub?.();
  }, [router]);

  const validateForm = () => {
    let tempErrors = {};
    if (!siteName.trim()) tempErrors.siteName = 'Site name is required';
    if (!clientName.trim()) tempErrors.clientName = 'Client name is required';
    if (!description.trim()) tempErrors.description = 'Description is required';
    if (!date.trim()) tempErrors.date = 'Inspection date is required';
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      tempErrors.date = 'Use DD/MM/YYYY format';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const saveDraftAndPreview = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please complete all required fields correctly.');
      return;
    }

    const draft = { siteName, clientName, description, priority, date, contactPhone, locationCoords, notes };
    try {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      if (editingSurveyId) {
        await AsyncStorage.setItem(EDIT_SURVEY_ID_KEY, editingSurveyId);
      }
      router.push('/preview');
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Unable to cache survey draft.');
    }
  };

  // Autofill helpers
  const autofillContact = async () => {
    try {
      const cachedPhone = await AsyncStorage.getItem('@last_contact');
      const cachedName = await AsyncStorage.getItem('@last_contact_name');
      if (cachedPhone) {
        setContactPhone(cachedPhone);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Autofilled', `Loaded contact number: ${cachedName ? cachedName + ' (' + cachedPhone + ')' : cachedPhone}`);
      } else {
        Alert.alert('No Cache', 'No recently copied contact found. Please copy a number in the Contacts module first.');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const autofillLocation = async () => {
    try {
      const cachedLoc = await AsyncStorage.getItem('@last_location');
      if (cachedLoc) {
        setLocationCoords(cachedLoc);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Autofilled', `Loaded GPS coordinates: ${cachedLoc}`);
      } else {
        Alert.alert('No Cache', 'No recently fetched location found. Please capture GPS in the Location module first.');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const autofillNotesFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        setNotes(clipboardContent);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Autofilled', 'Notes pasted from system clipboard.');
      } else {
        Alert.alert('Empty Clipboard', 'System clipboard buffer is currently empty.');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const getPriorityColor = (p) => {
    const activeMap = {
      Low: themeColors.low,
      Medium: themeColors.medium,
      High: themeColors.high,
    };
    return activeMap[p] || themeColors.primary;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} contentContainerStyle={styles.content}>
      {editingSurveyId ? (
        <View style={[styles.editingBanner, { backgroundColor: themeColors.primary + '12', borderColor: themeColors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.editingTitle, { color: themeColors.primary }]}>Editing Survey: {editingSurveyId}</Text>
            <Text style={[styles.editingSub, { color: themeColors.textMuted }]}>Modifying existing inspection record</Text>
          </View>
          <TouchableOpacity onPress={cancelEditing} style={[styles.cancelEditBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.cancelEditText, { color: themeColors.error }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[styles.title, { color: themeColors.text }]}>Create Field Survey</Text>
          <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>Perform safety inspections and log details</Text>
        </>
      )}

      {/* Site Name Input */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.text }]}>Site Location Name *</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: themeColors.card, borderColor: errors.siteName ? themeColors.error : themeColors.border, color: themeColors.text },
          ]}
          placeholder="e.g. Metro Construction Phase II"
          placeholderTextColor={themeColors.textMuted}
          value={siteName}
          onChangeText={(val) => {
            setSiteName(val);
            if (errors.siteName) setErrors({ ...errors, siteName: null });
          }}
        />
        {errors.siteName && <Text style={[styles.errorText, { color: themeColors.error }]}>{errors.siteName}</Text>}
      </View>

      {/* Client Name Input */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.text }]}>Client Organization *</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: themeColors.card, borderColor: errors.clientName ? themeColors.error : themeColors.border, color: themeColors.text },
          ]}
          placeholder="e.g. Larsen & Toubro"
          placeholderTextColor={themeColors.textMuted}
          value={clientName}
          onChangeText={(val) => {
            setClientName(val);
            if (errors.clientName) setErrors({ ...errors, clientName: null });
          }}
        />
        {errors.clientName && <Text style={[styles.errorText, { color: themeColors.error }]}>{errors.clientName}</Text>}
      </View>

      {/* Description Input */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.text }]}>Inspection Description *</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { backgroundColor: themeColors.card, borderColor: errors.description ? themeColors.error : themeColors.border, color: themeColors.text },
          ]}
          placeholder="Detail structural safety status, anomalies, issues found..."
          placeholderTextColor={themeColors.textMuted}
          value={description}
          onChangeText={(val) => {
            setDescription(val);
            if (errors.description) setErrors({ ...errors, description: null });
          }}
          multiline
        />
        {errors.description && <Text style={[styles.errorText, { color: themeColors.error }]}>{errors.description}</Text>}
      </View>

      {/* Priority Selection */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.text }]}>Priority Alert Level *</Text>
        <View style={styles.chipsRow}>
          {['Low', 'Medium', 'High'].map((p) => {
            const isActive = priority === p;
            const activeColor = getPriorityColor(p);
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.chip,
                  { borderColor: themeColors.border, backgroundColor: themeColors.card },
                  isActive && { backgroundColor: activeColor + '18', borderColor: activeColor },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: isActive ? activeColor : themeColors.icon }]} />
                <Text
                  style={[
                    styles.chipText,
                    { color: isActive ? activeColor : themeColors.text },
                    isActive && styles.chipTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Inspection Date Input */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.text }]}>Inspection Date *</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: themeColors.card, borderColor: errors.date ? themeColors.error : themeColors.border, color: themeColors.text },
          ]}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={themeColors.textMuted}
          value={date}
          onChangeText={(val) => {
            setDate(val);
            if (errors.date) setErrors({ ...errors, date: null });
          }}
        />
        {errors.date && <Text style={[styles.errorText, { color: themeColors.error }]}>{errors.date}</Text>}
      </View>

      {/* NEW: Client Contact Number Input with Autofill */}
      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: themeColors.text, marginBottom: 0 }]}>Client Contact Number</Text>
          <TouchableOpacity onPress={autofillContact} style={[styles.autofillBtn, { backgroundColor: themeColors.primary + '12' }]}>
            <Text style={[styles.autofillBtnText, { color: themeColors.primary }]}>Autofill Copied</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text, marginTop: 8 },
          ]}
          placeholder="e.g. +91 98765 43210"
          placeholderTextColor={themeColors.textMuted}
          value={contactPhone}
          onChangeText={setContactPhone}
        />
      </View>

      {/* NEW: GPS Location Coordinates with Autofill */}
      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: themeColors.text, marginBottom: 0 }]}>GPS Location Coordinates</Text>
          <TouchableOpacity onPress={autofillLocation} style={[styles.autofillBtn, { backgroundColor: themeColors.primary + '12' }]}>
            <Text style={[styles.autofillBtnText, { color: themeColors.primary }]}>Autofill GPS</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text, marginTop: 8 },
          ]}
          placeholder="e.g. 19.0760, 72.8777 (Lat, Lng)"
          placeholderTextColor={themeColors.textMuted}
          value={locationCoords}
          onChangeText={setLocationCoords}
        />
      </View>

      {/* NEW: Additional Clipboard Notes with Autofill */}
      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: themeColors.text, marginBottom: 0 }]}>Inspection Notes & Remarks</Text>
          <TouchableOpacity onPress={autofillNotesFromClipboard} style={[styles.autofillBtn, { backgroundColor: themeColors.primary + '12' }]}>
            <Text style={[styles.autofillBtnText, { color: themeColors.primary }]}>Paste Clipboard</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text, marginTop: 8 },
          ]}
          placeholder="Additional notes, safety checklist remarks, or copy from Clipboard module..."
          placeholderTextColor={themeColors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      {/* Attachment Section */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.text }]}>Evidence Photo</Text>
        {attachedPhoto ? (
          <View style={styles.attachmentBox}>
            <Image source={{ uri: attachedPhoto }} style={styles.attachedImage} resizeMode="cover" />
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => router.push('/camera')}
            >
              <IconSymbol name="camera.fill" size={16} color="#fff" />
              <Text style={styles.retakeBtnText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.cameraPlaceholder, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => router.push('/camera')}
          >
            <IconSymbol name="camera.fill" size={28} color={themeColors.icon} />
            <Text style={[styles.cameraText, { color: themeColors.textMuted }]}>Attach site inspection photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Form Action button */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: themeColors.primary }]}
        onPress={saveDraftAndPreview}
      >
        <Text style={styles.submitBtnText}>Preview Inspection Details</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autofillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  autofillBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  multiline: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    fontWeight: 'bold',
  },
  attachmentBox: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  attachedImage: {
    width: '100%',
    height: '100%',
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  retakeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cameraPlaceholder: {
    height: 120,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraText: {
    fontSize: 13,
    fontWeight: '500',
  },
  submitBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  editingTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  editingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelEditText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
