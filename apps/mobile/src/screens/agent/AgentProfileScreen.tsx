import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '../../services/api'
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme'
import type { AgentOnboardingStackParamList } from '../../navigation/types'

type Nav = StackNavigationProp<AgentOnboardingStackParamList, 'AgentProfile'>

const VEHICLE_TYPES = [
  { value: 'MOTORBIKE', label: '🏍️  Motorbike' },
  { value: 'CAR',       label: '🚗  Car'       },
  { value: 'ON_FOOT',   label: '🚶  On foot'   },
] as const

type VehicleType = typeof VEHICLE_TYPES[number]['value']

export default function AgentProfileScreen() {
  const navigation = useNavigation<Nav>()

  const [vehicleType,  setVehicleType]  = useState<VehicleType>('MOTORBIKE')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleMake,  setVehicleMake]  = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear,  setVehicleYear]  = useState('')
  const [momoPhone,    setMomoPhone]    = useState('+237')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  async function handleSave() {
    const year = parseInt(vehicleYear, 10)
    if (vehicleType !== 'ON_FOOT' && (!vehiclePlate.trim() || !vehicleMake.trim() || !vehicleModel.trim())) {
      setError('Please fill in all vehicle fields')
      return
    }
    if (isNaN(year) || year < 1990 || year > 2035) {
      setError('Enter a valid vehicle year')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await api.patch('/agents/me', {
        vehicleType,
        vehiclePlate: vehiclePlate.trim() || 'N/A',
        vehicleMake:  vehicleMake.trim()  || 'N/A',
        vehicleModel: vehicleModel.trim() || 'N/A',
        vehicleYear:  year,
        momoPhone:    momoPhone.trim() || null,
      })
      navigation.navigate('AgentDocument')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Failed to save. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Your vehicle</Text>
        <Text style={styles.subtitle}>This information is verified by our team before activation.</Text>

        <Text style={styles.label}>Vehicle type</Text>
        <View style={styles.typeRow}>
          {VEHICLE_TYPES.map((vt) => (
            <TouchableOpacity
              key={vt.value}
              style={[styles.typeChip, vehicleType === vt.value && styles.typeChipActive]}
              onPress={() => setVehicleType(vt.value)}
            >
              <Text style={[styles.typeChipText, vehicleType === vt.value && styles.typeChipTextActive]}>
                {vt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {vehicleType !== 'ON_FOOT' && (
          <>
            <Text style={styles.label}>Plate number</Text>
            <TextInput style={styles.input} value={vehiclePlate} onChangeText={setVehiclePlate}
              placeholder="LT 1234 A" placeholderTextColor={Colors.textDisabled} autoCapitalize="characters" />

            <Text style={styles.label}>Make</Text>
            <TextInput style={styles.input} value={vehicleMake} onChangeText={setVehicleMake}
              placeholder="e.g. Yamaha" placeholderTextColor={Colors.textDisabled} autoCapitalize="words" />

            <Text style={styles.label}>Model</Text>
            <TextInput style={styles.input} value={vehicleModel} onChangeText={setVehicleModel}
              placeholder="e.g. YBR125" placeholderTextColor={Colors.textDisabled} />

            <Text style={styles.label}>Year</Text>
            <TextInput style={styles.input} value={vehicleYear} onChangeText={setVehicleYear}
              placeholder="e.g. 2021" placeholderTextColor={Colors.textDisabled} keyboardType="number-pad" maxLength={4} />
          </>
        )}

        <Text style={styles.label}>MTN MoMo number for payouts</Text>
        <TextInput style={styles.input} value={momoPhone} onChangeText={setMomoPhone}
          placeholder="+237 6XX XXX XXX" placeholderTextColor={Colors.textDisabled} keyboardType="phone-pad" />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={styles.buttonText}>Continue →</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll:    { padding: Spacing.lg },
  title:     { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  subtitle:  { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
  label: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: Spacing.md, marginBottom: Spacing.xs,
  },
  typeRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xs },
  typeChip:  {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surface,
  },
  typeChipActive:     { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  typeChipText:       { fontSize: FontSize.sm, color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.accent, fontWeight: FontWeight.semibold },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.md, color: Colors.text,
  },
  errorBox: {
    backgroundColor: Colors.errorLight, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginTop: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: FontSize.sm },
  button: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2, alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.bold },
})
