import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { AgentOnboardingStackParamList } from '../../navigation/types'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'

type Nav = StackNavigationProp<AgentOnboardingStackParamList, 'AgentOnboarding'>

export default function AgentOnboardingScreen() {
  const navigation = useNavigation<Nav>()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>D</Text>
        </View>
        <Text style={styles.title}>Welcome to Drive Me</Text>
        <Text style={styles.subtitle}>
          Complete your profile to start accepting jobs and earning in Yaoundé.
        </Text>

        <View style={styles.steps}>
          {[
            { n: '1', label: 'Vehicle information' },
            { n: '2', label: 'Identity documents' },
            { n: '3', label: 'Admin review (24 hrs)' },
          ].map((step) => (
            <View key={step.n} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepN}>{step.n}</Text>
              </View>
              <Text style={styles.stepLabel}>{step.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AgentProfile')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoLetter: {
    fontSize: 30,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  steps: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepN: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  stepLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
})
