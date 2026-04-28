import React, { useState } from 'react'
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
import type { User }               from '../../types'

type Nav   = StackNavigationProp<AuthStackParamList, 'Name'>
type Route = RouteProp<AuthStackParamList, 'Name'>

export default function NameScreen() {
  const navigation = useNavigation<Nav>()
  const { params } = useRoute<Route>()
  const loginUser  = useAuthStore((s) => s.loginUser)

  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) { setError('Please enter your name'); return }
    setError(null)
    setLoading(true)
    try {
      const { data } = await api.post<{
        accessToken:  string
        refreshToken: string
        actor:        User
      }>('/auth/verify-otp', {
        phone: params.phone,
        otp:   params.otp,
        actor: 'user',
        name:  name.trim(),
      })
      await loginUser(data.accessToken, data.refreshToken, data.actor)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = name.trim().length > 0 && !loading

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

          <Text style={styles.title}>What's your name?</Text>
          <Text style={styles.subtitle}>This is how agents will greet you</Text>

          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={Colors.textDisabled}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            autoFocus
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {loading
              ? <ActivityIndicator color={Colors.textInverse} />
              : <Text style={styles.buttonText}>Get Started →</Text>
            }
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
    backgroundColor:   Colors.surface,
    borderWidth:       1,
    borderColor:       Colors.border,
    borderRadius:      Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm + 4,
    fontSize:          FontSize.lg,
    color:             Colors.text,
    marginBottom:      Spacing.sm,
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
})
