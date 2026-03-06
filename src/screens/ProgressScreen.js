import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Data
const MotivationalQuotes = [
  {
    quote: "You never miss a Monday 💪",
    sub: "Morning habits are your strongest.",
  },
  {
    quote: "3 weeks of consistency 🌿",
    sub: "Take it easy this weekend you've earned it!",
  },
];

// Components
function StatPill({ label, value, accent }) {
  return (
    <View style={[styles.statPill, { backgroundColor: accent }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MotivationCard({ quote, sub }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });
  return (
    <Animated.View style={[styles.motivationCard, { opacity }]}>
      <Text style={styles.motivationQuote}>{quote}</Text>
      <Text style={styles.motivationSub}>{sub}</Text>
    </Animated.View>
  );
}

export default function ProgressScreen() {
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["bottom", "left", "right"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <TouchableOpacity
            style={styles.avatarCircle}
            activeOpacity={0.75}
          >
            <Ionicons
              name="person"
              size={25}
              color="#7EB8F7"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatPill
            label="Current Streak"
            value="21"
            accent="#7EB8F7"
          />
          <StatPill
            label="Best Streak"
            value="34"
            accent="#F9C784"
          />
          <StatPill
            label="This Week"
            value="88%"
            accent="#A78BFA"
          />
        </View>

        <MotivationCard
          quote={MotivationalQuotes[0].quote}
          sub={MotivationalQuotes[0].sub}
        />
        <MotivationCard
          quote={MotivationalQuotes[1].quote}
          sub={MotivationalQuotes[1].sub}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#000000" },
  container: { flex: 1, backgroundColor: "#000000" },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: "800",
    color: "#ffffff",
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 25,
    backgroundColor: "#0D2137",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#7EB8F7",
  },
  avatarText: { color: "#7EB8F7", fontWeight: "800", fontSize: 18 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  statPill: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
    color: "#000000",
  },
  statLabel: {
    fontSize: 12,
    color: "rgb(0, 0, 0)",
    textAlign: "center",
    fontWeight: "600",
  },
  motivationCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#7EB8F7",
  },
  motivationQuote: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 5,
  },
  motivationSub: { fontSize: 16, color: "#acd0f6", fontWeight: "500" },
});
