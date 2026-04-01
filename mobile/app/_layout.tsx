import React from 'react';
import { Stack } from 'expo-router';
import { AppDataProvider } from '@/context/AppDataContext';

export default function RootLayout() {
  return (
    <AppDataProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppDataProvider>
  );
}