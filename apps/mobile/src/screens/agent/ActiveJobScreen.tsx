import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useRoute, useNavigation }  from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp }           from '@react-navigation/native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SafeAreaView }             from 'react-native-safe-area-context'
import { api }                      from '../../services/api'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { AgentJobsStackParamList } from '../../navigation/types'
import type { Job, JobStatus }          from '../../types'

type Nav   = StackNavigationProp<AgentJobsStackParamList, 'ActiveJob'>
type Route = RouteProp<AgentJobsStackParamList, 'ActiveJob'>

const NEXT_STATUS: Partial<Record<JobStatus, { status: JobStatus; label: string; color: string }>> = {
  ACCEPTED:               { status: 'EN_ROUTE_TO_PICKUP',     label: 'Start — En Route',        color: Colors.accent },
  EN_ROUTE_TO_PICKUP:     { status: 'ARRIVED_AT_PICKUP',      label: 'Arrived at Pickup',       color: Colors.accent },
  ARRIVED_AT_PICKUP:      { status: 'IN_PROGRESS',            label: 'Start Job',               color: Colors.accent },
  IN_PROGRESS:            { status: 'ARRIVED_AT_DESTINATION', label: 'Arrived at Destination',  color: Colors.accent },
  ARRIVED_AT_DESTINATION: { status: 'COMPLETED',              label: 'Mark as Completed',       color: Colors.success },
}

const STATUS_DISPLAY: Record<string, string> = {
  ACCEPTED:               'Accepted',
  EN_ROUTE_TO_PICKUP:     'En Route to Pickup',
  ARRIVED_AT_PICKUP:      'At Pickup Location',
  IN_PROGRESS:            'Job in Progress',
  ARRIVED_AT_DESTINATION: 'At Destination',
  COMPLETED:              'Completed ✓',
}

export default function ActiveJobScreen() {
  const navigation  = useNavigation<Nav>()
  const { params }  = useRoute<Route>()
  const queryClient = useQueryClient()
  const [updating, setUpdating] = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const { data: job, isLoading, isError } = useQuery<Job>({
    queryKey:        ['job', params.jobId],
    queryFn:         async () => {
      const { data } = await api.get<Job>(`/jobs/${params.jobId}`)
      return data
    },
    refetchInterval: (query) => {
      const s = query.state.data?.status
      return s === 'COMPLETED' || s?.startsWith('CANCELLED') ? false : 5000
    },
  })

  async function handleUpdateStatus() {
    if (!job) return
    const next = NEXT_STATUS[job.status]
    if (!next) return
    setError(null)
    setUpdating(true)
    try {
      await api.patch(`/jobs/${params.jobId}/status`, { status: next.status })
      await queryClient.invalidateQueries({ queryKey: ['job', params.jobId] })
      if (next.status === 'COMPLETED') {
        await queryClient.invalidateQueries({ queryKey: ['agent', 'earnings'] })
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Status update failed')
    } finally {
      setUpdating(false)
    }
  }

  async function handleCancel() {
    setError(null)
    setUpdating(true)
    try {
      await api.post(`/jobs/${params.jobId}/cancel`, { reason: 'Agent cancelled' })
      await queryClient.invalidateQueries({ queryKey: ['jobs', 'available'] })
      navigation.navigate('AgentHome')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Cancel failed')
    } finally {
      setUpdating(false)
    }
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const nextAction = NEXT_STATUS[job.status]
  const isCompleted = job.status === 'COMPLETED'
  const isCancelled = job.status.startsWith('CANCELLED')

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Active Job</Text>

        {/* Current status */}
        <View style={[styles.statusCard, isCompleted && styles.statusCardDone]}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={[styles.statusText, isCompleted && { color: Colors.success }]}>
            {STATUS_DISPLAY[job.status] ?? job.status}
          </Text>
        </View>

        {/* Customer + location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer</Text>
          <Text style={styles.name}>{job.user.name}</Text>
          <Text style={styles.phone}>{job.user.phone}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pickup</Text>
          <Text style={styles.address}>{job.pickupLocation.address}</Text>
          <Text style={styles.quarter}>{job.pickupLocation.quarter}</Text>
          {job.pickupLocation.landmark && <Text style={styles.landmark}>{job.pickupLocation.landmark}</Text>}
        </View>

        {job.destinationLocation && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Destination</Text>
            <Text style={styles.address}>{job.destinationLocation.address}</Text>
            <Text style={styles.quarter}>{job.destinationLocation.quarter}</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{job.description}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{job.paymentMethod.replace('_', ' ')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.detailLabel}>Your earnings</Text>
            <Text style={[styles.detailValue, { color: Colors.success, fontWeight: FontWeight.bold }]}>
              {(job.estimatedPrice * (1 - job.commissionRate)).toLocaleString('fr-FR')} XAF
            </Text>
          </View>
        </View>

        {error && <Text style={styles.errorTextInline}>{error}</Text>}

        {/* Action buttons */}
        {nextAction && !isCompleted && !isCancelled && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: nextAction.color }, updating && styles.btnDisabled]}
            onPress={handleUpdateStatus}
            disabled={updating}
          >
            {updating
              ? <ActivityIndicator color={Colors.textInverse} />
              : <Text style={styles.actionBtnText}>{nextAction.label}</Text>
            }
          </TouchableOpacity>
        )}

        {job.status === 'ACCEPTED' && (
          <TouchableOpacity
            style={[styles.cancelBtn, updating && styles.btnDisabled]}
            onPress={handleCancel}
            disabled={updating}
          >
            <Text style={styles.cancelBtnText}>Cancel Job</Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('AgentHome')}
          >
            <Text style={styles.doneBtnText}>Back to Jobs ✓</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll:    { padding: Spacing.lg },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  title:     { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.lg },
  statusCard: {
    backgroundColor: Colors.accentLight,
    borderWidth:  1,
    borderColor:  Colors.accent,
    borderRadius: Radius.lg,
    padding:      Spacing.md,
    marginBottom: Spacing.md,
  },
  statusCardDone: { backgroundColor: Colors.successLight, borderColor: Colors.success },
  statusLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusText:  { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.accent, marginTop: 2 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth:  1,
    borderColor:  Colors.border,
    borderRadius: Radius.lg,
    padding:      Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  name:      { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  phone:     { fontSize: FontSize.sm, color: Colors.textSecondary },
  address:   { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  quarter:   { fontSize: FontSize.sm, color: Colors.textSecondary },
  landmark:  { fontSize: FontSize.sm, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  detailValue: { fontSize: FontSize.sm, color: Colors.text, flex: 2, textAlign: 'right' },
  actionBtn: {
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    alignItems:      'center',
    marginBottom:    Spacing.sm,
  },
  actionBtnText: { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  cancelBtn: {
    borderWidth:     1,
    borderColor:     Colors.error,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    alignItems:      'center',
    marginBottom:    Spacing.sm,
  },
  cancelBtnText: { color: Colors.error, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  doneBtn: {
    backgroundColor: Colors.success,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    alignItems:      'center',
    marginBottom:    Spacing.xl,
  },
  doneBtnText:        { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  btnDisabled:        { opacity: 0.6 },
  errorTextInline:    { color: Colors.error, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  backText:           { color: Colors.accent, fontSize: FontSize.md, marginTop: Spacing.sm },
  errorText:          { color: Colors.error, fontSize: FontSize.md },
})
