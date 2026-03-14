import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from "../../src/utils/colors";
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) Alert.alert('Login failed', error.message);
    // Navigation guard in _layout.tsx handles the redirect automatically
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        {/* Logo / brand */}
        <View style={styles.brand}>
          <View style={styles.brandDot} />
          <Text style={styles.brandName}>TriggerForm</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue your recovery</Text>

        {/* Form */}
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
            placeholder="Your password"
            placeholderTextColor="#888780"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotRow}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign in button */}
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Text>
        </TouchableOpacity>

        {/* Sign up link */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.switchLink}>Sign up</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg },
  inner:       { flex: 1, padding: 28, justifyContent: 'center' },
  brand:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 40 },
  brandDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D85A30' },
  brandName:   { fontSize: 18, fontWeight: '500', color: C.text },
  title:       { fontSize: 26, fontWeight: '500', color: C.text, marginBottom: 6 },
  subtitle:    { fontSize: 15, color: C.textMuted, marginBottom: 32 },
  form:        { marginBottom: 24 },
  inputLabel:  { fontSize: 13, fontWeight: '500', color: C.textMuted, marginBottom: 6 },
  input:       { backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#d3d1c7', borderRadius: 10, padding: 14, fontSize: 15, color: '#2c2c2a', marginBottom: 16 },
  forgotRow:   { alignItems: 'flex-end', marginTop: -8 },
  forgotText:  { fontSize: 13, color: '#D85A30' },
  btn:         { backgroundColor: '#D85A30', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  btnDisabled: { backgroundColor: '#d3d1c7' },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '500' },
  switchRow:   { flexDirection: 'row', justifyContent: 'center' },
  switchText:  { fontSize: 14, color: '#888780' },
  switchLink:  { fontSize: 14, color: '#D85A30', fontWeight: '500' },
});