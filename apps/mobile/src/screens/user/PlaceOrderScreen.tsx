import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useNavigation }   from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { SafeAreaView }    from 'react-native-safe-area-context'
import { api }             from '../../services/api'
import { useJobStore }     from '../../store/jobStore'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { HomeStackParamList } from '../../navigation/types'
import type { ServiceType, PaymentMethod, Job } from '../../types'

type Nav = StackNavigationProp<HomeStackParamList, 'PlaceOrder'>

const SERVICE_OPTIONS: { type: ServiceType; label: string; icon: string }[] = [
  { type: 'ERRAND',   label: 'Errand',   icon: '🛍️' },
  { type: 'PICKUP',   label: 'Pickup',   icon: '🚗' },
  { type: 'DELIVERY', label: 'Delivery', icon: '📦' },
]

const PAYMENT_OPTIONS: { method: PaymentMethod; label: string; color: string }[] = [
  { method: 'MTN_MOMO',      label: 'MTN MoMo',      color: Colors.mtn },
  { method: 'ORANGE_MONEY',  label: 'Orange Money',  color: Colors.orange },
  { method: 'CASH',          label: 'Cash',           color: Colors.success },
]

export default function PlaceOrderScreen() {
  const navigation = useNavigation<Nav>()
  const { addJobId, setActiveJobId } = useJobStore()

  const [serviceType,     setServiceType]     = useState<ServiceType>('ERRAND')
  const [description,     setDescription]     = useState('')
  const [pickupAddress,   setPickupAddress]   = useState('')
  const [pickupQuarter,   setPickupQuarter]   = useState('')
  const [destAddress,     setDestAddress]     = useState('')
  const [destQuarter,     setDestQuarter]     = useState('')
  const [paymentMethod,   setPaymentMethod]   = useState<PaymentMethod>('MTN_MOMO')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  async function handleSubmit() {
    if (!description.trim() || !pickupAddress.trim() || !pickupQuarter.trim()) {
      setError('Please fill in description and pickup location')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        serviceType,
        description:     description.trim(),
        paymentMethod,
        pickupLocation: {
          address: pickupAddress.trim(),
          quarter: pickupQuarter.trim(),
        },
      }
      if (destAddress.trim()) {
        body.destinationLocation = {
          address: destAddress.trim(),
          quarter: destQuarter.trim() || pickupQuarter.trim(),
        }
      }
      const { data } = await api.post<Job>('/jobs', body)
      addJobId(data.id)
      setActiveJobId(data.id)
      navigation.replace('JobTracking', { jobId: data.id })
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Failed to create job. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Place Order</Text>
        </View>

        {/* Service type */}
        <Text style={styles.label}>Service Type</Text>
        <View style={styles.row}>
          {SERVICE_OPTIONS.map((svc) => (
            <TouchableOpacity
              key={svc.type}
              style={[styles.chip, serviceType === svc.type && styles.chipActive]}
              onPress={() => setServiceType(svc.type)}
            >
              <Text style={styles.chipIcon}>{svc.icon}</Text>
              <Text style={[styles.chipText, serviceType === svc.type && styles.chipTextActive]}>
                {svc.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what you need done..."
          placeholderTextColor={Colors.textDisabled}
          multiline
          numberOfLines={3}
        />

        {/* Pickup */}
        <Text style={styles.label}>Pickup Location</Text>
        <TextInput
          style={styles.input}
          value={pickupAddress}
          onChangeText={setPickupAddress}
          placeholder="Street address"
          placeholderTextColor={Colors.textDisabled}
        />
        <TextInput
          style={[styles.input, { marginTop: Spacing.xs }]}
          value={pickupQuarter}
          onChangeText={setPickupQuarter}
          placeholder="Quarter / neighbourhood"
          placeholderTextColor={Colors.textDisabled}
        />

        {/* Destination (optional) */}
        <Text style={styles.label}>Destination <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.input}
          value={destAddress}
          onChangeText={setDestAddress}
          placeholder="Street address"
          placeholderTextColor={Colors.textDisabled}
        />
        <TextInput
          style={[styles.input, { marginTop: Spacing.xs }]}
          value={destQuarter}
          onChangeText={setDestQuarter}
          placeholder="Quarter / neighbourhood"
          placeholderTextColor={Colors.textDisabled}
        />

        {/* Payment */}
        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.row}>
          {PAYMENT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.method}
              style={[
                styles.payChip,
                paymentMethod === opt.method && { borderColor: opt.color, borderWidth: 2 },
              ]}
              onPress={() => setPaymentMethod(opt.method)}
            >
              <Text style={[
                styles.payChipText,
                paymentMethod === opt.method && { color: opt.color, fontWeight: FontWeight.bold },
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={styles.buttonText}>Request Agent</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll:    { padding: Spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  Spacing.lg,
    gap:           Spacing.md,
  },
  backText: { color: Colors.accent, fontSize: FontSize.md },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  label: {
    fontSize:     FontSize.sm,
    fontWeight:   FontWeight.semibold,
    color:        Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop:    Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optional: { fontWeight: FontWeight.regular, textTransform: 'none' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  textarea: { height: 80, textAlignVertical: 'top', paddingTop: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.xs,
    borderWidth:    1,
    borderColor:    Colors.border,
    borderRadius:   Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.xs,
    backgroundColor:   Colors.surface,
  },
  chipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  chipIcon: { fontSize: 16 },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.accent, fontWeight: FontWeight.semibold },
  payChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  payChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  errorText: { color: Colors.error, fontSize: FontSize.sm, marginTop: Spacing.md },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
})
