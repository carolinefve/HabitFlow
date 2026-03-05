import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import AgendaScreen from "../screens/AgendaScreen";
import HabitsScreen from "../screens/HabitsScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ProgressScreen from "../screens/ProgressScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerTitle: "",
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Agenda: focused ? "list" : "list-outline",
              Habits: focused ? "checkmark-circle" : "checkmark-circle-outline",
              Calendar: focused ? "calendar" : "calendar-outline",
              Progress: focused ? "bar-chart" : "bar-chart-outline",
            };
            return (
              <Ionicons
                name={icons[route.name]}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: "#2e8cf0",
          tabBarInactiveTintColor: "#000000",
          tabBarStyle: {
            backgroundColor: "#ffffff",
          },
        })}
      >
        <Tab.Screen
          name="Agenda"
          component={AgendaScreen}
        />
        <Tab.Screen
          name="Habits"
          component={HabitsScreen}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
        />
        <Tab.Screen
          name="Progress"
          component={ProgressScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
