import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      <Text style={styles.sub}>Your session history will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' },
  title:     { fontSize: 22, fontWeight: '500', color: '#2c2c2a' },
  sub:       { fontSize: 14, color: '#888780', marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
});