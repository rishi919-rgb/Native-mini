import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function Profile() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Top Banner Graphic */}
      <View style={[styles.headerBanner, { backgroundColor: themeColors.primary }]} />

      <View style={styles.profileCard}>
        {/* Avatar */}
        <View style={[styles.avatarContainer, { borderColor: themeColors.background }]}>
          <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}>
            <Text style={styles.avatarText}>RK</Text>
          </View>
        </View>

        {/* User Info */}
        <Text style={[styles.name, { color: themeColors.text }]}>Rishikesh</Text>
        <Text style={[styles.title, { color: themeColors.textMuted }]}>Field Operations Representative</Text>
        
        <View style={[styles.badge, { backgroundColor: themeColors.primary + '12' }]}>
          <Text style={[styles.badgeText, { color: themeColors.primary }]}>CE • Year 2</Text>
        </View>

        {/* Info Rows */}
        <View style={[styles.detailsSection, { borderColor: themeColors.border }]}>
          <View style={[styles.detailRow, { borderBottomColor: themeColors.border }]}>
            <IconSymbol name="person.fill" size={20} color={themeColors.icon} />
            <View style={styles.detailDetails}>
              <Text style={[styles.detailLabel, { color: themeColors.textMuted }]}>FULL NAME</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>Rishikesh</Text>
            </View>
          </View>

          <View style={[styles.detailRow, { borderBottomColor: themeColors.border }]}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={18} color={themeColors.icon} />
            <View style={styles.detailDetails}>
              <Text style={[styles.detailLabel, { color: themeColors.textMuted }]}>ENROLLED COURSE</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>Computer Engineering (CE)</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <IconSymbol name="calendar" size={18} color={themeColors.icon} />
            <View style={styles.detailDetails}>
              <Text style={[styles.detailLabel, { color: themeColors.textMuted }]}>ACADEMIC YEAR</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>Year 2 (Undergraduate)</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleSettingsPress}
          style={[styles.settingsBtn, { backgroundColor: themeColors.primary }]}
        >
          <IconSymbol name="settings" size={18} color="#fff" />
          <Text style={styles.settingsBtnText}>Open App Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBanner: {
    height: 120,
    width: '100%',
  },
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -50,
  },
  avatarContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsSection: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    marginTop: 24,
    backgroundColor: 'transparent',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    gap: 16,
  },
  detailDetails: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  settingsBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
