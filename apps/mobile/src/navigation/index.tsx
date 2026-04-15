import React, { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useAuthStore } from '../store/authStore'
import AuthStack  from './AuthStack'
import MainTabs   from './MainTabs'
import AgentTabs  from './AgentTabs'
import { Colors } from '../constants/theme'

export default function RootNavigator() {
  const { actor, isHydrated, isLoading, hydrate } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!isHydrated || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    )
  }

  if (actor === 'user')  return <MainTabs />
  if (actor === 'agent') return <AgentTabs />
  return <AuthStack />
}
