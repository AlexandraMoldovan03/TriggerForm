import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from "../../src/utils/colors";
import { useAuth } from '../../src/context/AuthContext';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirm) {
      Alert.alert('Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      Alert.alert('Signup failed', error.message);
    } else {
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Click it to activate your account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner}>

        <View style={styles.brand}>
          <View style={styles.brandDot} />
          <Text style={styles.brandName}>TriggerForm</Text>
        </View>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start your recovery journey</Text>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#888780"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor="#888780"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.inputLabel}>Confirm password</Text>
          <TextInput
            style={styles.input}
            placeholder="Repeat your password"
            placeholderTextColor="#888780"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? 'Creating account...' : 'Create account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.switchLink}>Sign in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg },
  inner:       { flexGrow: 1, padding: 28, justifyContent: 'center' },
  brand:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 40 },
  brandDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D85A30' },
  brandName:   { fontSize: 18, fontWeight: '500', color: C.text },
  title:       { fontSize: 26, fontWeight: '500', color: C.text, marginBottom: 6 },
  subtitle:    { fontSize: 15, color: C.textMuted, marginBottom: 32 },
  form:        { marginBottom: 24 },
  inputLabel:  { fontSize: 13, fontWeight: '500', color: C.textMuted, marginBottom: 6 },
  input:       { backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#d3d1c7', borderRadius: 10, padding: 14, fontSize: 15, color: '#2c2c2a', marginBottom: 16 },
  btn:         { backgroundColor: '#D85A30', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  btnDisabled: { backgroundColor: '#d3d1c7' },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '500' },
  switchRow:   { flexDirection: 'row', justifyContent: 'center' },
  switchText:  { fontSize: 14, color: '#888780' },
  switchLink:  { fontSize: 14, color: '#D85A30', fontWeight: '500' },
});