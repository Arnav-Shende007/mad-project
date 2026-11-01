/**
 * AtmosIQ - Bottom Tabs Navigation Layout
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Typography } from '@/constants/theme';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isWide = useWideLayout();
  const bottomPadding = Math.max(insets.bottom, 10);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Palette.spaceNavy,
          borderTopColor: Palette.cardBorder,
          borderTopWidth: 1,
          height: 62 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 10,
        },
        tabBarItemStyle: { borderRadius: 16, marginHorizontal: isWide ? 6 : 4 },
        tabBarActiveBackgroundColor: Palette.accentSoft,
        tabBarLabelPosition: 'below-icon',
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Palette.cyanGlow,
        tabBarInactiveTintColor: Palette.textMutedDark,
        tabBarLabelStyle: {
          ...Typography.caption,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloudy-night-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="forecast"
        options={{
          title: 'Forecast',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="xml-explorer"
        options={{
          title: 'XML Data',
          href: isWide ? '/xml-explorer' : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="code-download-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Local DB',
          href: isWide ? '/history' : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="server-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cloud-sync"
        options={{
          title: 'Cloud Sync',
          href: isWide ? '/cloud-sync' : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloud-upload-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: isWide ? 'Settings' : 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
