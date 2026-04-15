import React from 'react'
import { Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator }     from '@react-navigation/stack'
import type { AgentTabParamList, AgentJobsStackParamList } from './types'
import AgentHomeScreen  from '../screens/agent/AgentHomeScreen'
import JobDetailScreen  from '../screens/agent/JobDetailScreen'
import ActiveJobScreen  from '../screens/agent/ActiveJobScreen'
import EarningsScreen   from '../screens/agent/EarningsScreen'
import { Colors }       from '../constants/theme'

const Tab       = createBottomTabNavigator<AgentTabParamList>()
const JobsStack = createStackNavigator<AgentJobsStackParamList>()

function AgentJobsNavigator() {
  return (
    <JobsStack.Navigator screenOptions={{ headerShown: false }}>
      <JobsStack.Screen name="AgentHome" component={AgentHomeScreen} />
      <JobsStack.Screen name="JobDetail" component={JobDetailScreen} />
      <JobsStack.Screen name="ActiveJob" component={ActiveJobScreen} />
    </JobsStack.Navigator>
  )
}

export default function AgentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          borderTopColor:  Colors.border,
          backgroundColor: Colors.surface,
        },
      }}
    >
      <Tab.Screen
        name="JobsTab"
        component={AgentJobsNavigator}
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={EarningsScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💰</Text>,
        }}
      />
    </Tab.Navigator>
  )
}
