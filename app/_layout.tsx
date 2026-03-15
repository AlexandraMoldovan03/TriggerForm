import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { C } from "../src/utils/colors";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import {
  OnboardingProvider,
  useOnboarding,
} from "../src/context/OnBoardingContext";

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const { hasOnboarded } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!session) {
      if (!inAuth) router.replace("/(auth)/login");
    } else if (!hasOnboarded) {
      if (!inOnboarding) router.replace("/onboarding");
    } else {
      if (inAuth || inOnboarding) router.replace("/(tabs)");
    }
  }, [session, loading, hasOnboarded, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <NavigationGuard>
          <>
            <StatusBar style="light" backgroundColor={C.surface} />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: C.surface },
                headerTintColor: C.text,
                headerTitleStyle: { fontWeight: "800" },
                contentStyle: { backgroundColor: C.bg },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="exercise/[id]" options={{ title: "Exercise" }} />
              <Stack.Screen name="specialists" options={{ title: "Specialists" }} />
            </Stack>
          </>
        </NavigationGuard>
      </OnboardingProvider>
    </AuthProvider>
  );
}