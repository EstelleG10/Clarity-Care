import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AppHeader from '@/components/AppHeader';

const visits = [
  {
    id: 1,
    title: 'Annual Physical',
    doctor: 'Dr. Gupta',
    date: 'Feb 26',
  },
  {
    id: 2,
    title: 'Sore Throat Visit',
    doctor: 'Dr. Chen',
    date: 'Mar 10',
  },
];

export default function VisitsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      
      <AppHeader title={'My Visits'} />

      <ScrollView contentContainerStyle={styles.container}>
        {visits.map((visit) => (
          <Pressable
            key={visit.id}
            style={styles.card}
            onPress={() => router.push('/visit-summary')}
          >
            <Text style={styles.cardTitle}>{visit.title}</Text>
            <Text style={styles.cardSub}>
              {visit.doctor} • {visit.date}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#12325B',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '700',
  },
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7EDF3',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#163A63',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#7C8DA3',
  },
});