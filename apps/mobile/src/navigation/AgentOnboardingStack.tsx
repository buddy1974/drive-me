import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import type { AgentOnboardingStackParamList } from './types'
import AgentOnboardingScreen from '../screens/agent/AgentOnboardingScreen'
import AgentProfileScreen    from '../screens/agent/AgentProfileScreen'
import AgentDocumentScreen   from '../screens/agent/AgentDocumentScreen'
import AgentPendingScreen    from '../screens/agent/AgentPendingScreen'

const Stack = createStackNavigator<AgentOnboardingStackParamList>()

export default function AgentOnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgentOnboarding" component={AgentOnboardingScreen} />
      <Stack.Screen name="AgentProfile"    component={AgentProfileScreen} />
      <Stack.Screen name="AgentDocument"   component={AgentDocumentScreen} />
      <Stack.Screen name="AgentPending"    component={AgentPendingScreen} />
    </Stack.Navigator>
  )
}
