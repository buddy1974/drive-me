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
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { AuthStackParamList } from '../../navigation/types'

type Nav   = StackNavigationProp<AuthStackParamList, 'Phone'>
type Route = RouteProp<AuthStackParamList, 'Phone'>

export default function PhoneScreen() {
  const navigation = useNavigation<Nav>()
  const { params } = useRoute<Route>()
  const actor = params?.actor ?? 'user'

  const [phone,   setPhone]   = useState('+237')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSend() {
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { phone, actor })
      navigation.navigate('Otp', { phone, actor })
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const isAgent = actor === 'agent'

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

          <Text style={styles.title}>{isAgent ? 'Agent sign in' : 'Welcome back'}</Text>
          <Text style={styles.subtitle}>Enter your Cameroon phone number</Text>

          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+237 6XX XXX XXX"
            placeholderTextColor={Colors.textDisabled}
            autoFocus
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.textInverse} />
              : <Text style={styles.buttonText}>Continue →</Text>
            }
          </TouchableOpacity>

          <Text style={styles.hint}>We'll send a 6-digit verification code</Text>
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
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  logoName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
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
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color:      Colors.textInverse,
    fontSize:   FontSize.md,
    fontWeight: FontWeight.bold,
  },

  hint: {
    fontSize:  FontSize.xs,
    color:     Colors.textDisabled,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
})
