import { Colors } from '@/constants/Colors';
import { useThemePreference } from '@/hooks/useThemePreference';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, StatusBar } from 'react-native';

const DOCK_WIDTH_PERCENTAGE = 1; // Set to 1 for full width
const DOCK_MAX_WIDTH = Dimensions.get('window').width; // Ensure it can go full width

export default function TabLayout() {
  const { colorScheme } = useThemePreference();
  const colors = Colors[colorScheme as keyof typeof Colors] || Colors.dark;
  
  // Get the screen width dynamically to handle orientation changes
  const { width } = Dimensions.get('window');
  // Calculate dock width
  const DOCK_WIDTH = Math.min(width * DOCK_WIDTH_PERCENTAGE, DOCK_MAX_WIDTH);

  return (
    <>
      <StatusBar 
        barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} 
        backgroundColor={colorScheme === 'light' ? '#FFFFFF' : '#000000'} 
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: 85,
            backgroundColor: colorScheme === 'light' ? 'rgba(245, 245, 245, 0.95)' : 'rgba(20, 20, 20, 0.95)', 
            borderTopWidth: 0.5,
            borderTopColor: colorScheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            elevation: 0,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colorScheme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
          tabBarItemStyle: {
            height: 85,
            padding: 0,
            margin: 0,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="navigation"
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <Ionicons name="navigate" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="timelapse"
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <Ionicons name="time" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-outline" size={26} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
