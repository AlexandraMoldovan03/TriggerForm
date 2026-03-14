import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function RecoveryPlanScreen() {
  const router = useRouter();
  const { zone } = useLocalSearchParams<{ zone: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recovery plan</Text>
      <Text style={styles.sub}>Zone: {zone}</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push('/session_complete')}
      >
        <Text style={styles.btnText}>Complete session →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', padding: 24 },
  title:     { fontSize: 22, fontWeight: '500', color: '#2c2c2a' },
  sub:       { fontSize: 14, color: '#888780', marginTop: 6, marginBottom: 32 },
  btn:       { backgroundColor: '#1D9E75', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32 },
  btnText:   { color: '#fff', fontSize: 15, fontWeight: '500' },
});