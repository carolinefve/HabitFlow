import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Animated,
} from "react-native";
import { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { FrequencyOptions, DefaultSettings } from "../services/progressService";

import styles from "../styles/settingsStyles";

// Components
function SectionLabel({ title }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function SettingRow({ label, sub, value, onToggle, isLast }) {
  return (
    <>
      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.settingLabel}>{label}</Text>
          {sub ? <Text style={styles.settingSub}>{sub}</Text> : null}
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#242741", true: "#27517d" }}
          thumbColor={value ? "#7EB8F7" : "#546591"}
        />
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
}

function FrequencyRow({ value, onChange, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    Animated.spring(expandAnim, {
      toValue: next ? 1 : 0,
      useNativeDriver: false,
      damping: 20,
      stiffness: 180,
    }).start();
  };

  const optionHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FrequencyOptions.length * 70],
  });

  const current =
    FrequencyOptions.find((o) => o.key === value) || FrequencyOptions[0];

  return (
    <>
      <TouchableOpacity
        style={styles.settingRow}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.settingLabel}>Reminder Frequency</Text>
          <Text style={styles.settingSub}>{current.label}</Text>
        </View>
        <Text style={[styles.actionIcon, { fontSize: 14 }]}>
          {expanded ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      <Animated.View style={{ overflow: "hidden", height: optionHeight }}>
        {FrequencyOptions.map((opt) => {
          const active = value === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={styles.freqOption}
              onPress={() => {
                onChange(opt.key);
                setExpanded(false);
                expandAnim.setValue(0);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[styles.freqRadio, active && styles.freqRadioActive]}
              >
                {active && <View style={styles.freqRadioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.freqLabel, active && { color: "#7EB8F7" }]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.freqDesc}>{opt.desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {!isLast && <View style={styles.divider} />}
    </>
  );
}

// Screen
export default function SettingsScreen() {
  const [settings, setSettings] = useState(DefaultSettings);

  const toggleSetting = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile */}
        <View style={styles.profileCard}>
          <Text style={styles.profileName}>Alex Stone</Text>
          <Text style={styles.profileSince}>Member since March 2025</Text>
        </View>

        {/* Notifications */}
        <SectionLabel title="NOTIFICATIONS" />
        <View style={styles.settingsGroup}>
          <SettingRow
            label="Push Notifications"
            sub="Reminders for your tasks and habits"
            value={settings.notifications}
            onToggle={() => toggleSetting("notifications")}
          />
          <SettingRow
            label="Calendar Reminders"
            sub="Reminders for your important dates"
            value={settings.dailyReminder}
            onToggle={() => toggleSetting("dailyReminder")}
            isLast
          />
        </View>

        {/* Preferences */}
        <SectionLabel title="PREFERENCES" />
        <View style={styles.settingsGroup}>
          <FrequencyRow
            value={settings.frequency}
            onChange={(val) => setSettings((p) => ({ ...p, frequency: val }))}
          />
          <SettingRow
            label="Dark Mode"
            value={settings.darkMode}
            onToggle={() => toggleSetting("darkMode")}
            isLast
          />
        </View>

        {/* Data & Backup */}
        <SectionLabel title="DATA & BACKUP" />
        <View style={styles.settingsGroup}>
          <SettingRow
            label="Automated Backup"
            sub={
              Platform.OS === "ios"
                ? "Synced with iCloud"
                : "Synced with Google One"
            }
            value={settings.autoBackup}
            onToggle={() => toggleSetting("autoBackup")}
          />
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingSub}>
                Save a JSON copy to your device
              </Text>
            </View>
            <Text style={styles.actionIcon}>↓</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
