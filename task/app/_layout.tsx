import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer>
        <Drawer.Screen
          name="(tabs)"
          options={{ drawerLabel: 'Home', title: 'Student Dashboard' }}
        />
        <Drawer.Screen
          name="modal"
          options={{ drawerItemStyle: { display: 'none' }, title: 'Modal' }}
        />
      </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
