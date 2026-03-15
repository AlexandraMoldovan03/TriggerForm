import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, SafeAreaView,
} from 'react-native';
import { useOnboarding } from '../src/context/OnBoardingContext';
import { supabase } from '../src/lib/supabase';
import { saveProfile } from '../src/lib/db';
import { Alert } from 'react-native';

const PAIN_AREAS = [
  'Neck', 'Upper back', 'Lower back', 'Shoulders',
  'Arms', 'Hips', 'Legs', 'Chest',
];

const GOALS = [
  'Reduce daily pain', 'Improve posture',
  'Recover from injury', 'Prevent future pain',
  'Better sleep', 'Increase mobility',
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary',  label: 'Mostly sitting',    sub: 'Desk job, little movement' },
  { id: 'moderate',   label: 'Moderately active',  sub: 'Some exercise per week' },
  { id: 'active',     label: 'Very active',        sub: 'Regular exercise or physical job' },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useOnboarding();

  const [step,          setStep]          = useState(0);
  const [name,          setName]          = useState('');
  const [painAreas,     setPainAreas]     = useState<string[]>([]);
  const [goals,         setGoals]         = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);

  const toggleItem = (
    item: string,
    list: string[],
    setList: (l: string[]) => void
  ) => {
    setList(
      list.includes(item) ? list.filter(i => i !== item) : [...list, item]
    );
  };

  const handleFinish = async () => {
  if (!activityLevel) return;
  setLoading(true);

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      Alert.alert('Eroare', 'Sesiune invalidă. Loghează-te din nou.');
      setLoading(false);
      return;
    }

    await saveProfile(session.user.id, {
      name:           name.trim(),
      pain_areas:     painAreas,
      goals,
      activity_level: activityLevel,
    });

    await completeOnboarding();
  } catch (err: any) {
    Alert.alert('Eroare la salvare', err.message);
  }

  setLoading(false);
};

  const steps = [
    // Step 0 — Name
    <View key="name" style={styles.stepContainer}>
      <Text style={styles.stepLabel}>Step 1 of 4</Text>
      <Text style={styles.stepTitle}>What should we call you?</Text>
      <Text style={styles.stepSubtitle}>We'll personalise your experience</Text>
      <TextInput
        style={styles.input}
        placeholder="Your first name"
        placeholderTextColor="#888780"
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <TouchableOpacity
        style={[styles.nextBtn, !name && styles.nextBtnDisabled]}
        disabled={!name}
        onPress={() => setStep(1)}
      >
        <Text style={styles.nextBtnText}>Continue →</Text>
      </TouchableOpacity>
    </View>,

    // Step 1 — Pain areas
    <View key="pain" style={styles.stepContainer}>
      <Text style={styles.stepLabel}>Step 2 of 4</Text>
      <Text style={styles.stepTitle}>Where do you feel pain?</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>
      <View style={styles.grid}>
        {PAIN_AREAS.map(area => (
          <TouchableOpacity
            key={area}
            style={[styles.gridItem, painAreas.includes(area) && styles.gridItemActive]}
            onPress={() => toggleItem(area, painAreas, setPainAreas)}
          >
            <Text style={[styles.gridText, painAreas.includes(area) && styles.gridTextActive]}>
              {area}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.nextBtn, painAreas.length === 0 && styles.nextBtnDisabled]}
        disabled={painAreas.length === 0}
        onPress={() => setStep(2)}
      >
        <Text style={styles.nextBtnText}>Continue →</Text>
      </TouchableOpacity>
    </View>,

    // Step 2 — Goals
    <View key="goals" style={styles.stepContainer}>
      <Text style={styles.stepLabel}>Step 3 of 4</Text>
      <Text style={styles.stepTitle}>What are your goals?</Text>
      <Text style={styles.stepSubtitle}>Pick everything that matters to you</Text>
      <View style={styles.grid}>
        {GOALS.map(goal => (
          <TouchableOpacity
            key={goal}
            style={[styles.gridItem, styles.gridItemWide, goals.includes(goal) && styles.gridItemActive]}
            onPress={() => toggleItem(goal, goals, setGoals)}
          >
            <Text style={[styles.gridText, goals.includes(goal) && styles.gridTextActive]}>
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.nextBtn, goals.length === 0 && styles.nextBtnDisabled]}
        disabled={goals.length === 0}
        onPress={() => setStep(3)}
      >
        <Text style={styles.nextBtnText}>Continue →</Text>
      </TouchableOpacity>
    </View>,

    // Step 3 — Activity level
    <View key="activity" style={styles.stepContainer}>
      <Text style={styles.stepLabel}>Step 4 of 4</Text>
      <Text style={styles.stepTitle}>How active are you?</Text>
      <Text style={styles.stepSubtitle}>This helps us tailor your recovery plans</Text>
      <View style={styles.activityList}>
        {ACTIVITY_LEVELS.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[styles.activityCard, activityLevel === level.id && styles.activityCardActive]}
            onPress={() => setActivityLevel(level.id)}
          >
            <Text style={[styles.activityLabel, activityLevel === level.id && styles.activityLabelActive]}>
              {level.label}
            </Text>
            <Text style={styles.activitySub}>{level.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.nextBtn, (!activityLevel || loading) && styles.nextBtnDisabled]}
        disabled={!activityLevel || loading}
        onPress={handleFinish}
      >
        <Text style={styles.nextBtnText}>
          {loading ? 'Setting up...' : "Let's go →"}
        </Text>
      </TouchableOpacity>
    </View>,
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        {[0,1,2,3].map(i => (
          <View
            key={i}
            style={[styles.progressSegment, i <= step && styles.progressSegmentActive]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {steps[step]}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:              { flex: 1, backgroundColor: '#fafafa' },
  progressBar:            { flexDirection: 'row', gap: 6, padding: 20, paddingBottom: 0 },
  progressSegment:        { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#d3d1c7' },
  progressSegmentActive:  { backgroundColor: '#D85A30' },
  content:                { flexGrow: 1, padding: 24 },
  stepContainer:          { flex: 1, paddingTop: 16 },
  stepLabel:              { fontSize: 12, color: '#888780', marginBottom: 8 },
  stepTitle:              { fontSize: 24, fontWeight: '500', color: '#2c2c2a', marginBottom: 6 },
  stepSubtitle:           { fontSize: 15, color: '#888780', marginBottom: 28 },
  input:                  { backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#d3d1c7', borderRadius: 10, padding: 14, fontSize: 17, color: '#2c2c2a', marginBottom: 28 },
  grid:                   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  gridItem:               { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 0.5, borderColor: '#d3d1c7', backgroundColor: '#fff' },
  gridItemWide:           { paddingHorizontal: 14 },
  gridItemActive:         { backgroundColor: '#FAECE7', borderColor: '#D85A30' },
  gridText:               { fontSize: 14, color: '#888780' },
  gridTextActive:         { color: '#712B13', fontWeight: '500' },
  activityList:           { gap: 10, marginBottom: 28 },
  activityCard:           { padding: 16, borderRadius: 12, borderWidth: 0.5, borderColor: '#d3d1c7', backgroundColor: '#fff' },
  activityCardActive:     { backgroundColor: '#FAECE7', borderColor: '#D85A30' },
  activityLabel:          { fontSize: 15, fontWeight: '500', color: '#2c2c2a', marginBottom: 2 },
  activityLabelActive:    { color: '#712B13' },
  activitySub:            { fontSize: 13, color: '#888780' },
  nextBtn:                { backgroundColor: '#D85A30', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled:        { backgroundColor: '#d3d1c7' },
  nextBtnText:            { color: '#fff', fontSize: 16, fontWeight: '500' },
});