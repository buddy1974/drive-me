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
        <Text style={styles.logo}>Drive Me</Text>
        <Text style={styles.tagline}>Errands and deliveries in Cameroon</Text>

        <View style={styles.cards}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Phone', { actor: 'user' })}
          >
            <Text style={styles.cardIcon}>🛍️</Text>
            <Text style={styles.cardTitle}>I need a task done</Text>
            <Text style={styles.cardSub}>Place orders and track delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardAgent]}
            onPress={() => navigation.navigate('Phone', { actor: 'agent' })}
          >
            <Text style={styles.cardIcon}>🚗</Text>
            <Text style={styles.cardTitle}>I'm an agent</Text>
            <Text style={styles.cardSub}>Accept jobs and earn money</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  logo: {
    fontSize:   FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color:      Colors.text,
    textAlign:  'center',
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize:  FontSize.md,
    color:     Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  cards: { gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderWidth:  1,
    borderColor:  Colors.border,
    borderRadius: Radius.lg,
    padding:      Spacing.xl,
    alignItems:   'center',
  },
  cardAgent: {
    backgroundColor: Colors.primary,
    borderColor:     Colors.primary,
  },

  cardIcon: { fontSize: 40, marginBottom: Spacing.sm },
  cardTitle: {
    fontSize:   FontSize.lg,
    fontWeight: FontWeight.bold,
    color:      Colors.text,
    marginBottom: Spacing.xs,
    textAlign:  'center',
  },
  cardSub: {
    fontSize: FontSize.sm,
    color:    Colors.textSecondary,
    textAlign: 'center',
  },
})
