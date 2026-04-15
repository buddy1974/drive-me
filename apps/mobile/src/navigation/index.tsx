import React, { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useAuthStore } from '../store/authStore'
import AuthStack from './AuthStack'
import MainTabs  from './MainTabs'
import { Colors } from '../constants/theme'

export default function RootNavigator() {
  const { user, isHydrated, isLoading, hydrate } = useAuthStore()

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

  return user ? <MainTabs /> : <AuthStack />
}
