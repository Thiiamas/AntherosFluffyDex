import { Image } from 'expo-image';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

import { Platform, StyleSheet, View, Text, Button, TouchableOpacity, Alert } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef } from 'react';
import ResultList from './ResultList';

export default function HomeScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [IsCameraActivated, setIsCameraActivating] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [uri, setUri] = useState<string | null>(null);
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  const ref = useRef<CameraView>(null);
  const url = 'YOUR_UPLOAD_URL_HERE'; // Replace with your endpoint
  const formData = new FormData();
  const [results, setResults] = useState<string[]>([]);
  // Define an onPress function
  if (!permission || !permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  const uploadImage = async (photoUri: string) => {
    const url = 'https://back-flower-app-913646321813.europe-west1.run.app/predict'; // Replace with your endpoint
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // Fetch the image as a blob
      const response = await fetch(photoUri);
      const blob = await response.blob();
      formData.append('image', blob, 'photo.jpg');
    } else {
      // Native: use the file URI
      formData.append('image', {
        uri: photoUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await res.json();
      setResults(result.flower);
      console.log('Upload result:', result.flower[0]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const takePicture = async () => {
    console.log(ref);
    const photo = await ref.current?.takePictureAsync();
    console.log(photo);
    if (!mediaPermission?.granted) {
      await requestMediaPermission();
    }
    // Save to gallery
    if (Platform.OS === 'web') {
      if (photo?.uri) {
        uploadImage(photo?.uri);
        // Create a link and trigger download
        // const link = document.createElement('a');
        // link.href = photo.uri;
        // link.download = 'photo.jpg';
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        setUri(photo.uri);
      } else {
        console.warn('No photo URI available');
        setUri(null);
      }
      return;
    }
    if (photo?.uri) {
      uploadImage(photo?.uri);

      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      console.log('Saved to gallery:', asset);
      console.log(asset);
      setUri(photo.uri);
    } else {
      console.warn('No photo URI available');
      setUri(null);
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }
  const onPress = () => {
    setIsCameraActivating(true);
    if (Platform.OS === 'web') {
      console.log('Camera activated!');
      return;
    }
    Alert.alert('Camera activated');
  };

  return (
    <View style={{ flex: 1, flexDirection: 'column' }}>
      <View style={{ flex: 2, backgroundColor: 'red' }}>
        {uri === null ? (
          <View style={{ height: '100%' }}>
            {IsCameraActivated ? (
              <CameraView style={styles.camera} facing={facing} ref={ref}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.button} onPress={takePicture}>
                    <Text style={styles.text}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              </CameraView>
            ) : (
              <Image
                source={require('@/assets/images/Logo.png')}
                style={{ height: '100%', resizeMode: 'stretch' }}
              />
            )}
          </View>
        ) : (
          <View style={{ height: '100%' }}>
            <Image
              style={{ height: '100%', width: '100%' }}
              source={{ uri: uri }}
              contentFit="cover"
            ></Image>
          </View>
        )}
      </View>
      <View style={{ flex: 1, backgroundColor: 'blue' }}>
        {results.length > 0 ? (
          <ResultList results={results}></ResultList>
        ) : (
          <View style={{ backgroundColor: 'green', borderRadius: 4, height: '100%', margin: 50 }}>
            <TouchableOpacity
              style={{ flex: 10, justifyContent: 'center', alignItems: 'center' }}
              onPress={onPress}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>CLICK ME BATARD !!!!!!!</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  image: {
    width: '50%',
    height: '100%',
    transform: [{ scale: 1.3 }], // Zoom in (increase the value for more zoom)
  },
});
