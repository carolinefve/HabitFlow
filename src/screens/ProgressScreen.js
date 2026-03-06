import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Components
function StatPill({ label, value, accent }) {
  return (
    <View style={[styles.statPill, { backgroundColor: accent }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
});
