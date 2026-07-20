import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, View, TouchableOpacity, Image, useColorScheme, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { getSurveys, saveSurveys, EDIT_SURVEY_KEY, EDIT_SURVEY_ID_KEY } from '../../utils/storage';
import { confirmAction, showAlert } from '../../utils/alert';

export default function HistoryScreen() {
  const router = useRouter();
  const [surveys, setSurveys] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const load = async () => {
    try {
      const list = await getSurveys();
      setSurveys(list);
      setFiltered(list);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = router.addListener?.('focus', load);
    load();
    return () => unsub?.();
  }, [router]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => {
    let result = surveys;
    if (filter && filter !== 'All') {
      result = result.filter(s => s.priority === filter);
    }
    if (query) {
      result = result.filter(s => 
        (s.siteName + ' ' + s.clientName + ' ' + (s.locationCoords || '')).toLowerCase().includes(query.toLowerCase())
      );
    }
    setFiltered(result);
  }, [query, filter, surveys]);

  const confirmDelete = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    confirmAction(
      'Delete Survey Report',
      'Are you sure you want to permanently delete this inspection report? This action cannot be reverted.',
      () => deleteSurvey(id),
      'Delete',
      'destructive'
    );
  };

  const deleteSurvey = async (id) => {
    try {
      const newList = surveys.filter(s => s.id !== id);
      await saveSurveys(newList);
      setSurveys(newList);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert('Deleted', 'Inspection report deleted successfully.');
    } catch (e) {
      console.warn(e);
      showAlert('Error', 'Unable to delete report.');
    }
  };

  const editSurvey = async (item) => {
    try {
      await AsyncStorage.setItem(EDIT_SURVEY_KEY, JSON.stringify(item));
      await AsyncStorage.setItem(EDIT_SURVEY_ID_KEY, item.id);
      await AsyncStorage.setItem('@draft_survey', JSON.stringify(item));
      if (item.photo) {
        await AsyncStorage.setItem('@last_photo', item.photo);
      } else {
        await AsyncStorage.removeItem('@last_photo');
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push('/(tabs)/new-survey');
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Unable to prepare survey for editing.');
    }
  };

  const showReportDetails = async (item) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await AsyncStorage.setItem('@draft_survey', JSON.stringify(item));
      if (item.photo) {
        await AsyncStorage.setItem('@last_photo', item.photo);
      } else {
        await AsyncStorage.removeItem('@last_photo');
      }
      await AsyncStorage.removeItem(EDIT_SURVEY_ID_KEY);
      await AsyncStorage.removeItem(EDIT_SURVEY_KEY);
      router.push('/preview');
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Unable to open survey details.');
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

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Inspection Logs</Text>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{filtered.length} Saved</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <IconSymbol name="info" size={18} color={themeColors.icon} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search logs by site, client, location..."
            placeholderTextColor={themeColors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* Priority Filters Segmented */}
      <View style={styles.filterContainer}>
        {['All', 'Low', 'Medium', 'High'].map(p => {
          const isActive = filter === p;
          const filterColor = p === 'All' ? themeColors.primary : getPriorityColor(p);
          return (
            <TouchableOpacity
              key={p}
              onPress={() => {
                setFilter(p);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.filterTab,
                { backgroundColor: themeColors.card, borderColor: themeColors.border },
                isActive && { backgroundColor: filterColor + '15', borderColor: filterColor },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? filterColor : themeColors.text },
                  isActive && styles.filterTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Surveys List */}
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => (item && item.id) ? `${item.id}-${index}` : `survey-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <IconSymbol name="info" size={40} color={themeColors.textMuted} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No Inspection Logs</Text>
            <Text style={[styles.emptyDesc, { color: themeColors.textMuted }]}>
              {surveys.length === 0
                ? "No structural logs found in database. File a new survey."
                : "No inspections match your filter queries."}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const itemColor = getPriorityColor(item.priority);
          return (
            <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={styles.cardRow}>
                {/* Visual Thumbnail */}
                {item.photo ? (
                  <Image source={{ uri: item.photo }} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumbnailPlaceholder, { backgroundColor: themeColors.background }]}>
                    <IconSymbol name="camera.fill" size={16} color={themeColors.textMuted} />
                  </View>
                )}

                {/* Card Details */}
                <View style={styles.cardDetails}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.siteText, { color: themeColors.text }]} numberOfLines={1}>
                      {item.siteName}
                    </Text>
                    <View style={[styles.priorityBadge, { backgroundColor: itemColor + '12' }]}>
                      <Text style={[styles.priorityText, { color: itemColor }]}>{item.priority}</Text>
                    </View>
                  </View>
                  <Text style={[styles.clientText, { color: themeColors.textMuted }]} numberOfLines={1}>
                    {item.clientName}
                  </Text>
                  
                  <View style={styles.cardFooter}>
                    <Text style={[styles.dateText, { color: themeColors.textMuted }]}>{item.date}</Text>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() => showReportDetails(item)}
                        style={[styles.actionBtn, { backgroundColor: themeColors.primary + '12' }]}
                      >
                        <Text style={[styles.actionBtnText, { color: themeColors.primary }]}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => editSurvey(item)}
                        style={[styles.actionBtn, { backgroundColor: themeColors.medium + '12' }]}
                      >
                        <Text style={[styles.actionBtnText, { color: themeColors.medium }]}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmDelete(item.id)}
                        style={[styles.actionBtn, { backgroundColor: themeColors.error + '12' }]}
                      >
                        <Text style={[styles.actionBtnText, { color: themeColors.error }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
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
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
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
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  thumbnailPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  siteText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  clientText: {
    fontSize: 13,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  dateText: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
