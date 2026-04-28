import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../services/api'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { Agent } from '../../types'

export default function AgentPendingScreen() {
  const { agent, logout, updateAgent } = useAuthStore()

  // Poll every 30 seconds — when status changes away from PENDING_VERIFICATION,
  // RootNavigator will automatically re-route to AgentTabs.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get<Agent>('/auth/me')
        if (data.status !== 'PENDING_VERIFICATION') {
          updateAgent(data)
        }
      } catch { /* ignore */ }
    }, 30_000)
    return () => clearInterval(interval)
  }, [updateAgent])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>⏳</Text>
        </View>

        <Text style={styles.title}>Under review</Text>
        <Text style={styles.subtitle}>
          Your documents have been submitted. Our team will verify your account within 24 hours.
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Account</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>PENDING VERIFICATION</Text>
            </View>
          </View>
          {agent?.phone && (
            <View style={[styles.statusRow, { marginTop: Spacing.sm }]}>
              <Text style={styles.statusLabel}>Phone</Text>
              <Text style={styles.statusValue}>{agent.phone}</Text>
            </View>
          )}
        </View>

        <ActivityIndicator color={Colors.textSecondary} style={styles.spinner} />
        <Text style={styles.polling}>Checking status automatically…</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: {
    flex: 1, paddingHorizontal: Spacing.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  icon:     { fontSize: 36 },
  title:    { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  statusCard: {
    width: '100%', backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.xl,
  },
  statusRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel:  { fontSize: FontSize.sm, color: Colors.textSecondary },
  statusValue:  { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium },
  pendingBadge: {
    backgroundColor: Colors.warningLight, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  pendingText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.warning },
  spinner:     { marginBottom: Spacing.sm },
  polling:     { fontSize: FontSize.xs, color: Colors.textDisabled, marginBottom: Spacing.xxl },
  logoutBtn:   { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  logoutText:  { fontSize: FontSize.sm, color: Colors.textSecondary },
})
