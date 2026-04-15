import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp }           from '@react-navigation/native'
import { api }          from '../../services/api'
import { useAuthStore } from '../../store/authStore'
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
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

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={styles.buttonText}>Get Started</Text>
          }
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
    fontSize:   FontSize.xxl,
    fontWeight: FontWeight.bold,
    color:      Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color:    Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth:  1,
    borderColor:  Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm + 4,
    fontSize: FontSize.lg,
    color:    Colors.text,
    marginBottom: Spacing.sm,
  },
  inputError: { borderColor: Colors.error },
  errorText: { color: Colors.error, fontSize: FontSize.sm, marginBottom: Spacing.md },
  button: {
    backgroundColor: Colors.accent,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    alignItems:      'center',
    marginTop:       Spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color:      Colors.textInverse,
    fontSize:   FontSize.md,
    fontWeight: FontWeight.semibold,
  },
})
