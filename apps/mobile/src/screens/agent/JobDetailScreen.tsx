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
import type { Job }                     from '../../types'

type Nav   = StackNavigationProp<AgentJobsStackParamList, 'JobDetail'>
type Route = RouteProp<AgentJobsStackParamList, 'JobDetail'>

export default function JobDetailScreen() {
  const navigation   = useNavigation<Nav>()
  const { params }   = useRoute<Route>()
  const queryClient  = useQueryClient()
  const [accepting, setAccepting] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const { data: job, isLoading, isError } = useQuery<Job>({
    queryKey: ['job', params.jobId],
    queryFn:  async () => {
      const { data } = await api.get<Job>(`/jobs/${params.jobId}`)
      return data
    },
  })

  async function handleAccept() {
    setError(null)
    setAccepting(true)
    try {
      await api.patch(`/jobs/${params.jobId}/accept`)
      await queryClient.invalidateQueries({ queryKey: ['jobs', 'available'] })
      navigation.replace('ActiveJob', { jobId: params.jobId })
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Failed to accept job')
    } finally {
      setAccepting(false)
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const price = job.estimatedPrice.toLocaleString('fr-FR')
  const agentEarns = (job.estimatedPrice * (1 - job.commissionRate)).toLocaleString('fr-FR')

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Job Details</Text>
        </View>

        {/* Earnings highlight */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Your earnings</Text>
          <Text style={styles.earningsAmount}>{agentEarns} XAF</Text>
          <Text style={styles.earningsSub}>from {price} XAF total (15% commission)</Text>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <DetailRow label="Service"     value={job.serviceType} />
          <DetailRow label="Description" value={job.description} />
          <DetailRow label="Payment"     value={job.paymentMethod.replace('_', ' ')} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pickup</Text>
          <Text style={styles.locationAddress}>{job.pickupLocation.address}</Text>
          <Text style={styles.locationQuarter}>{job.pickupLocation.quarter}</Text>
          {job.pickupLocation.landmark && (
            <Text style={styles.landmark}>Landmark: {job.pickupLocation.landmark}</Text>
          )}
        </View>

        {job.destinationLocation && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Destination</Text>
            <Text style={styles.locationAddress}>{job.destinationLocation.address}</Text>
            <Text style={styles.locationQuarter}>{job.destinationLocation.quarter}</Text>
          </View>
        )}

        {/* Customer info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer</Text>
          <DetailRow label="Name"  value={job.user.name} />
          <DetailRow label="Phone" value={job.user.phone} />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {job.status === 'PENDING' && (
          <TouchableOpacity
            style={[styles.acceptBtn, accepting && styles.btnDisabled]}
            onPress={handleAccept}
            disabled={accepting}
          >
            {accepting
              ? <ActivityIndicator color={Colors.textInverse} />
              : <Text style={styles.acceptBtnText}>Accept Job</Text>
            }
          </TouchableOpacity>
        )}

        {job.status !== 'PENDING' && (
          <View style={styles.takenBanner}>
            <Text style={styles.takenText}>This job is no longer available</Text>
          </View>
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
  container: { flex: 1, backgroundColor: Colors.background },
  scroll:    { padding: Spacing.lg },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
    marginBottom:  Spacing.lg,
  },
  backText: { color: Colors.accent, fontSize: FontSize.md },
  title:    { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  earningsCard: {
    backgroundColor: Colors.successLight,
    borderWidth:  1,
    borderColor:  Colors.success,
    borderRadius: Radius.lg,
    padding:      Spacing.lg,
    alignItems:   'center',
    marginBottom: Spacing.lg,
  },
  earningsLabel:  { fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.semibold },
  earningsAmount: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.success },
  earningsSub:    { fontSize: FontSize.xs, color: Colors.success, marginTop: 2 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth:  1,
    borderColor:  Colors.border,
    borderRadius: Radius.lg,
    padding:      Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.xs, textTransform: 'uppercase' },
  locationAddress: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.semibold },
  locationQuarter: { fontSize: FontSize.sm, color: Colors.textSecondary },
  landmark:        { fontSize: FontSize.sm, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  detailRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  detailValue: { fontSize: FontSize.sm, color: Colors.text, flex: 2, textAlign: 'right' },
  acceptBtn: {
    backgroundColor: Colors.success,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    alignItems:      'center',
    marginTop:       Spacing.md,
    marginBottom:    Spacing.xl,
  },
  btnDisabled:     { opacity: 0.6 },
  acceptBtnText:   { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  takenBanner: {
    backgroundColor: Colors.warningLight,
    borderRadius:    Radius.md,
    padding:         Spacing.md,
    alignItems:      'center',
    marginTop:       Spacing.md,
  },
  takenText:  { color: Colors.warning, fontWeight: FontWeight.semibold },
  errorText:  { color: Colors.error, fontSize: FontSize.sm, marginTop: Spacing.md },
  backBtn:    { marginTop: Spacing.md },
  backBtnText:{ color: Colors.accent, fontSize: FontSize.md },
})
