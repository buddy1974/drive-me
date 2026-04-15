import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator }     from '@react-navigation/stack'
import { Text }                     from 'react-native'
import type { UserTabParamList, HomeStackParamList } from './types'
import HomeScreen        from '../screens/user/HomeScreen'
import PlaceOrderScreen  from '../screens/user/PlaceOrderScreen'
import JobTrackingScreen from '../screens/user/JobTrackingScreen'
import JobHistoryScreen  from '../screens/user/JobHistoryScreen'
import { Colors }        from '../constants/theme'

const Tab       = createBottomTabNavigator<UserTabParamList>()
const HomeStack = createStackNavigator<HomeStackParamList>()

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home"        component={HomeScreen} />
      <HomeStack.Screen name="PlaceOrder"  component={PlaceOrderScreen} />
      <HomeStack.Screen name="JobTracking" component={JobTrackingScreen} />
    </HomeStack.Navigator>
  )
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          borderTopColor: Colors.border,
          backgroundColor: Colors.surface,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={JobHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
    </Tab.Navigator>
  )
}
