import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import type { AuthStackParamList } from './types'
import RoleScreen   from '../screens/auth/RoleScreen'
import PhoneScreen  from '../screens/user/PhoneScreen'
import OtpScreen    from '../screens/user/OtpScreen'
import NameScreen   from '../screens/user/NameScreen'

const Stack = createStackNavigator<AuthStackParamList>()

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Role"  component={RoleScreen} />
      <Stack.Screen name="Phone" component={PhoneScreen} />
      <Stack.Screen name="Otp"   component={OtpScreen} />
      <Stack.Screen name="Name"  component={NameScreen} />
    </Stack.Navigator>
  )
}
