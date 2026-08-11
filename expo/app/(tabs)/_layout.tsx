import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Crown, User } from 'lucide-react-native';
import { View } from 'react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function TabLayout() {
  const { t } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height: 76,
          paddingTop: 9,
          paddingBottom: 11,
          backgroundColor: '#071710',
          borderTopColor: Colors.chromeEdge,
          borderTopWidth: 1,
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.28,
          shadowRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700' as const,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused, size }) => (
            <View style={focused ? { backgroundColor: Colors.accentMuted, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 } : undefined}>
              <Home size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: t('premium'),
          tabBarIcon: ({ color, focused, size }) => (
            <View style={focused ? { backgroundColor: Colors.accentMuted, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 } : undefined}>
              <Crown size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, focused, size }) => (
            <View style={focused ? { backgroundColor: Colors.accentMuted, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 } : undefined}>
              <User size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
