// app/(tabs)/index.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>Dana</Text>
          </View>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Sessions</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Streak</Text>
              <Text style={styles.statValue}>0d</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Areas</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
          </View>
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>WHAT WOULD YOU LIKE TO DO?</Text>

        {/* Find trigger points */}
        <TouchableOpacity
          style={[styles.featureCard, styles.cardCoral]}
          onPress={() => router.push('/(tabs)/body-map')}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBox, { backgroundColor: '#D85A30' }]}>
            <Text style={styles.iconText}>⊕</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: '#712B13' }]}>
              Find trigger points
            </Text>
            <Text style={[styles.cardSub, { color: '#993C1D' }]}>
              Select where it hurts
            </Text>
          </View>
          <Text style={[styles.chevron, { color: '#D85A30' }]}>›</Text>
        </TouchableOpacity>

        {/* Recovery plan */}
        <TouchableOpacity
          style={[styles.featureCard, styles.cardTeal]}
          onPress={() => router.push('/(tabs)/body-map')}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBox, { backgroundColor: '#1D9E75' }]}>
            <Text style={styles.iconText}>✓</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: '#085041' }]}>
              Recovery plan
            </Text>
            <Text style={[styles.cardSub, { color: '#0F6E56' }]}>
              Guided massage session
            </Text>
          </View>
          <Text style={[styles.chevron, { color: '#1D9E75' }]}>›</Text>
        </TouchableOpacity>

        {/* Posture check */}
        <TouchableOpacity
          style={[styles.featureCard, styles.cardBlue]}
          onPress={() => router.push('/(tabs)/posture')}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBox, { backgroundColor: '#185FA5' }]}>
            <Text style={styles.iconText}>◎</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: '#042C53' }]}>
              Posture check
            </Text>
            <Text style={[styles.cardSub, { color: '#185FA5' }]}>
              Camera posture analysis
            </Text>
          </View>
          <Text style={[styles.chevron, { color: '#185FA5' }]}>›</Text>
        </TouchableOpacity>

        {/* Recent sessions */}
        <Text style={styles.sectionLabel}>RECENT SESSIONS</Text>

        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No sessions yet</Text>
          <Text style={styles.emptySub}>
            Complete your first session to see your history here
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#2C2C2A' },
  container:     { flex: 1, backgroundColor: '#fafafa' },
  content:       { paddingBottom: 40 },

  header:        {
    backgroundColor: '#2C2C2A',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting:      { color: '#888780', fontSize: 13, marginBottom: 2 },
  name:          { color: '#fff', fontSize: 22, fontWeight: '500', marginBottom: 16 },

  statsRow:      { flexDirection: 'row', gap: 10 },
  statBox:       {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statLabel:     { color: '#888780', fontSize: 11, marginBottom: 2 },
  statValue:     { color: '#fff', fontSize: 20, fontWeight: '500' },

  sectionLabel:  {
    fontSize: 11,
    fontWeight: '500',
    color: '#888780',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  featureCard:   {
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
    borderWidth: 0.5,
  },
  cardCoral:     { backgroundColor: '#FAECE7', borderColor: '#F0997B' },
  cardTeal:      { backgroundColor: '#E1F5EE', borderColor: '#9FE1CB' },
  cardBlue:      { backgroundColor: '#E6F1FB', borderColor: '#B5D4F4' },

  iconBox:       {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText:      { color: '#fff', fontSize: 18 },

  cardText:      { flex: 1 },
  cardTitle:     { fontSize: 15, fontWeight: '500', marginBottom: 2 },
  cardSub:       { fontSize: 12 },
  chevron:       { fontSize: 22, fontWeight: '300' },

  emptyState:    {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#d3d1c7',
    padding: 24,
    alignItems: 'center',
  },
  emptyText:     { fontSize: 14, fontWeight: '500', color: '#2c2c2a', marginBottom: 6 },
  emptySub:      { fontSize: 13, color: '#888780', textAlign: 'center', lineHeight: 20 },
});