import { useRef, useMemo, useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, Alert, FlatList, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as FileSystem from "expo-file-system";
import Button from '@/components/Button';
import {type Prediction, PredictionCard} from "@/components/CardID";

const API_URL = "https://back-flower-app-913646321813.europe-west1.run.app/predict";

type ServerResponse =
  | { prediction: Prediction }
  | { predictions: Prediction[] }
  | Prediction
  | Prediction[];

export default function ResultScreen() {
  const params = useLocalSearchParams<{uri?: string|undefined;}>();
  const uri = params.uri as string | undefined;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // keep controller to cancel in-flight request
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!uri) {
      Alert.alert("No photo", "Go back and take a picture first.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }
    uploadAndAnalyze(uri);
    // cancel if user leaves the screen
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  // function to load data and retrieve the server response
  const uploadAndAnalyze = async (fileUri: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // SIMULATE SERVER RESPONSE
    //const testjson = [{flower:"frangipanier", score:0.99}, {flower:"pissenlit", score:0.01}]
//     setTimeout(() => {console.log("Waiting 3 seconds!");
//         setResult(testjson);
//         setLoading(false);
//         controllerRef.current = null;
//         }, 2000);

    const controller = new AbortController();
    controllerRef.current = controller;

    // Optional: client-side timeout (e.g., 25s)
    const timeout = setTimeout(() => controller.abort(), 25_000);
    try {
      // Build multipart form data for native upload
      // RN supports { uri, name, type } as a file in FormData
      const form = new FormData();
      form.append("file", {
        uri: fileUri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
      // Add any extra fields your API expects
      // form.append("userId", "123");

      const res = await fetch(API_URL, {
        method: "POST",
        body: form,
        headers: {
          // NOTE: do NOT set 'Content-Type' manually for FormData; fetch will set boundary.
          Accept: "application/json",
        },
        signal: controller.signal,
      });
      // if there is an error response
      if (!res.ok) {
        const text = await safeText(res);
        throw new Error(`Server error ${res.status}: ${text || res.statusText}`);
      }
      // if everything is fine
      const json = (await res.json()) as ServerResponse;
      setResult(json);
    // if upload failed or was canceled
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setError("Request was canceled or timed out.");
      } else {
        setError(e?.message || "Upload failed.");
      }
    // in any way
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      controllerRef.current = null;
    }
  };

  const cancel = () => {
    controllerRef.current?.abort();
  };

  // Return the Result View
  if (!uri) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />

      {/* Loading */}
      {loading && (
        <View style={styles.card}>
          <Text style={styles.heading}>Analyzing…</Text>
          <ActivityIndicator size="large" />{/* round spinner */}
          <Text style={styles.subtle}>Uploading & waiting for server…</Text>
          <View style={styles.row}>
            <Button label="Cancel" onPress={cancel} />
          </View>
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={styles.card}>
          <Text style={[styles.heading, { color: "#b00020" }]}>Error</Text>
          <Text style={styles.body}>{error}</Text>
          <View style={styles.row}>
            <Button label="Retry" onPress={() => uploadAndAnalyze(uri)} theme='primary'/>
            <View style={{ width: 12 }} />
            <Button label="Back" onPress={() => router.back()} />
          </View>
        </View>
      )}

      {/* Predictions */}
      {!loading && !error && result && (
        <View style={styles.card}>
          <Text style={styles.heading}>Predictions</Text>

          <FlatList
            data={normalizePredictions(result)}
            keyExtractor={(item, idx) => `${item.name || idx}-${idx}`}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => <PredictionCard prediction={item} />}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
}

async function safeText(res: Response) {
  try { return await res.text(); } catch { return ""; }
}

// ===== utils: normalize various server shapes to a single list =====
function normalizePredictions(payload: ServerResponse | null): Prediction[] {
  if (!payload) return [];
  // Case 1: Array directly
  if (Array.isArray(payload)) return payload.map(sanitizePrediction);
  // Case 2: { predictions: [...] }
  if (typeof payload === "object" && "predictions" in payload) {
    const arr = (payload as any).predictions;
    return Array.isArray(arr) ? arr.map(sanitizePrediction) : [];
  }
  // Case 3: { prediction: {...} }
  if (typeof payload === "object" && "prediction" in payload) {
    return [sanitizePrediction((payload as any).prediction)];
  }
  // Case 4: Single prediction-like object
  return [sanitizePrediction(payload)];
}

function sanitizePrediction(p: any): Prediction {
  // accept both "name" and "flower"
  const name = String(p?.name ?? p?.flower ?? "").trim();
  const rawScore = p?.score;
  const score =
    typeof rawScore === "number"
      ? rawScore
      : typeof rawScore === "string" && !isNaN(Number(rawScore))
      ? Number(rawScore)
      : undefined;
  const image = typeof p?.image === "string" ? p.image : undefined;
  return { name, score, image, ...p };
}

// ================= Styles =================

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  image: { width: "100%", height: 360, backgroundColor: "#eee", borderRadius: 12 },

  card: { padding: 16, backgroundColor: "#fafafa", borderRadius: 12, gap: 10 },
  heading: { fontSize: 18, fontWeight: "700" },
  heading2: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  body: { fontSize: 15, lineHeight: 20 },
  subtle: { fontSize: 12, opacity: 0.7 },

  mono: { fontFamily: "Courier", fontSize: 12, lineHeight: 16 },

  row: { flexDirection: "row", alignItems: "center", marginTop: 8 },

  // Prediction list
  predRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  predThumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eee",
  },
  thumbFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  thumbLetter: { fontSize: 20, fontWeight: "700", opacity: 0.6 },
  predName: { fontSize: 16, fontWeight: "600" },
  predScore: { fontSize: 13, opacity: 0.8, marginTop: 2 },
});



//       const result = await res.json();
//       setResults(result.flower);
//       console.log('Upload result:', result.flower[0]);
//     } catch (error) {
//       console.error('Upload failed:', error);
//     }
//   };
//
