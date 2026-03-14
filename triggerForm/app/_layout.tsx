// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="trigger-points"
        options={{
          title: 'Trigger points',
          headerBackTitle: 'Back',
          headerTintColor: '#D85A30',
        }}
      />
      <Stack.Screen
        name="recovery-plan"
        options={{
          title: 'Recovery plan',
          headerBackTitle: 'Back',
          headerTintColor: '#D85A30',
        }}
      />
      <Stack.Screen
        name="session-complete"
        options={{
          headerShown: false, // full screen, no header
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}