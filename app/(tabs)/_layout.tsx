import { Tabs } from "expo-router";
import { C } from "../../src/utils/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle:       { backgroundColor: C.surface },
        headerTintColor:   C.text,
        headerTitleStyle:  { fontWeight: "800", fontSize: 17 },
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor:  C.border,
          borderTopWidth:  1,
          paddingBottom:   8,
          paddingTop:      6,
          height:          62,
        },
        tabBarActiveTintColor:   C.accent,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:      "Home",
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
          headerTitle: "TriggerForm",
          headerLeft: () => <HeaderLogo />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title:      "Scan",
          tabBarIcon: ({ color }) => <TabIcon emoji="📷" color={color} />,
          headerTitle: "Body Scanner",
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title:      "Exercises",
          tabBarIcon: ({ color }) => <TabIcon emoji="🧘" color={color} />,
          headerTitle: "Exercises & Recovery",
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title:      "Nutrition",
          tabBarIcon: ({ color }) => <TabIcon emoji="🥗" color={color} />,
          headerTitle: "Nutrition",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title:      "Profile",
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
          headerTitle: "My Profile",
        }}
      />
    </Tabs>
  );
}

import { Text, View } from "react-native";

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 20, opacity: color === C.accent ? 1 : 0.5 }}>{emoji}</Text>;
}

function HeaderLogo() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 16 }}>
      <View style={{
        width: 28, height: 28, borderRadius: 8,
        backgroundColor: C.accent,
        justifyContent: "center", alignItems: "center",
      }}>
        <Text style={{ fontSize: 14 }}>⚡</Text>
      </View>
    </View>
  );
}
