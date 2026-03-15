import { Tabs } from "expo-router";
import { C } from "../../src/utils/colors";
import { Image, View } from "react-native";

const ICONS = {
  home:      require("../../src/assets/body/home_icon.png"),
  scan:      require("../../src/assets/body/scan_icon.png"),
  exercises: require("../../src/assets/body/excercise.png"),
  nutrition: require("../../src/assets/body/nutrition_icon.png"),
  profile:   require("../../src/assets/body/profile_icon.png"),
};

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
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.home} focused={focused} />
          ),
          headerTitle: "TriggerForm",
          headerLeft: () => <HeaderLogo />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title:      "Scan",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.scan} focused={focused} />
          ),
          headerTitle: "Body Scanner",
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title:      "Exercises",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.exercises} focused={focused} />
          ),
          headerTitle: "Exercises & Recovery",
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title:      "Nutrition",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.nutrition} focused={focused} />
          ),
          headerTitle: "Nutrition",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title:      "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={ICONS.profile} focused={focused} />
          ),
          headerTitle: "My Profile",
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  source,
  focused,
}: {
  source: ReturnType<typeof require>;
  focused: boolean;
}) {
  return (
    <Image
      source={source}
      style={{
        width:  24,
        height: 24,
        resizeMode: "contain",
        opacity: focused ? 1 : 0.45,
        tintColor: focused ? C.accent : undefined,
      }}
    />
  );
}

function HeaderLogo() {
  return (
    <View style={{ paddingLeft: 16 }}>
      <Image
        source={ICONS.scan}
        style={{
          width: 26,
          height: 26,
          resizeMode: "contain",
          tintColor: C.accent,
        }}
      />
    </View>
  );
}
