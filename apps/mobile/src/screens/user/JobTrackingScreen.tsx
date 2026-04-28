import React, { useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useRoute, useNavigation }  from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp }                 from '@react-navigation/native'
import { useQuery }          from '@tanstack/react-query'
import { SafeAreaView }      from 'react-native-safe-area-context'
import { api }               from '../../services/api'
import { useJobStore }       from '../../store/jobStore'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { HomeStackParamList } from '../../navigation/types'
import type { Job, JobStatus, LocationUpdate } from '../../types'

type Nav   = StackNavigationProp<HomeStackParamList, 'JobTracking'>
type Route = RouteProp<HomeStackParamList, 'JobTracking'>

const STATUS_LABELS: Record<JobStatus, string> = {
  PENDING:                  'Finding agent…',
  ACCEPTED:                 'Agent accepted',
  EN_ROUTE_TO_PICKUP:       'Agent on the way',
  ARRIVED_AT_PICKUP:        'Agent arrived',
  IN_PROGRESS:              'In progress',
  ARRIVED_AT_DESTINATION:   'Arrived at destination',
  COMPLETED:                'Completed',
  CANCELLED_BY_USER:        'Cancelled by you',
  CANCELLED_BY_AGENT:       'Cancelled by agent',
  CANCELLED_BY_ADMIN:       'Cancelled by admin',
}

const ACTIVE_STATUSES: JobStatus[] = [
  'PENDING', 'ACCEPTED', 'EN_ROUTE_TO_PICKUP',
  'ARRIVED_AT_PICKUP', 'IN_PROGRESS', 'ARRIVED_AT_DESTINATION',
]

const PROGRESS_STEPS: JobStatus[] = [
  'PENDING', 'ACCEPTED', 'EN_ROUTE_TO_PICKUP',
  'ARRIVED_AT_PICKUP', 'IN_PROGRESS', 'ARRIVED_AT_DESTINATION', 'COMPLETED',
]

