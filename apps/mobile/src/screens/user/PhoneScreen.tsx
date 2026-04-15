import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useNavigation }   from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { api }             from '../../services/api'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { AuthStackParamList } from '../../navigation/types'

type Nav = StackNavigationProp<AuthStackParamList, 'Phone'>

export default function PhoneScreen() {
  const navigation = useNavigation<Nav>()
  const [phone,    setPhone]    = useState('+237')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleSend() {
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { phone, actor: 'user' })
      navigation.navigate('Otp', { phone })
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Drive Me</Text>
        <Text style={styles.subtitle}>Enter your phone number</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+237 6XX XXX XXX"
          placeholderTextColor={Colors.textDisabled}
          autoFocus
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={styles.buttonText}>Continue</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputError: { borderColor: Colors.error },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
})
