import { colors } from "@/theme/color";
import { Tabs } from "expo-router";
import { Image } from "react-native";

const todayIcon = require("@/assets/images/tabIcons/today.png");
const calendarIcon = require("@/assets/images/tabIcons/calendar.png");
const settingsIcon = require("@/assets/images/tabIcons/settings.png");

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: { fontFamily: "PlusJakartaSans-Regular" },
        tabBarStyle: {
          height: 70,
          backgroundColor: colors.card,
          borderTopColor: colors.card,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Bugün",
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={todayIcon}
              resizeMode="contain"
              style={{
                width: size,
                height: size,
                tintColor: focused ? colors.accent : colors.inkMuted,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Takvim",
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={calendarIcon}
              resizeMode="contain"
              style={{
                width: size,
                height: size,
                tintColor: focused ? colors.accent : colors.inkMuted,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ayarlar",
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={settingsIcon}
              resizeMode="contain"
              style={{
                width: size,
                height: size,
                tintColor: focused ? colors.accent : colors.inkMuted,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
