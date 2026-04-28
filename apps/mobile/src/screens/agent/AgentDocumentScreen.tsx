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

type Nav = StackNavigationProp<AgentOnboardingStackParamList, 'AgentDocument'>

const REQUIRED_DOCS = [
  { type: 'ID_FRONT',     label: 'National ID — Front',  hint: 'Clear photo of the front of your ID' },
  { type: 'ID_BACK',      label: 'National ID — Back',   hint: 'Clear photo of the back of your ID'  },
  { type: 'VEHICLE_PHOTO', label: 'Vehicle photo',        hint: 'Photo of your vehicle with plate visible' },
] as const

type DocType = typeof REQUIRED_DOCS[number]['type']

export default function AgentDocumentScreen() {
  const navigation = useNavigation<Nav>()

  const [urls,    setUrls]    = useState<Partial<Record<DocType, string>>>({})
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const allFilled = REQUIRED_DOCS.every((d) => urls[d.type]?.trim())

  async function handleSubmit() {
    if (!allFilled) { setError('Please fill in all document URLs'); return }
    setError(null)
    setLoading(true)
    try {
      for (const doc of REQUIRED_DOCS) {
        await api.post('/agents/me/documents', {
          type:     doc.type,
          fileUrl:  urls[doc.type]!.trim(),
          fileName: `${doc.type.toLowerCase()}.jpg`,
        })
      }
      navigation.navigate('AgentPending')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Upload failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Identity documents</Text>
        <Text style={styles.subtitle}>
          Paste the public URL of each document photo. Upload to Google Photos, Dropbox, or any public image host.
        </Text>

        {REQUIRED_DOCS.map((doc) => (
          <View key={doc.type} style={styles.docSection}>
            <Text style={styles.docLabel}>{doc.label}</Text>
            <Text style={styles.docHint}>{doc.hint}</Text>
            <TextInput
              style={[styles.input, urls[doc.type] ? styles.inputFilled : null]}
              value={urls[doc.type] ?? ''}
              onChangeText={(v) => setUrls((prev) => ({ ...prev, [doc.type]: v }))}
              placeholder="https://..."
              placeholderTextColor={Colors.textDisabled}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        ))}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, (!allFilled || loading) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!allFilled || loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={styles.buttonText}>Submit Documents</Text>
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
  subtitle:  { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xl, lineHeight: 22 },
  docSection: { marginBottom: Spacing.lg },
  docLabel:  { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: 2 },
  docHint:   { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.sm, color: Colors.text,
  },
  inputFilled: { borderColor: Colors.success },
  errorBox: {
    backgroundColor: Colors.errorLight, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: FontSize.sm },
  button: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2, alignItems: 'center', marginBottom: Spacing.xl,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: FontWeight.bold },
})
