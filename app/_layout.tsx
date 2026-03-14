import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { C } from '../src/utils/colors';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { OnboardingProvider, useOnboarding } from '../src/context/OnBoardingContext';

// ── Navigation guard ──────────────────────────────────────────────
function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const { hasOnboarded }     = useOnboarding();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuth       = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session) {
      // Not logged in → go to login
      if (!inAuth) router.replace('/(auth)/login');
    } else if (!hasOnboarded) {
      // Logged in but onboarding not done → go to onboarding
      if (!inOnboarding) router.replace('/onboarding');
    } else {
      // Fully authenticated → go to app
      if (inAuth || inOnboarding) router.replace('/(tabs)');
    }
  }, [session, loading, hasOnboarded, segments]);

  return <>{children}</>;
}

// ── Root layout ───────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <NavigationGuard>
          <>
            <StatusBar style="light" backgroundColor={C.surface} />
            <Stack
              screenOptions={{
                headerStyle:      { backgroundColor: C.surface },
                headerTintColor:  C.text,
                headerTitleStyle: { fontWeight: '800' },
                contentStyle:     { backgroundColor: C.bg },
              }}
            >
              {/* ── Existing screens ── */}
              <Stack.Screen name="(tabs)"        options={{ headerShown: false }} />
              <Stack.Screen name="exercise/[id]" options={{ title: 'Exercițiu' }} />
              <Stack.Screen name="trigger/[id]"  options={{ title: 'Trigger Point' }} />

              {/* ── Auth screens ── */}
              <Stack.Screen name="(auth)"        options={{ headerShown: false }} />
              <Stack.Screen name="onboarding"    options={{ headerShown: false }} />

              {/* ── Trigger point flow screens ── */}
              <Stack.Screen
                name="trigger-points"
                options={{
                  title: 'Trigger points',
                  headerTintColor: C.accent ?? '#D85A30',
                }}
              />
              <Stack.Screen
                name="recovery_plan"
                options={{
                  title: 'Recovery plan',
                  headerTintColor: C.accent ?? '#D85A30',
                }}
              />
              <Stack.Screen
                name="session_complete"
                options={{
                  headerShown: false,
                  presentation: 'modal',
                }}
              />
            </Stack>
          </>
        </NavigationGuard>
      </OnboardingProvider>
    </AuthProvider>
  );
}