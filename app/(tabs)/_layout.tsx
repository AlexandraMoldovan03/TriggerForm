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
          title:      "Acasă",
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
          headerTitle: "TriggerForm",
          headerLeft: () => <HeaderLogo />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title:      "Scanare",
          tabBarIcon: ({ color }) => <TabIcon emoji="📷" color={color} />,
          headerTitle: "Scanner Corp",
        }}
      />
      <Tabs.Screen
        name="/(auth)/login"
        options={{
          title:      "Login",
          tabBarIcon: ({ color }) => <TabIcon emoji="📷" color={color} />,
          headerTitle: "Scanner Corp",
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title:      "Exerciții",
          tabBarIcon: ({ color }) => <TabIcon emoji="🧘" color={color} />,
          headerTitle: "Exerciții & Recuperare",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title:      "Profil",
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
          headerTitle: "Profilul Meu",
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
