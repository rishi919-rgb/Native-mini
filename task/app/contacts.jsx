import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Custom initials generator with colorful backgrounds
function Avatar({ name, themeColors }) {
  const initials = (name || '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  
  // Deterministic color based on name
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#8b5cf6', // purple
    '#f59e0b', // orange
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  const bgColor = colors[sum % colors.length];

  return (
    <View style={[styles.avatar, { backgroundColor: bgColor }]}>
      <Text style={styles.avatarText}>{initials || '?'}</Text>
    </View>
  );
}

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const load = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'This module requires Contacts permission.');
        setLoading(false);
        return;
      }
      const { data } = await Contacts.getContactsAsync({ 
        fields: [Contacts.Fields.PhoneNumbers],
      });
      const sorted = (data || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setContacts(sorted);
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Unable to retrieve contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const copyNumber = async (contact) => {
    const phone = contact.phoneNumbers && contact.phoneNumbers[0] && contact.phoneNumbers[0].number;
    if (!phone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return Alert.alert('No Number', `${contact.name} does not have a saved phone number.`);
    }
    
    await Clipboard.setStringAsync(phone);
    try {
      await AsyncStorage.setItem('@last_contact', phone);
      await AsyncStorage.setItem('@last_contact_name', contact.name);
    } catch (e) {
      console.warn(e);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied', `Saved number for ${contact.name} copied to clipboard!`);
  };

  const filtered = contacts.filter(c => {
    if (!query) return true;
    return (c.name || '').toLowerCase().includes(query.toLowerCase());
  });

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.textMuted }]}>Fetching Contacts...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <IconSymbol name="info" size={18} color={themeColors.icon} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search contacts..."
            placeholderTextColor={themeColors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: themeColors.primary, fontWeight: '600' }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={{ fontSize: 13, color: themeColors.textMuted, marginTop: 8, marginLeft: 4 }}>
          {filtered.length} contacts found
        </Text>
      </View>

      {/* Contacts List or Empty State */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: themeColors.primary + '15' }]}>
            <IconSymbol name="person.fill" size={36} color={themeColors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No Contacts Found</Text>
          <Text style={[styles.emptyDesc, { color: themeColors.textMuted }]}>
            {contacts.length === 0 
              ? "We couldn't load any contacts. Pull to refresh or grant permission." 
              : `No matches found for "${query}"`}
          </Text>
          <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: themeColors.primary }]} onPress={load}>
            <Text style={styles.refreshBtnText}>Reload Contacts</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
            />
          }
          renderItem={({ item }) => {
            const hasPhone = item.phoneNumbers && item.phoneNumbers[0] && item.phoneNumbers[0].number;
            return (
              <TouchableOpacity
                onPress={() => copyNumber(item)}
                style={[styles.row, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              >
                <Avatar name={item.name} themeColors={themeColors} />
                <View style={styles.rowDetails}>
                  <Text style={[styles.rowName, { color: themeColors.text }]}>{item.name}</Text>
                  <Text style={[styles.rowPhone, { color: hasPhone ? themeColors.textMuted : themeColors.error }]}>
                    {hasPhone || 'No Phone Number'}
                  </Text>
                </View>
                <View style={[styles.copyBadge, { backgroundColor: themeColors.primary + '10' }]}>
                  <Text style={[styles.copyBadgeText, { color: themeColors.primary }]}>Copy</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
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
  counterBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    height: '100%',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rowDetails: {
    flex: 1,
    marginLeft: 12,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  copyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  refreshBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  refreshBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
