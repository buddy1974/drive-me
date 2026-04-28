import React from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useNavigation }     from '@react-navigation/native'
import { useQueries }        from '@tanstack/react-query'
import { SafeAreaView }      from 'react-native-safe-area-context'
import { api }               from '../../services/api'
import { useJobStore }       from '../../store/jobStore'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { Job, JobStatus } from '../../types'

// JobHistoryScreen is rendered as a bottom-tab, so we use any for nav here
// since HomeStackParamList doesn't include HistoryTab
import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParamList }        from '../../navigation/types'

type Nav = StackNavigationProp<HomeStackParamList>

const STATUS_COLOR: Partial<Record<JobStatus, string>> = {
  COMPLETED:         Colors.success,
  CANCELLED_BY_USER:  Colors.error,
  CANCELLED_BY_AGENT: Colors.error,
  CANCELLED_BY_ADMIN: Colors.error,
}

export default function JobHistoryScreen() {
  const navigation = useNavigation<Nav>()
  const jobIds     = useJobStore((s) => s.jobIds)

  const results = useQueries({
    queries: jobIds.map((id) => ({
      queryKey: ['job', id],
      queryFn:  async () => {
        const { data } = await api.get<Job>(`/jobs/${id}`)
        return data
      },
      staleTime: 60_000,
    })),
  })

  const jobs    = results.map((r) => r.data).filter(Boolean) as Job[]
  const loading = results.some((r) => r.isLoading)

  function renderItem({ item }: { item: Job }) {
    const color = STATUS_COLOR[item.status] ?? Colors.accent
    const date  = new Date(item.createdAt).toLocaleDateString('fr-FR')
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('JobTracking', { jobId: item.id })}
      >
        <View style={styles.cardRow}>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
          <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.statusText, { color }]}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.location}>{item.pickupLocation.quarter}</Text>
          <Text style={styles.price}>{item.estimatedPrice.toLocaleString('fr-FR')} XAF</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Job History</Text>
        {jobs.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{jobs.length}</Text>
          </View>
        )}
      </View>

      {loading && jobIds.length > 0 && (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: Spacing.md }} />
      )}

      {jobIds.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No jobs yet</Text>
          <Text style={styles.emptySubtext}>Your completed jobs will appear here</Text>
        </View>
      )}

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  titleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop:    Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize:   FontSize.xl,
    fontWeight: FontWeight.bold,
    color:      Colors.text,
  },
  countBadge: {
    backgroundColor:   Colors.accentLight,
    borderRadius:      Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical:   2,
    minWidth:          24,
    alignItems:        'center',
  },
  countText: {
    fontSize:   FontSize.xs,
    fontWeight: FontWeight.bold,
    color:      Colors.accent,
  },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderWidth:  1,
    borderColor:  Colors.border,
    borderRadius: Radius.lg,
    padding:      Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.xs,
  },
  serviceType: {
    fontSize:   FontSize.sm,
    fontWeight: FontWeight.semibold,
    color:      Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical:   2,
  },
  statusText: { fontSize: 11, fontWeight: FontWeight.semibold },
  description: {
    fontSize:     FontSize.md,
    color:        Colors.text,
    marginBottom: Spacing.xs,
  },
  location: { fontSize: FontSize.sm, color: Colors.textSecondary },
  price:    { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  date:     { fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 2 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems:     'center',
    paddingTop:     Spacing.xxl,
  },
  emptyIcon:    { fontSize: 48, marginBottom: Spacing.md },
  emptyText:    { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
})
