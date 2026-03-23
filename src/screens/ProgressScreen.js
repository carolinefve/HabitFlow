import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  Switch,
  Platform,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BarChart, LineChart } from "react-native-chart-kit";

import {
  MotivationalQuotes,
  WeeklyData,
  MonthlyData,
  ChartConfiguration,
  EightWeeks,
  DayLabels,
  FrequencyOptions,
  DefaultSettings,
  generateWeekLabels,
} from "../services/progressService";

import styles from "../styles/progressStyles";

const { width: ScreenWidth } = Dimensions.get("window");
const ChartWidth = ScreenWidth - 48;
const PanelWidth = ScreenWidth * 0.82;

const WeekLabels = generateWeekLabels();

// Components
function StatPill({ label, value, colour }) {
  return (
    <View style={[styles.statPill, { backgroundColor: colour }]}>
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

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function StreakGrid({ data }) {
  const cols = 8;
  const rows = 7;
  const gap = 3;
  const dayLabelWidth = 14;
  const cellSize = 30;

  const cellColor = (v) => {
    if (v === 0) return "#001c3f";
    if (v === 1) return "#4a7098";
    return "#7EB8F7";
  };

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          flexDirection: "row",
          marginLeft: dayLabelWidth + gap,
          marginBottom: 4,
        }}
      >
        {WeekLabels.map((label, i) => (
          <View
            key={i}
            style={{ width: cellSize, marginRight: i < cols - 1 ? gap : 0 }}
          >
            <Text style={styles.gridWeekLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {Array.from({ length: rows }, (_, row) => (
        <View
          key={row}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: gap,
          }}
        >
          <Text style={[styles.gridDayLabel, { width: dayLabelWidth }]}>
            {DayLabels[row]}
          </Text>
          <View style={{ width: gap }} />
          {Array.from({ length: cols }, (_, col) => {
            const v = data[col * rows + row] ?? 0;
            return (
              <View
                key={col}
                style={[
                  styles.streakCell,
                  {
                    backgroundColor: cellColor(v),
                    width: cellSize,
                    height: cellSize,
                    marginRight: col < cols - 1 ? gap : 0,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}

      <View style={styles.legendRow}>
        {[
          ["#000914", "None"],
          ["#4a7098", "Partial"],
          ["#7EB8F7", "Done"],
        ].map(([color, label]) => (
          <View
            key={label}
            style={styles.legendItem}
          >
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
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

function SettingsPanel({
  visible,
  onClose,
  settings,
  onToggle,
  onFrequencyChange,
}) {
  const slideAnim = useRef(new Animated.Value(PanelWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 24,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: PanelWidth,
          duration: 230,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 230,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.backdrop,
            { opacity: backdropOpacity },
          ]}
        />
      </Pressable>

      <Animated.View
        style={[
          styles.panel,
          { width: PanelWidth, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.panelContent}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.panelHeader}>
            <TouchableOpacity
              style={styles.panelCloseBtn}
              onPress={onClose}
            >
              <Text style={styles.panelCloseIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.panelTitle}>Settings</Text>
          </View>

          {/* Profile */}
          <View style={styles.profileCard}>
            <Text style={styles.profileName}>Name</Text>
            <Text style={styles.profileSince}>Member since March 2025</Text>
          </View>

          {/* Notifications */}
          <Text style={styles.panelSectionLabel}>NOTIFICATIONS</Text>
          <View style={styles.settingsGroup}>
            <SettingRow
              label="Push Notifications"
              sub="Reminders for your habits"
              value={settings.notifications}
              onToggle={() => onToggle("notifications")}
            />
            <SettingRow
              label="Daily Reminder"
              sub="Morning nudge at 8:00 AM"
              value={settings.dailyReminder}
              onToggle={() => onToggle("dailyReminder")}
            />
            <SettingRow
              label="Weekly Report"
              sub="Summary every Sunday"
              value={settings.weeklyReport}
              onToggle={() => onToggle("weeklyReport")}
              isLast
            />
          </View>

          {/* Preferences */}
          <Text style={styles.panelSectionLabel}>PREFERENCES</Text>
          <View style={styles.settingsGroup}>
            <FrequencyRow
              value={settings.frequency}
              onChange={onFrequencyChange}
            />
            <SettingRow
              label="Dark Mode"
              value={settings.darkMode}
              onToggle={() => onToggle("darkMode")}
              isLast
            />
          </View>

          {/* Data & Backup */}
          <Text style={styles.panelSectionLabel}>DATA & BACKUP</Text>
          <View style={styles.settingsGroup}>
            <SettingRow
              label="Automated Backup"
              sub={
                Platform.OS === "ios"
                  ? "Synced with iCloud"
                  : "Synced with Google One"
              }
              value={settings.autoBackup}
              onToggle={() => onToggle("autoBackup")}
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
      </Animated.View>
    </View>
  );
}

// Screen
export default function ProgressScreen() {
  const [activeChart, setActiveChart] = useState("weekly");
  const [panelVisible, setPanelVisible] = useState(false);
  const [settings, setSettings] = useState(DefaultSettings);

  const toggleSetting = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["bottom", "left", "right"]}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Progress</Text>
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() => setPanelVisible(true)}
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
              colour="#7EB8F7"
            />
            <StatPill
              label="Best Streak"
              value="34"
              colour="#F9C784"
            />
            <StatPill
              label="This Week"
              value="88%"
              colour="#A78BFA"
            />
          </View>

          <MotivationCard
            quote={MotivationalQuotes[0].quote}
            sub={MotivationalQuotes[0].sub}
          />

          <SectionHeader title="Insights" />
          <View style={styles.toggle}>
            {["weekly", "monthly"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.toggleBtn,
                  activeChart === tab && styles.toggleBtnActive,
                ]}
                onPress={() => setActiveChart(tab)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    activeChart === tab && styles.toggleTextActive,
                  ]}
                >
                  {tab === "weekly" ? "Weekly" : "Monthly"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.chartCard}>
            {activeChart === "weekly" ? (
              <>
                <Text style={styles.chartTitle}>Habits Completed / Day</Text>
                <BarChart
                  data={WeeklyData}
                  width={ChartWidth - 24}
                  height={180}
                  chartConfig={ChartConfiguration}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  fromZero
                  withInnerLines={false}
                />
              </>
            ) : (
              <>
                <Text style={styles.chartTitle}>
                  Monthly Completion Rate (%)
                </Text>
                <LineChart
                  data={MonthlyData}
                  width={ChartWidth + 80}
                  height={180}
                  chartConfig={ChartConfiguration}
                  style={styles.chart}
                  bezier
                  withInnerLines={false}
                  withDots
                />
              </>
            )}
          </View>

          <MotivationCard
            quote={MotivationalQuotes[1].quote}
            sub={MotivationalQuotes[1].sub}
          />

          <SectionHeader title="Habit Continuity — Last 8 Weeks" />
          <View style={styles.chartCard}>
            <StreakGrid data={EightWeeks} />
          </View>
        </ScrollView>

        <SettingsPanel
          visible={panelVisible}
          onClose={() => setPanelVisible(false)}
          settings={settings}
          onToggle={toggleSetting}
          onFrequencyChange={(val) =>
            setSettings((p) => ({ ...p, frequency: val }))
          }
        />
      </View>
    </SafeAreaView>
  );
}
