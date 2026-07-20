import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View, Image, TouchableOpacity, useColorScheme } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { confirmAction } from '../utils/alert';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [captureTime, setCaptureTime] = useState('');
  const [openingCamera, setOpeningCamera] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  useEffect(() => {
    // Check for permission initially, if not requested yet, we do not force, we just let useCameraPermissions run.
    if (permission) {
      setOpeningCamera(false);
    }
  }, [permission]);

  const capturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      setOpeningCamera(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: false });
      
      // Request media library permission
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus === 'granted') {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        Alert.alert('Saved', 'Photo saved to system gallery successfully!');
      } else {
        Alert.alert('Permission Denied', 'Saved locally but could not export to gallery.');
      }

      await AsyncStorage.setItem('@last_photo', photo.uri);
      const now = new Date();
      await AsyncStorage.setItem('@last_photo_time', now.toISOString());
      
      setPhotoUri(photo.uri);
      setCaptureTime(now.toLocaleString());
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setOpeningCamera(false);
    }
  };

  const deletePhoto = () => {
    confirmAction(
      'Delete Photo',
      'Are you sure you want to delete this captured photo? This cannot be undone.',
      async () => {
        await AsyncStorage.removeItem('@last_photo');
        await AsyncStorage.removeItem('@last_photo_time');
        setPhotoUri(null);
        setCaptureTime('');
      },
      'Delete',
      'destructive'
    );
  };

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.textMuted }]}>Initializing Camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <View style={styles.permissionBox}>
          <IconSymbol name="camera.fill" size={60} color={themeColors.primary} />
          <Text style={[styles.title, { color: themeColors.text, marginTop: 16 }]}>Camera Access Required</Text>
          <Text style={[styles.description, { color: themeColors.textMuted }]}>
            We need camera permissions to capture inspectable photos for field surveys.
          </Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }]} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.textButton, { marginTop: 12 }]} onPress={() => router.back()}>
            <Text style={{ color: themeColors.primary, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.right" size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{photoUri ? 'Photo Preview' : 'Capture Survey Photo'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {photoUri ? (
        // Preview Workspace
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="contain" />
          <View style={styles.previewFooter}>
            <View style={styles.metadataRow}>
              <IconSymbol name="calendar" size={16} color="#94a3b8" />
              <Text style={styles.metadataText}>Captured: {captureTime}</Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#1e293b' }]}
                onPress={() => setPhotoUri(null)}
              >
                <IconSymbol name="plus.circle.fill" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                onPress={deletePhoto}
              >
                <IconSymbol name="trash" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // Camera Viewport
        <View style={styles.cameraContainer}>
          {openingCamera && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{ color: '#fff', marginTop: 10 }}>Saving image...</Text>
            </View>
          )}
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          
          <View style={styles.shutterContainer}>
            <Text style={styles.instruction}>Align inspection subject within frame</Text>
            <TouchableOpacity style={styles.shutterBtn} onPress={capturePhoto} disabled={openingCamera}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  permissionBox: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textButton: {
    padding: 8,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: '#000',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  camera: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  shutterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingBottom: 40,
    paddingTop: 16,
    alignItems: 'center',
  },
  instruction: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '500',
  },
  shutterBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  previewImage: {
    flex: 1,
  },
  previewFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  metadataText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
