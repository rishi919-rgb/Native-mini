import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable, useColorScheme, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const STORAGE_KEY = '@surveys_v1';

export default function Dashboard() {
  const router = useRouter();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const loadData = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setSurveys(list);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Focus listener to reload data when navigating back to Dashboard
    const unsub = router.addListener?.('focus', loadData);
    loadData();
    return () => unsub?.();
  }, [router]);

  // Determine dynamic greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning ☀️';
    if (hrs < 18) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  const recent = surveys.slice(0, 3);

  // Quick actions layout
  const actions = [
    { label: 'New Survey', icon: 'plus.circle.fill', route: '/(tabs)/new-survey', bg: '#10b981' },
    { label: 'Camera', icon: 'camera.fill', route: '/camera', bg: '#f59e0b' },
    { label: 'GPS Location', icon: 'paperplane.fill', route: '/location', bg: '#3b82f6' },
    { label: 'Contacts', icon: 'person.fill', route: '/contacts', bg: '#8b5cf6' },
    { label: 'Clipboard', icon: 'clipboard', route: '/clipboard', bg: '#06b6d4' },
    { label: 'History Logs', icon: 'calendar', route: '/(tabs)/history', bg: '#6366f1' },
  ];

  // Render priority badge
  const renderPriorityBadge = (priority) => {
    const colorMap = {
      Low: themeColors.low,
      Medium: themeColors.medium,
      High: themeColors.high,
    };
    const badgeColor = colorMap[priority] || themeColors.primary;
    return (
      <View style={[styles.priorityBadge, { backgroundColor: badgeColor + '15' }]}>
        <Text style={[styles.priorityText, { color: badgeColor }]}>{priority}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} contentContainerStyle={styles.content}>
      {/* Top Hello & Greeting Header */}
      <View style={styles.greetRow}>
        <View>
          <Text style={[styles.greetLabel, { color: themeColors.textMuted }]}>{getGreeting()}</Text>
          <Text style={[styles.greetUser, { color: themeColors.text }]}>Hello, Rishikesh 👋</Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/profile')} style={[styles.miniAvatar, { backgroundColor: themeColors.primary }]}>
          <Text style={styles.miniAvatarText}>RK</Text>
        </Pressable>
      </View>

      {/* Student ID Card */}
      <View style={[styles.idCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardAvatar}>
            <Text style={styles.cardAvatarText}>RK</Text>
          </View>
          <View>
            <Text style={[styles.studentName, { color: themeColors.text }]}>Rishikesh</Text>
            <Text style={[styles.studentId, { color: themeColors.textMuted }]}>ID: RK-2026-FIELD</Text>
          </View>
        </View>
        <View style={[styles.cardDivider, { backgroundColor: themeColors.border }]} />
        <View style={styles.cardDetails}>
          <View style={styles.detailCol}>
            <Text style={[styles.detailLabel, { color: themeColors.textMuted }]}>COURSE</Text>
            <Text style={[styles.detailVal, { color: themeColors.text }]}>Computer Engineering</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={[styles.detailLabel, { color: themeColors.textMuted }]}>YEAR</Text>
            <Text style={[styles.detailVal, { color: themeColors.text }]}>2nd Year (CE)</Text>
          </View>
        </View>
      </View>

      {/* Statistics Block */}
      <View style={styles.statsRow}>
        <View style={[styles.statsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.statsLabel, { color: themeColors.textMuted }]}>{"Today's Surveys"}</Text>
          <Text style={[styles.statsNumber, { color: themeColors.text }]}>{surveys.length}</Text>
        </View>
        <View style={[styles.statsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.statsLabel, { color: themeColors.textMuted }]}>Total Submissions</Text>
          <Text style={[styles.statsNumber, { color: themeColors.text }]}>{surveys.length}</Text>
        </View>
      </View>

      {/* Quick Action Grid */}
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Quick Action Console</Text>
      <View style={styles.actionsGrid}>
        {actions.map((act) => (
          <Pressable
            key={act.label}
            style={[styles.actionCell, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => router.push(act.route)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: act.bg + '15' }]}>
              <IconSymbol name={act.icon} size={22} color={act.bg} />
            </View>
            <Text style={[styles.actionLabel, { color: themeColors.text }]}>{act.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Recent Survey Summary */}
      <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 24 }]}>Recent Survey Summary</Text>
      <View style={[styles.summaryCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        {recent.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="info" size={24} color={themeColors.textMuted} />
            <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>{"No survey files log. Tap \"New Survey\" to start."}</Text>
          </View>
        ) : (
          recent.map((s, idx) => (
            <View key={s.id} style={[styles.recentItem, idx !== recent.length - 1 && { borderBottomColor: themeColors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recentSite, { color: themeColors.text }]}>{s.siteName}</Text>
                <Text style={[styles.recentClient, { color: themeColors.textMuted }]}>{s.clientName} • {s.date}</Text>
              </View>
              {renderPriorityBadge(s.priority)}
            </View>
          ))
        )}
      </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  greetUser: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  miniAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  idCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentId: {
    fontSize: 13,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    marginVertical: 14,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  statsLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statsNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCell: {
    width: '48%', // approximate 2 column layout
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  recentSite: {
    fontSize: 15,
    fontWeight: '700',
  },
  recentClient: {
    fontSize: 12,
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
