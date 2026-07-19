import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';

import { useColorScheme as useAppColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export const unstable_settings = {
  anchor: '(tabs)',
};

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme ?? 'light'];

  const menuItems = [
    { label: 'Dashboard', icon: 'house.fill', route: '/(tabs)/dashboard' },
    { label: 'Survey Form', icon: 'plus.circle.fill', route: '/(tabs)/new-survey' },
    { label: 'Camera', icon: 'camera.fill', route: '/camera' },
    { label: 'Contacts', icon: 'person.fill', route: '/contacts' },
    { label: 'Location', icon: 'paperplane.fill', route: '/location' },
    { label: 'Clipboard', icon: 'clipboard', route: '/clipboard' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ] as const;

  return (
    <View style={[styles.drawerContainer, { backgroundColor: themeColors.background }]}>
      {/* Drawer Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 16, borderBottomColor: themeColors.border }]}>
        <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}>
          <Text style={styles.avatarText}>RK</Text>
        </View>
        <Text style={[styles.userName, { color: themeColors.text }]}>Rishikesh</Text>
        <Text style={[styles.userRole, { color: themeColors.textMuted }]}>CE • Year 2</Text>
        <View style={[styles.badge, { backgroundColor: themeColors.primary + '15' }]}>
          <Text style={[styles.badgeText, { color: themeColors.primary }]}>Student Explorer</Text>
        </View>
      </View>

      {/* Drawer Menu Items */}
      <View style={{ flex: 1, paddingTop: 12 }}>
        {menuItems.map((item) => {
          // Match tab routes or exact routes
          const isActive = pathname === item.route || 
            (item.route.startsWith('/(tabs)/') && pathname.includes(item.route.replace('/(tabs)/', '')));
          
          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => {
                router.push(item.route as any);
                props.navigation.closeDrawer();
              }}
              style={[
                styles.drawerItem,
                isActive && { backgroundColor: themeColors.primary + '15' },
              ]}
            >
              <IconSymbol
                name={item.icon as any}
                size={22}
                color={isActive ? themeColors.primary : themeColors.icon}
              />
              <Text
                style={[
                  styles.drawerItemText,
                  { color: isActive ? themeColors.primary : themeColors.text },
                  isActive && styles.activeItemText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Drawer Footer */}
      <View style={[styles.footer, { borderTopColor: themeColors.border, paddingBottom: insets.bottom + 12 }]}>
        <Text style={[styles.footerText, { color: themeColors.textMuted }]}>Smart Field Survey App</Text>
        <Text style={[styles.footerVersion, { color: themeColors.textMuted }]}>v1.0.0</Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useAppColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: themeColors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border,
          },
          headerTintColor: themeColors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          drawerStyle: {
            width: 280,
          },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: 'Smart Field Survey',
          }}
        />
        <Drawer.Screen
          name="camera"
          options={{
            headerShown: false,
            title: 'Camera Work',
          }}
        />
        <Drawer.Screen
          name="contacts"
          options={{
            title: 'Contacts Explorer',
          }}
        />
        <Drawer.Screen
          name="location"
          options={{
            title: 'GPS Location',
          }}
        />
        <Drawer.Screen
          name="clipboard"
          options={{
            title: 'Clipboard Manager',
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
        <Drawer.Screen
          name="preview"
          options={{
            headerShown: false,
            title: 'Survey Preview',
          }}
        />
        <Drawer.Screen
          name="modal"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'Modal',
          }}
        />
      </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  drawerItemText: {
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  activeItemText: {
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerVersion: {
    fontSize: 10,
    marginTop: 2,
  },
});
