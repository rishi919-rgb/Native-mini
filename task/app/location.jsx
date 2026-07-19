import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, View, TouchableOpacity, useColorScheme, Animated, Easing } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LocationScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // Radar animation
  const radarScale = useState(new Animated.Value(1))[0];
  const radarOpacity = useState(new Animated.Value(0.6))[0];

  useEffect(() => {
    requestAndFetch();
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.parallel([
          Animated.timing(radarScale, {
            toValue: 2,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(radarOpacity, {
            toValue: 0,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      radarScale.setValue(1);
      radarOpacity.setValue(0.6);
    }
  }, [loading, radarScale, radarOpacity]);

  const requestAndFetch = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS coordinates require location permissions.');
        setLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(pos);
      try {
        const text = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
        await AsyncStorage.setItem('@last_location', text);
      } catch (err) {
        console.warn(err);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn(e);
      Alert.alert('GPS Error', 'Unable to fetch current location');
    } finally {
      setLoading(false);
    }
  };

  const copyLocation = async () => {
    if (!location) return Alert.alert('No coordinates', 'Please refresh your location coordinates first.');
    const text = `lat:${location.coords.latitude},lng:${location.coords.longitude},acc:${location.coords.accuracy.toFixed(1)}m`;
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', 'GPS coordinates copied to clipboard!');
  };

  // Determine accuracy level color
  const getAccuracyColor = (acc) => {
    if (acc < 15) return themeColors.success;
    if (acc < 50) return themeColors.warning;
    return themeColors.error;
  };

  const getAccuracyLabel = (acc) => {
    if (acc < 15) return 'High Precision';
    if (acc < 50) return 'Standard GPS';
    return 'Low Accuracy';
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>

      <View style={styles.content}>
        {/* Radar Map Visual Mockup */}
        <View style={styles.radarContainer}>
          {loading && (
            <Animated.View
              style={[
                styles.radarCircle,
                {
                  borderColor: themeColors.primary,
                  transform: [{ scale: radarScale }],
                  opacity: radarOpacity,
                },
              ]}
            />
          )}
          <View style={[styles.radarCenter, { backgroundColor: themeColors.primary + '20', borderColor: themeColors.primary }]}>
            {loading ? (
              <ActivityIndicator size="large" color={themeColors.primary} />
            ) : (
              <IconSymbol name="paperplane.fill" size={32} color={themeColors.primary} />
            )}
          </View>
        </View>

        {location ? (
          <View style={styles.cardContainer}>
            {/* Coordinate Details Card */}
            <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={styles.coordRow}>
                <View style={styles.coordCol}>
                  <Text style={[styles.coordLabel, { color: themeColors.textMuted }]}>LATITUDE</Text>
                  <Text style={[styles.coordValue, { color: themeColors.text }]}>{location.coords.latitude.toFixed(6)}°</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                <View style={styles.coordCol}>
                  <Text style={[styles.coordLabel, { color: themeColors.textMuted }]}>LONGITUDE</Text>
                  <Text style={[styles.coordValue, { color: themeColors.text }]}>{location.coords.longitude.toFixed(6)}°</Text>
                </View>
              </View>

              <View style={[styles.hDivider, { backgroundColor: themeColors.border }]} />

              <View style={styles.accuracyRow}>
                <View style={[styles.dot, { backgroundColor: getAccuracyColor(location.coords.accuracy) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.accLabel, { color: themeColors.text }]}>{getAccuracyLabel(location.coords.accuracy)}</Text>
                  <Text style={[styles.accValue, { color: themeColors.textMuted }]}>Margin of error: {location.coords.accuracy.toFixed(1)} meters</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
                onPress={requestAndFetch}
                disabled={loading}
              >
                <Text style={styles.btnText}>Refresh GPS Signal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: themeColors.primary }]}
                onPress={copyLocation}
              >
                <Text style={[styles.secondaryBtnText, { color: themeColors.primary }]}>Copy Coordinates</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <IconSymbol name="info" size={32} color={themeColors.textMuted} />
            <Text style={[styles.emptyText, { color: themeColors.text }]}>No GPS Lock Established</Text>
            <Text style={[styles.emptySubtext, { color: themeColors.textMuted }]}>
              Please initiate a GPS search to capture high precision coordinates for your inspection survey.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: themeColors.primary, width: '100%', marginTop: 24 }]}
              onPress={requestAndFetch}
              disabled={loading}
            >
              <Text style={styles.btnText}>Search GPS Coordinates</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  radarContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  radarCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  radarCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardContainer: {
    width: '100%',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coordCol: {
    flex: 1,
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  coordValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 40,
  },
  hDivider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  accLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  accValue: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 32,
    gap: 12,
  },
  primaryBtn: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
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
  emptyCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
