import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
});
