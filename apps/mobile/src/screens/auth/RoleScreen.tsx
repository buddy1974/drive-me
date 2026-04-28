import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { AuthStackParamList } from '../../navigation/types'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'

type Nav = StackNavigationProp<AuthStackParamList, 'Role'>

export default function RoleScreen() {
  const navigation = useNavigation<Nav>()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Brand mark */}
        <View style={styles.brand}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>D</Text>
          </View>
          <Text style={styles.logoName}>Drive Me</Text>
          <Text style={styles.tagline}>Errands & deliveries in Cameroon</Text>
        </View>

        {/* Role cards */}
        <View style={styles.cards}>
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => navigation.navigate('Phone', { actor: 'user' })}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.cardIcon}>🛍️</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I need a task done</Text>
              <Text style={styles.cardSub}>Shopping, errands & deliveries</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agentCard}
            onPress={() => navigation.navigate('Phone', { actor: 'agent' })}
            activeOpacity={0.8}
          >
            <View style={styles.agentIconWrap}>
              <Text style={styles.cardIcon}>🚗</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.agentTitle}>I'm an agent</Text>
              <Text style={styles.agentSub}>Accept jobs and earn money</Text>
            </View>
            <Text style={styles.agentChevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Available 24/7 across Cameroon</Text>
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
  },

  brand: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoLetter: {
    fontSize: 36,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  logoName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  cards: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  userCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  agentCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardIcon: { fontSize: 26 },
  cardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  agentTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    marginBottom: 2,
  },
  agentSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.65)',
  },
  chevron: {
    fontSize: 24,
    color: Colors.textDisabled,
    marginLeft: Spacing.sm,
  },
  agentChevron: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.4)',
    marginLeft: Spacing.sm,
  },

  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
  },
})
