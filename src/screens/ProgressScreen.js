import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

import {
  MotivationalQuotes,
  WeeklyData,
  MonthlyData,
  ChartConfiguration,
  EightWeeks,
  DayLabels,
  generateWeekLabels,
} from "../services/progressService";

import styles from "../styles/progressStyles";

const { width: ScreenWidth } = Dimensions.get("window");
const ChartWidth = ScreenWidth - 48;

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

// Screen
export default function ProgressScreen() {
  const [activeChart, setActiveChart] = useState("weekly");

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
              <Text style={styles.chartTitle}>Monthly Completion Rate (%)</Text>
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
    </SafeAreaView>
  );
}
