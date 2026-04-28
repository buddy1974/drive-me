import React, { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Switch, ActivityIndicator, RefreshControl,
} from 'react-native'
import { useNavigation }  from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { SafeAreaView }   from 'react-native-safe-area-context'
import { useQuery }       from '@tanstack/react-query'
import { api }            from '../../services/api'
import { useAuthStore }   from '../../store/authStore'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { AgentJobsStackParamList } from '../../navigation/types'
import type { Job } from '../../types'

type Nav = StackNavigationProp<AgentJobsStackParamList, 'AgentHome'>

interface AvailableJobsResponse {
  jobs:  Job[]
  total: number
  page:  number
  limit: number
}

export default function AgentHomeScreen() {
  const navigation = useNavigation<Nav>()
  const agent      = useAuthStore((s) => s.agent)
  const logout     = useAuthStore((s) => s.logout)
  const [online, setOnline] = useState(true)

  const { data, isLoading, refetch, isRefetching } = useQuery<AvailableJobsResponse>({
    queryKey:        ['jobs', 'available'],
    queryFn:         async () => {
      const { data } = await api.get<AvailableJobsResponse>('/jobs/available')
      return data
    },
    refetchInterval: online ? 10_000 : false,
    enabled:         online,
  })

  const jobs = data?.jobs ?? []

  function renderJob({ item }: { item: Job }) {
    const price = item.estimatedPrice.toLocaleString('fr-FR')
    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.jobRow}>
          <View style={styles.serviceTag}>
            <Text style={styles.serviceType}>{item.serviceType}</Text>
          </View>
          <Text style={styles.price}>{price} XAF</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.jobRow}>
          <Text style={styles.location}>📍 {item.pickupLocation.quarter}</Text>
          <Text style={styles.payment}>{item.paymentMethod.replace('_', ' ')}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, {agent?.name ?? 'Agent'}</Text>
          <Text style={styles.subGreeting}>
            {online
              ? `${jobs.length} job${jobs.length !== 1 ? 's' : ''} available`
              : 'You are offline'
            }
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusRow}>
            <View style={[styles.statusPill, online ? styles.statusPillActive : null]}>
              <View style={[styles.statusDot, { backgroundColor: online ? Colors.success : Colors.textDisabled }]} />
              <Text style={[styles.statusLabel, { color: online ? Colors.success : Colors.textSecondary }]}>
                {online ? 'Online' : 'Offline'}
              </Text>
              <Switch
                value={online}
                onValueChange={setOnline}
                trackColor={{ false: Colors.border, true: Colors.success + '66' }}
                thumbColor={online ? Colors.success : Colors.textDisabled}
                style={styles.switch}
              />
            </View>
          </View>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.signOut}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline banner */}
      {!online && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            🔴 You are offline — no new jobs will appear
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Finding jobs near you…</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJob}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>{online ? '🔍' : '📵'}</Text>
              <Text style={styles.emptyTitle}>{online ? 'No jobs right now' : 'You\'re offline'}</Text>
              <Text style={styles.emptyText}>
                {online ? 'Pull down to refresh or wait — new jobs will appear automatically' : 'Go online to start receiving job requests'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'flex-start',
    padding:          Spacing.lg,
    backgroundColor:  Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft:  { flex: 1 },
  headerRight: { alignItems: 'flex-end', gap: Spacing.sm },

  greeting:    { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  subGreeting: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusPill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing.xs,
    backgroundColor:   Colors.background,
    borderWidth:       1,
    borderColor:       Colors.border,
    borderRadius:      Radius.full,
    paddingLeft:       Spacing.sm,
    paddingRight:      4,
    paddingVertical:   4,
  },
  statusPillActive: {
    borderColor:      Colors.success,
    backgroundColor:  Colors.successLight,
  },
  statusDot: {
    width:        7,
    height:       7,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize:   FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
  signOut: { fontSize: FontSize.xs, color: Colors.textSecondary },

  offlineBanner: {
    backgroundColor: Colors.warningLight,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  offlineBannerText: { fontSize: FontSize.sm, color: Colors.warning, textAlign: 'center' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.sm },

  list: { padding: Spacing.lg },

  jobCard: {
    backgroundColor: Colors.surface,
    borderWidth:     1,
    borderColor:     Colors.border,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    marginBottom:    Spacing.sm,
  },
  jobRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.xs,
  },
  serviceTag: {
    backgroundColor: Colors.accentLight,
    borderRadius:    Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  serviceType: {
    fontSize:      FontSize.xs,
    fontWeight:    FontWeight.bold,
    color:         Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  price:       { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  location:    { fontSize: FontSize.sm, color: Colors.textSecondary },
  payment:     { fontSize: FontSize.xs, color: Colors.textDisabled },

  empty: {
    paddingTop:  Spacing.xxl,
    alignItems:  'center',
    paddingHorizontal: Spacing.xl,
    gap:         Spacing.sm,
  },
  emptyIcon:  { fontSize: 48, marginBottom: Spacing.xs },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' },
  emptyText:  { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
})
