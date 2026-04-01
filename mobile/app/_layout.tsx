import React from 'react';
import { Stack } from 'expo-router';
<<<<<<< HEAD
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '../../hooks/useColorScheme';
export const unstable_settings = {
  anchor: '(tabs)',
};
=======
import { AppDataProvider } from '@/context/AppDataContext';
>>>>>>> main

export default function RootLayout() {
  return (
    <AppDataProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppDataProvider>
  );
}