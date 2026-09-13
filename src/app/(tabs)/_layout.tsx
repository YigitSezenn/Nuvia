import { Tabs } from "expo-router";
import { Image, StyleSheet } from "react-native";

const todayIcon = require("@/assets/images/tabIcons/today.png");
const calendarIcon = require("@/assets/images/tabIcons/calendar.png");
const settingsIcon = require("@/assets/images/tabIcons/settings.png");

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B3D",
        tabBarInactiveTintColor: "#1C1C22",
       
        tabBarLabelStyle: { fontFamily: "PlusJakartaSans-Regular" },
        tabBarStyle: {
          height: 70,
          
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
              style={[
                styles.icon,
                {
                  width: size,
                  height: size,
                  tintColor: focused ? "#FF6B3D" : "#1C1C22",
                },
              ]}
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
              style={[
                styles.icon,
                {
                  width: size,
                  height: size,
                  tintColor: focused ? "#FF6B3D" : "#1C1C22",
                },
              ]}
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
              style={[
                styles.icon,
                {
                  width: size,
                  height: size,
                  tintColor: focused ? "#FF6B3D" : "#1C1C22",
                },
              ]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    resizeMode: "contain", // iconların boyutunu koruyarak içine sığdırır
  },
});
