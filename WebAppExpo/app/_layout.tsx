import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Capture', headerShown: false }} />
      <Stack.Screen name="results" options={{ title: 'Results', headerShown: true }} />
    </Stack>
  );
}