import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

import AgendaScreen from "../screens/AgendaScreen";
import HabitsScreen from "../screens/HabitsScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ProgressScreen from "../screens/ProgressScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
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
