import React from 'react';
import { Pressable, StyleSheet, Text, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { useAppData } from '@/context/AppDataContext';

export default function VisitsScreen() {
  const { visits, defaultSummaryLevel } = useAppData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={'My Visits'} />

      <ScrollView contentContainerStyle={styles.container}>
        {visits.map((visit) => {
          const summaryPreview =
            defaultSummaryLevel === 'Simple'
              ? visit.summaries.simple
              : defaultSummaryLevel === 'Standard'
                ? visit.summaries.standard
                : visit.summaries.clinical;

          return (
            <Pressable
              key={visit.id}
              style={styles.card}
              onPress={() => router.push('/visit-summary')}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{visit.title}</Text>
                <Text style={styles.dateBadge}>{visit.date}</Text>
              </View>

              <Text style={styles.cardSub}>
                {visit.doctor} • {visit.date}
              </Text>

              <Text style={styles.previewLabel}>
                {defaultSummaryLevel} Summary
              </Text>
              <Text style={styles.previewText} numberOfLines={3}>
                {summaryPreview}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#12325B',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#163A63',
    marginBottom: 4,
  },
  dateBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#12325B',
    backgroundColor: '#EEF3F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cardSub: {
    fontSize: 14,
    color: '#7C8DA3',
    marginBottom: 10,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C8DA3',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#425466',
  },
});