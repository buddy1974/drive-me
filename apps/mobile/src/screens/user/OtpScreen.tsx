import React, { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp }           from '@react-navigation/native'
import { SafeAreaView }  from 'react-native-safe-area-context'
import { api }           from '../../services/api'
import { useAuthStore }  from '../../store/authStore'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { AuthStackParamList } from '../../navigation/types'
import type { User, Agent }        from '../../types'

type Nav   = StackNavigationProp<AuthStackParamList, 'Otp'>
type Route = RouteProp<AuthStackParamList, 'Otp'>

export default function OtpScreen() {
  const navigation  = useNavigation<Nav>()
  const { params }  = useRoute<Route>()
  const loginUser   = useAuthStore((s) => s.loginUser)
  const loginAgent  = useAuthStore((s) => s.loginAgent)

  const actor = params.actor

  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const inputRef = useRef<TextInput>(null)

  async function handleVerify() {
    setError(null)
    setLoading(true)
    try {
      const { data } = await api.post<{
        accessToken:  string
        refreshToken: string
        actor:        User & Agent
      }>('/auth/verify-otp', { phone: params.phone, otp: code, actor })

      if (actor === 'agent') {
        await loginAgent(data.accessToken, data.refreshToken, data.actor)
      } else {
        await loginUser(data.accessToken, data.refreshToken, data.actor)
      }
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
    try {
      await api.post('/auth/send-otp', { phone: params.phone, actor })
    } catch { /* silent */ }
  }

  const canSubmit = code.length >= 4 && !loading

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>D</Text>
            </View>
            <Text style={styles.logoName}>Drive Me</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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
            placeholder="• • • • • •"
            placeholderTextColor={Colors.textDisabled}
            textAlign="center"
            autoFocus
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={!canSubmit}
          >
            {loading
              ? <ActivityIndicator color={Colors.textInverse} />
              : <Text style={styles.buttonText}>Verify Code</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} style={styles.resend}>
            <Text style={styles.resendText}>Didn't receive it? Resend code</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },

  brand: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoLetter: {
    fontSize:   24,
    fontWeight: FontWeight.bold,
    color:      Colors.textInverse,
  },
  logoName: {
    fontSize:   FontSize.xl,
    fontWeight: FontWeight.bold,
    color:      Colors.text,
  },

  backBtn: { marginBottom: Spacing.lg },
  backText: { color: Colors.accent, fontSize: FontSize.sm },

  title: {
    fontSize:     FontSize.xxl,
    fontWeight:   FontWeight.bold,
    color:        Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize:     FontSize.sm,
    color:        Colors.textSecondary,
    marginBottom: Spacing.xl,
  },

  input: {
    backgroundColor: Colors.surface,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.lg,
    fontSize:        FontSize.xxl,
    fontWeight:      FontWeight.bold,
    color:           Colors.text,
    letterSpacing:   12,
    marginBottom:    Spacing.sm,
  },
  inputError: { borderColor: Colors.error },

  errorBox: {
    backgroundColor:   Colors.errorLight,
    borderRadius:      Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
    marginBottom:      Spacing.sm,
  },
  errorText: { color: Colors.error, fontSize: FontSize.sm },

  button: {
    backgroundColor: Colors.accent,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md + 2,
    alignItems:      'center',
    marginTop:       Spacing.sm,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color:      Colors.textInverse,
    fontSize:   FontSize.md,
    fontWeight: FontWeight.bold,
  },

  resend: { alignItems: 'center', marginTop: Spacing.lg },
  resendText: { color: Colors.accent, fontSize: FontSize.sm },
})