export default function JobTrackingScreen() {
  const navigation = useNavigation<Nav>()
  const { params } = useRoute<Route>()
  const setActiveJobId = useJobStore((s) => s.setActiveJobId)

  const isActive = useCallback((status: JobStatus) => ACTIVE_STATUSES.includes(status), [])

  const { data: job, isLoading, isError, refetch } = useQuery<Job>({
    queryKey: ['job', params.jobId],
    queryFn:  async () => {
      const { data } = await api.get<Job>(`/jobs/${params.jobId}`)
      return data
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (!status) return 3000
      return isActive(status) ? 5000 : false
    },
  })

  // Poll agent location every 8 seconds while job is active
  const { data: location } = useQuery<LocationUpdate | null>({
    queryKey: ['job', params.jobId, 'location'],
    queryFn:  async () => {
      const { data } = await api.get<LocationUpdate | null>(`/jobs/${params.jobId}/location`)
      return data
    },
    refetchInterval: (query) => {
      if (!job) return false
      const status = job.status
      return isActive(status) ? 8000 : false
    },
    enabled: !!job,
  })

  async function handleCancel() {
    try {
      await api.post(`/jobs/${params.jobId}/cancel`)
      setActiveJobId(null)
      refetch()
    } catch { /* ignore */ }
  }

  function getStepColor(step: JobStatus, current: JobStatus) {
    const stepIdx    = PROGRESS_STEPS.indexOf(step)
    const currentIdx = PROGRESS_STEPS.indexOf(current)
    if (stepIdx < currentIdx)  return Colors.success
    if (stepIdx === currentIdx) return Colors.accent
    return Colors.border
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </SafeAreaView>
    )
  }

  if (isError || !job) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Failed to load job</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const terminal = !isActive(job.status) && !job.status.startsWith('CANCELLED')

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Job Tracking</Text>
        </View>

        {/* Status badge */}
        <View style={[
          styles.statusBadge,
          job.status === 'COMPLETED' && styles.statusCompleted,
          job.status.startsWith('CANCELLED') && styles.statusCancelled,
        ]}>
          <Text style={[
            styles.statusText,
            job.status === 'COMPLETED' && { color: Colors.success },
            job.status.startsWith('CANCELLED') && { color: Colors.error },
          ]}>
            {STATUS_LABELS[job.status]}
          </Text>
        </View>

        {/* Agent W3W location — shown when GPS data is available */}
        {location?.w3w && (
          <View style={styles.w3wCard}>
            <Text style={styles.w3wLabel}>Agent location</Text>
            <Text style={styles.w3wAddress}>///{location.w3w}</Text>
            <Text style={styles.w3wUpdated}>
              Updated {new Date(location.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}

        {/* Progress steps */}
        {!job.status.startsWith('CANCELLED') && (
          <View style={styles.progressContainer}>
            {PROGRESS_STEPS.map((step, i) => (
              <View key={step} style={styles.progressRow}>
                <View style={[styles.dot, { backgroundColor: getStepColor(step, job.status) }]} />
                <Text style={[
                  styles.stepLabel,
                  step === job.status && { color: Colors.text, fontWeight: FontWeight.semibold },
                ]}>
                  {STATUS_LABELS[step]}
                </Text>
                {i < PROGRESS_STEPS.length - 1 && (
                  <View style={[
                    styles.connector,
                    { backgroundColor: PROGRESS_STEPS.indexOf(job.status) > i ? Colors.success : Colors.border },
                  ]} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Job details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Details</Text>
          <DetailRow label="Type"        value={job.serviceType} />
          <DetailRow label="Description" value={job.description} />
          <DetailRow label="Pickup"      value={`${job.pickupLocation.address}, ${job.pickupLocation.quarter}`} />
          {job.destinationLocation && (
            <DetailRow label="Destination" value={`${job.destinationLocation.address}, ${job.destinationLocation.quarter}`} />
          )}
          <DetailRow label="Price"    value={`${job.estimatedPrice.toLocaleString('fr-FR')} XAF`} />
          <DetailRow label="Payment"  value={job.paymentMethod.replace('_', ' ')} />
          {job.agent && <DetailRow label="Agent" value={`${job.agent.name} • ${job.agent.phone}`} />}
        </View>

        {/* Cancel button */}
        {(job.status === 'PENDING' || job.status === 'ACCEPTED') && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel Job</Text>
          </TouchableOpacity>
        )}

        {/* Done — return home */}
        {(terminal || job.status.startsWith('CANCELLED')) && (
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => {
              setActiveJobId(null)
              navigation.navigate('Home')
            }}
          >
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  scroll:     { padding: Spacing.lg },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
    marginBottom:  Spacing.lg,
  },
  backText: { color: Colors.accent, fontSize: FontSize.md },
  title:    { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  statusBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius:    Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  statusCompleted: { backgroundColor: Colors.successLight },
  statusCancelled: { backgroundColor: Colors.errorLight },
  statusText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.accent },

  w3wCard: {
    backgroundColor: Colors.surface,
    borderWidth:  1,
    borderColor:  Colors.primary,
    borderRadius: Radius.lg,
    padding:      Spacing.md,
    marginBottom: Spacing.lg,
  },
  w3wLabel:   { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  w3wAddress: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: 2 },
  w3wUpdated: { fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 2 },

  progressContainer: { marginBottom: Spacing.lg },
  progressRow: { flexDirection: 'row', alignItems: 'flex-start', paddingLeft: Spacing.xs },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 3, marginRight: Spacing.sm },
  connector: { position: 'absolute', left: 5, top: 15, width: 2, height: 24, backgroundColor: Colors.border },
  stepLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1, paddingBottom: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderWidth:     1,
    borderColor:     Colors.border,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    marginBottom:    Spacing.lg,
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  detailValue: { fontSize: FontSize.sm, color: Colors.text, flex: 2, textAlign: 'right' },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cancelText: { color: Colors.error, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  doneBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  doneBtnText: { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  errorText: { color: Colors.error, fontSize: FontSize.md, marginBottom: Spacing.md },
  retryBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  retryText: { color: Colors.textInverse, fontSize: FontSize.md },
})
