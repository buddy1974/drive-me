import React from 'react'
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native'
import { SafeAreaView }  from 'react-native-safe-area-context'
import { useQuery }      from '@tanstack/react-query'
import { api }           from '../../services/api'
import { useAuthStore }  from '../../store/authStore'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { AgentEarnings } from '../../types'

export default function EarningsScreen() {
  const agent = useAuthStore((s) => s.agent)

  const { data, isLoading, isError, refetch } = useQuery<AgentEarnings>({
    queryKey: ['agent', 'earnings'],
    queryFn:  async () => {
      const { data } = await api.get<AgentEarnings>('/agents/earnings')
      return data
    },
    staleTime: 30_000,
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Earnings</Text>
        {agent && <Text style={styles.agentName}>{agent.name}</Text>}

        {isLoading && <ActivityIndicator color={Colors.accent} style={{ marginTop: Spacing.xl }} />}

        {isError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Failed to load earnings</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.summaryCardTotal]}>
                <Text style={styles.summaryLabel}>Total Earned</Text>
                <Text style={[styles.summaryAmount, { color: Colors.success }]}>
                  {data.totalEarned.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.summaryCurrency}>XAF</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Pending Payout</Text>
                <Text style={[styles.summaryAmount, { color: Colors.warning }]}>
                  {data.pendingPayout.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.summaryCurrency}>XAF</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Jobs Completed</Text>
                <Text style={styles.statValue}>{data.completedJobs}</Text>
              </View>
              <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.statLabel}>Average per Job</Text>
                <Text style={styles.statValue}>
                  {data.completedJobs > 0
                    ? Math.round(data.totalEarned / data.completedJobs).toLocaleString('fr-FR')
                    : '—'
                  } XAF
                </Text>
              </View>
            </View>

            {/* Payout note */}
            <View style={styles.payoutNote}>
              <Text style={styles.payoutNoteIcon}>💳</Text>
              <Text style={styles.payoutNoteText}>
                Payouts are sent to {agent?.momoPhone ?? 'your registered MTN MoMo number'} after each completed job.
              </Text>
            </View>

            {data.updatedAt && (
              <Text style={styles.lastUpdated}>
                Last updated: {new Date(data.updatedAt).toLocaleString('fr-FR')}
              </Text>
            )}
          </>
        )}

        {data && data.completedJobs === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚀</Text>
            <Text style={styles.emptyTitle}>Start earning today</Text>
            <Text style={styles.emptySub}>Accept your first job to start earning</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll:    { padding: Spacing.lg },
  title:     { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 2 },
  agentName: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg },
  summaryRow: {
    flexDirection: 'row',
    gap:           Spacing.md,
    marginBottom:  Spacing.md,
  },
  summaryCard: {
    flex:            1,
    backgroundColor: Colors.surface,
    borderWidth:     1,
    borderColor:     Colors.border,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    alignItems:      'center',
  },
  summaryCardTotal: { backgroundColor: Colors.successLight, borderColor: Colors.success },
  summaryLabel:  { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryAmount: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginTop: Spacing.xs },
  summaryCurrency: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statsCard: {
    backgroundColor: Colors.surface,
    borderWidth:     1,
    borderColor:     Colors.border,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    marginBottom:    Spacing.md,
  },
  statRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  payoutNote: {
    flexDirection: 'row',
    gap:           Spacing.sm,
    backgroundColor: Colors.accentLight,
    borderRadius:    Radius.md,
    padding:         Spacing.md,
    marginBottom:    Spacing.md,
  },
  payoutNoteIcon: { fontSize: 20 },
  payoutNoteText: { flex: 1, fontSize: FontSize.sm, color: Colors.accent },
  lastUpdated: { fontSize: FontSize.xs, color: Colors.textDisabled, textAlign: 'center' },
  errorBox:   { alignItems: 'center', marginTop: Spacing.xl },
  errorText:  { color: Colors.error, fontSize: FontSize.md, marginBottom: Spacing.sm },
  retryBtn:   { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  retryText:  { color: Colors.textInverse, fontSize: FontSize.sm },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl },
  emptyIcon:  { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  emptySub:   { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
})
