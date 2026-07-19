/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#f8fafc',
    tint: '#2563eb',
    icon: '#64748b',
    tabIconDefault: '#64748b',
    tabIconSelected: '#2563eb',
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    card: '#ffffff',
    border: '#e2e8f0',
    textMuted: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    accent: '#8b5cf6',
  },
  dark: {
    text: '#f8fafc',
    background: '#0f172a',
    tint: '#3b82f6',
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: '#3b82f6',
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    card: '#1e293b',
    border: '#334155',
    textMuted: '#94a3b8',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    low: '#34d399',
    medium: '#fbbf24',
    high: '#f87171',
    accent: '#a78bfa',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
