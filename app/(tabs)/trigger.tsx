import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TriggerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trigger Point</Text>
      <Text style={styles.text}>
        This section will be built by the trigger point team.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  text: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});