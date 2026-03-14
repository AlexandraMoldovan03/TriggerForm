import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingContextType = {
  hasOnboarded:     boolean;
  completeOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType>(
  {} as OnboardingContextType
);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('hasOnboarded').then(val => {
      setHasOnboarded(val === 'true');
    });
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    setHasOnboarded(true);
  };

  return (
    <OnboardingContext.Provider value={{ hasOnboarded, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);