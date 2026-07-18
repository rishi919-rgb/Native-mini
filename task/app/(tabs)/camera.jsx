import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, StyleSheet, Text, View } from 'react-native';
import * as MediaLibrary from "expo-media-library";

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [captureTime, setCaptureTime] = useState('');
  const [openingCamera, setOpeningCamera] = useState(true);

 const capturePhoto = async () => {
  if (!cameraRef.current) return;

  const photo = await cameraRef.current.takePictureAsync();

  // Ask for gallery permission
  const granted = await requestMediaLibraryPermission();
  if (!granted) return;

  // Save photo to gallery
  await MediaLibrary.saveToLibraryAsync(photo.uri);

  Alert.alert("Success", "Photo saved to gallery!");

  setPhotoUri(photo.uri);
  setCaptureTime(new Date().toLocaleString());
};

  const requestMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Required");
      return false;
    }

    return true;
  };

  const deletePhoto = () => {
    Alert.alert('Delete photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { setPhotoUri(null); setCaptureTime(''); } },
    ]);
  };

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" /><Text>Opening camera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission is required.</Text>
        <Button title="Allow Camera" onPress={requestPermission} />
      </View>
    );
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Photo Preview</Text>
        <Image source={{ uri: photoUri }} style={styles.image} />
        <Text>Captured: {captureTime}</Text>
        <View style={styles.space} />
        <Button title="Retake Photo" onPress={() => { setPhotoUri(null); setOpeningCamera(true); }} />
        <View style={styles.space} />
        <Button title="Delete Photo" color="red" onPress={deletePhoto} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera</Text>
      {openingCamera && <View style={styles.loading}><ActivityIndicator size="large" /><Text>Opening camera...</Text></View>}
      <CameraView ref={cameraRef} style={styles.camera} facing="back" onCameraReady={() => setOpeningCamera(false)} />
      <View style={styles.space} />
      <Button title="Capture Photo" onPress={capturePhoto} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  camera: { flex: 1, minHeight: 350 },
  image: { flex: 1, width: '100%', minHeight: 350, resizeMode: 'contain' },
  loading: { position: 'absolute', zIndex: 1, top: '45%', left: 0, right: 0, alignItems: 'center', gap: 8 },
  space: { height: 12 },
});
