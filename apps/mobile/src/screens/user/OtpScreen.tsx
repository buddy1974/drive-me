import React, { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp }                 from '@react-navigation/native'
import { api }             from '../../services/api'
import { useAuthStore }    from '../../store/authStore'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { AuthStackParamList } from '../../navigation/types'
import type { User }               from '../../types'

type Nav   = StackNavigationProp<AuthStackParamList, 'Otp'>
type Route = RouteProp<AuthStackParamList, 'Otp'>

export default function OtpScreen() {
  const navigation = useNavigation<Nav>()
  const { params } = useRoute<Route>()
  const login      = useAuthStore((s) => s.login)

  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const inputRef = useRef<TextInput>(null)

  async function handleVerify() {
    setError(null)
    setLoading(true)
    try {
      const { data } = await api.post<{
        accessToken: string
        refreshToken: string
        user: User
      }>('/auth/verify-otp', { phone: params.phone, otp: code, actor: 'user' })
      await login(data.accessToken, data.refreshToken, data.user)
      // RootNavigator will switch to MainTabs automatically
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      if (msg === 'name is required to create a new account') {
        navigation.navigate('Name', { phone: params.phone, otp: code })
      } else {
        setError(msg ?? 'Invalid code. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError(null)
    try {
      await api.post('/auth/send-otp', { phone: params.phone, actor: 'user' })
    } catch { /* silent */ }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>Code sent to {params.phone}</Text>

        <TextInput
          ref={inputRef}
          style={[styles.input, error ? styles.inputError : null]}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={Colors.textDisabled}
          textAlign="center"
          autoFocus
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={styles.buttonText}>Verify</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} style={styles.resend}>
          <Text style={styles.resendText}>Resend code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  back: { position: 'absolute', top: Spacing.xl, left: Spacing.lg },
  backText: { color: Colors.accent, fontSize: FontSize.md },
  title: {
    fontSize: FontSize.xxl,
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
    paddingVertical: Spacing.md,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    letterSpacing: 8,
    marginBottom: Spacing.sm,
  },
  inputError: { borderColor: Colors.error },
  errorText: { color: Colors.error, fontSize: FontSize.sm, marginBottom: Spacing.md },
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
  resend: { alignItems: 'center', marginTop: Spacing.lg },
  resendText: { color: Colors.accent, fontSize: FontSize.sm },
})
