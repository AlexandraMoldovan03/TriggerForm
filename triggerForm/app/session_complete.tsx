import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function SessionCompleteScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.title}>Session complete</Text>
      <Text style={styles.sub}>Great work! Keep it up.</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push('/')}
      >
        <Text style={styles.btnText}>Back to home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', padding: 24 },
  check:     { fontSize: 48, marginBottom: 12 },
  title:     { fontSize: 22, fontWeight: '500', color: '#2c2c2a' },
  sub:       { fontSize: 14, color: '#888780', marginTop: 6, marginBottom: 32 },
  btn:       { backgroundColor: '#2c2c2a', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32 },
  btnText:   { color: '#fff', fontSize: 15, fontWeight: '500' },
});