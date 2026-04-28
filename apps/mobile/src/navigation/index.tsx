import React, { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useAuthStore } from '../store/authStore'
import AuthStack            from './AuthStack'
import MainTabs             from './MainTabs'
import AgentTabs            from './AgentTabs'
import AgentOnboardingStack from './AgentOnboardingStack'
import { Colors } from '../constants/theme'

export default function RootNavigator() {
  const { actor, agent, isHydrated, isLoading, hydrate } = useAuthStore()

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

  if (actor === 'user') return <MainTabs />
  if (actor === 'agent') {
    if (agent?.status === 'PENDING_VERIFICATION') return <AgentOnboardingStack />
    return <AgentTabs />
  }
  return <AuthStack />
}
