import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { C } from "../src/utils/colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={C.surface} />
      <Stack
        screenOptions={{
          headerStyle:      { backgroundColor: C.surface },
          headerTintColor:  C.text,
          headerTitleStyle: { fontWeight: "800" },
          contentStyle:     { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="exercise/[id]" options={{ title: "Exercițiu" }} />
        <Stack.Screen name="trigger/[id]"  options={{ title: "Trigger Point" }} />
      </Stack>
    </>
  );
}
