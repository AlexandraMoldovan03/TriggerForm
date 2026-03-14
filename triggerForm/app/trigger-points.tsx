import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Body, { ExtendedBodyPart } from 'react-native-body-highlighter';
import { TRIGGER_POINT_MAP } from '../assets/triggerPointMap';

type Side = 'front' | 'back';

export default function BodyMapScreen() {
  const { width } = useWindowDimensions();
  const [side, setSide] = useState<Side>('front');
  const [selectedParts, setSelectedParts] = useState<ExtendedBodyPart[]>([]);
  const [activePart, setActivePart] = useState<string | null>(null);

  const handleBodyPartPress = (bodyPart: ExtendedBodyPart) => {
    // Guard: slug can be undefined in the library types
    if (!bodyPart.slug) return;

    const slug = bodyPart.slug as string;

    // Toggle off if already selected
    if (selectedParts.find(p => p.slug === slug)) {
      setSelectedParts(prev => prev.filter(p => p.slug !== slug));
      setActivePart(null);
      return;
    }

    setSelectedParts(prev => [...prev, { slug: bodyPart.slug, intensity: 2 }]);
    setActivePart(slug);
  };

  const activeData = activePart ? TRIGGER_POINT_MAP[activePart] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.title}>Where does it hurt?</Text>
      <Text style={styles.subtitle}>Tap the area on your body</Text>

      {/* Front / Back toggle */}
      <View style={styles.toggleRow}>
        {(['front', 'back'] as Side[]).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.toggleBtn, side === s && styles.toggleActive]}
            onPress={() => setSide(s)}
          >
            <Text style={[styles.toggleText, side === s && styles.toggleTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>


      {/* Body diagram */}
      <View style={styles.bodyContainer}>
        <Body
          data={selectedParts}
          onBodyPartPress={handleBodyPartPress}
          side={side}
          scale={width / 200}
          colors={['#F0997B', '#D85A30']} // [intensity 1, intensity 2]
        />
      </View>

      {/* Selected regions */}
      {selectedParts.length > 0 && (
        <View style={styles.selectedList}>
          <Text style={styles.sectionTitle}>Selected areas</Text>
          <View style={styles.pillRow}>
            {selectedParts.map(part => {
              // Guard: skip if slug is undefined
              if (!part.slug) return null;
              const slug = part.slug as string;
              return (
                <TouchableOpacity
                  key={slug}
                  style={[styles.pill, activePart === slug && styles.pillActive]}
                  onPress={() => setActivePart(activePart === slug ? null : slug)}
                >
                  <Text style={[
                    styles.pillText,
                    activePart === slug && styles.pillTextActive,
                  ]}>
                    {TRIGGER_POINT_MAP[slug]?.label ?? slug}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Trigger point info card */}
      { /* activeData && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{activeData.label}</Text>

          {activeData.triggerPoints.map((tp, i) => (
            <View key={i} style={styles.tpBlock}>
              <Text style={styles.tpName}>{tp.name}</Text>
              <Text style={styles.tpLocation}>{tp.location}</Text>

              <Text style={styles.label}>Referred pain</Text>
              <Text style={styles.value}>{tp.referredPain.join(', ')}</Text>

              <Text style={styles.label}>Common causes</Text>
              <Text style={styles.value}>{tp.causes.join(', ')}</Text>
            </View>
          )) */ } 

          {/* </ScrollView><TouchableOpacity style={styles.recoveryBtn}>
            <Text style={styles.recoveryBtnText}>Start recovery plan →</Text>
          </TouchableOpacity>
        </View> */}
      
      <TouchableOpacity style={styles.recoveryBtn}>
            <Text style={styles.recoveryBtnText}>Find trigger points →</Text>
      </TouchableOpacity>
      

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#fafafa' },
  content:         { paddingBottom: 60 },
  title:           { fontSize: 22, fontWeight: '500', textAlign: 'left', marginTop: 24, color: '#2c2c2a', paddingLeft: 25 },
  subtitle:        { fontSize: 14, textAlign: 'left', color: '#888780', marginTop: 4, marginBottom: 16, paddingLeft: 25 },
  toggleRow:       { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  toggleBtn:       { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 0.5, borderColor: '#d3d1c7' },
  toggleActive:    { backgroundColor: '#2c2c2a', borderColor: '#2c2c2a' },
  toggleText:      { fontSize: 14, color: '#888780' },
  toggleTextActive:{ color: '#fff' },
  bodyContainer:   { alignItems: 'center', marginVertical: 16 },
  selectedList:    { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle:    { fontSize: 13, color: '#888780', marginBottom: 8 },
  pillRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:            { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 0.5, borderColor: '#d3d1c7', backgroundColor: '#fff' },
  pillActive:      { backgroundColor: '#D85A30', borderColor: '#D85A30' },
  pillText:        { fontSize: 13, color: '#5f5e5a' },
  pillTextActive:  { color: '#fff' },
  infoCard:        { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#d3d1c7', padding: 16, marginBottom: 16 },
  cardTitle:       { fontSize: 16, fontWeight: '500', color: '#2c2c2a', marginBottom: 12 },
  tpBlock:         { marginBottom: 12 },
  tpName:          { fontSize: 14, fontWeight: '500', color: '#2c2c2a' },
  tpLocation:      { fontSize: 12, color: '#888780', marginBottom: 8 },
  label:           { fontSize: 12, color: '#888780', marginTop: 6 },
  value:           { fontSize: 13, color: '#5f5e5a', marginTop: 2 },
  recoveryBtn:     { marginTop: 16, backgroundColor: '#D85A30', borderRadius: 8, paddingVertical: 14, alignItems: 'center', width: 350, marginLeft: 30 },
  recoveryBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});