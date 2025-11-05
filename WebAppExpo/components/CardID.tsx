import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";

export type Prediction = {
  name?: string;      // normalized display name
  score?: number;
  image?: string;
  // keep original keys if you like
  [k: string]: any;
};


export function PredictionCard({ prediction }: { prediction: Prediction }) {
  const scoreText = formatScore(prediction.score);
  const hasImage = !!prediction.image;

  return (
    <View style={styles.predRow}>
      {hasImage ? (
        <Image source={{ uri: prediction.image as string }} style={styles.predThumb} contentFit="cover" />
      ) : (
        <View style={[styles.predThumb, styles.thumbFallback]}>
          <Text style={styles.thumbLetter}>{prediction.name?.[0]?.toUpperCase() || "?"}</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={styles.predName}>{prediction.name || "Unnamed"}</Text>
        {!!scoreText && <Text style={styles.predScore}>Score: {scoreText}</Text>}
      </View>
    </View>
  );
}

// ======= helpers (UI-local) =======
function formatScore(score?: number) {
  if (score == null || isNaN(score)) return null;
  if (score >= 0 && score <= 1) return `${Math.round(score * 100)}%`;
  return Number.isInteger(score) ? `${score}` : score.toFixed(3);
}

const styles = StyleSheet.create({
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
  thumbFallback: { alignItems: "center", justifyContent: "center" },
  thumbLetter: { fontSize: 20, fontWeight: "700", opacity: 0.6 },
  predName: { fontSize: 16, fontWeight: "600" },
  predScore: { fontSize: 13, opacity: 0.8, marginTop: 2 },
});
