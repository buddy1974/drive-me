import React from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native'
import { useNavigation }   from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { SafeAreaView }    from 'react-native-safe-area-context'
import { useAuthStore }    from '../../store/authStore'
import { useJobStore }     from '../../store/jobStore'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { HomeStackParamList } from '../../navigation/types'
import type { ServiceType } from '../../types'

type Nav = StackNavigationProp<HomeStackParamList, 'Home'>

const SERVICES: { type: ServiceType; label: string; icon: string; description: string }[] = [
  { type: 'ERRAND',   label: 'Errand',   icon: '🛍️', description: 'Shopping, bill payment, queuing' },
  { type: 'PICKUP',   label: 'Pickup',   icon: '🚗', description: 'Pick up a person or item' },
  { type: 'DELIVERY', label: 'Delivery', icon: '📦', description: 'Deliver documents or goods' },
]

export default function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const user       = useAuthStore((s) => s.user)
  const logout     = useAuthStore((s) => s.logout)
  // user is non-null in MainTabs (root navigator guarantees actor === 'user')
  const activeJobId = useJobStore((s) => s.activeJobId)

  function greetUser() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greetUser()},</Text>
            <Text style={styles.name}>{user?.name ?? 'there'} 👋</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Active job banner */}
        {activeJobId && (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={() => navigation.navigate('JobTracking', { jobId: activeJobId })}
          >
            <Text style={styles.activeBannerText}>You have an active job — tap to track</Text>
          </TouchableOpacity>
        )}

        {/* Service selection */}
        <Text style={styles.sectionTitle}>What do you need?</Text>
        {SERVICES.map((svc) => (
          <TouchableOpacity
            key={svc.type}
            style={styles.serviceCard}
            onPress={() => navigation.navigate('PlaceOrder')}
          >
            <Text style={styles.serviceIcon}>{svc.icon}</Text>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceLabel}>{svc.label}</Text>
              <Text style={styles.serviceDesc}>{svc.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll:    { padding: Spacing.lg },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   Spacing.xl,
  },
  greeting: { fontSize: FontSize.md, color: Colors.textSecondary },
  name:     { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  logoutBtn: { paddingVertical: Spacing.xs },
  logoutText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  activeBanner: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  activeBannerText: { color: Colors.accent, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  serviceCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  Spacing.sm,
  },
  serviceIcon: { fontSize: 28, marginRight: Spacing.md },
  serviceInfo: { flex: 1 },
  serviceLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  serviceDesc:  { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 24, color: Colors.textSecondary },
})
