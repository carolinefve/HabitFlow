import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

export default function Habits() {

  const [habit1, setHabit1] = useState(true);
  const [habit2, setHabit2] = useState(true);
  const [habit3, setHabit3] = useState(false);
  const [habit4, setHabit4] = useState(false);

  const renderButton = (value, setValue) => (
    <TouchableOpacity
      style={value ? styles.completedButton : styles.tbdButton}
      onPress={() => setValue(!value)}
    >
      <Text style={styles.buttonText}>
        {value ? "Completed" : "TBD"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.card}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Exercise</Text>
            <Text
              style={styles.description}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              100 Pushups, 100 Burpees, 100 Jumping Squats, 100 Lunges, 5km Run
            </Text>
          </View>
          {renderButton(habit1, setHabit1)}
        </View>

        <View style={styles.card}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>XXX</Text>
            <Text
              style={styles.description}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              ------------------------------------------------------------
            </Text>
          </View>
          {renderButton(habit2, setHabit2)}
        </View>

        <View style={styles.card}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>XXX</Text>
            <Text
              style={styles.description}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              ------------------------------------------------------------
            </Text>
          </View>
          {renderButton(habit3, setHabit3)}
        </View>

        <View style={styles.card}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>XXX</Text>
            <Text
              style={styles.description}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              ------------------------------------------------------------
            </Text>
          </View>
          {renderButton(habit4, setHabit4)}
        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#156082",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    marginRight: 12,
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },

  description: {
    color: "#d6edf7",
    fontSize: 14,
  },

  completedButton: {
    width: 110,
    height: 40,
    backgroundColor: "#22c55e",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  tbdButton: {
    width: 110,
    height: 40,
    backgroundColor: "#6b7280",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});