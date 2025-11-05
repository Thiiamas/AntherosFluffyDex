import { Platform, StyleSheet, View, Text, Alert } from 'react-native';
import React, { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageViewer from '@/components/ImageViewer';
import Button from '@/components/Button';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, Link } from "expo-router";

// default screen, display choice between load image and take image
const PlaceholderImage = require('@/assets/images/Logo.png');
export default function Index() {
  const router = useRouter();

  // defines a function to select an image in the library and store it in selectedImage
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      console.log(result);
      setSelectedImage(result.assets[0].uri);
    }
    else {
      alert('You did not select any image.');
    }
  };

  // define a function to take a picture and store it in selectedImage
  const [busy, setBusy] = useState(false);
  const takePicture = async () => {
    try {
      setBusy(true);
      // Ask for permission if needed
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Camera access is needed to take a photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        exif: true,
      });

      if (!result.canceled) {
      console.log(result);
      setSelectedImage(result.assets[0].uri);
      }
      else {
        alert('You did not select any image.');
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  // define a function to upload an image and retrieve the result from a server
  const uploadImage = async () => {
    router.push({pathname:"/results" ,
      params: {
        uri: encodeURIComponent(selectedImage),
      }
    });
  };

  // return a background photo and buttons to select a picture
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
      </View>
      <View style={styles.footerContainer}>
        <Button label="Choose a photo" theme="primary" onPress={pickImageAsync} disabled={false}/>
        <Button label="Take a picture" onPress={takePicture} disabled={false} />
        {selectedImage && (<Button label="Use this photo" onPress={uploadImage} disabled={(!selectedImage)} />)}
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 20,
  },
  footerContainer: {
    flex: 1/2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
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
