import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppData } from '@/context/AppDataContext';

const API_BASE = 'http://10.66.167.123:4000';

type SummaryMode = 'Simple' | 'Standard' | 'Clinical';

export default function VisitSummaryScreen() {
  const { visitId } = useLocalSearchParams<{ visitId?: string }>();
  const { visits } = useAppData();

  const visit = visits.find((item) => item.id === visitId) || visits[0];

  const [selectedMode, setSelectedMode] = useState<SummaryMode>('Standard');
  const [language, setLanguage] = useState('Spanish');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const summaryContent = useMemo(() => {
    if (!visit) {
      return {
        overview: 'No visit summary available yet.',
        medicationsAndTests: [] as string[],
        actionItems: [] as string[],
        followUp: 'No follow-up plan available.',
      };
    }

    const modeSummary =
      selectedMode === 'Simple'
        ? visit.summaries.simple
        : selectedMode === 'Standard'
          ? visit.summaries.standard
          : visit.summaries.clinical;

    return {
      overview: modeSummary,
      medicationsAndTests: [
        'Review transcript for medications, tests, or procedures discussed.',
      ],
      actionItems: [
        'Review the summary carefully.',
        'Follow any instructions given during the visit.',
        'Contact your clinician if anything is unclear.',
      ],
      followUp:
        'Use the transcript and visit summary to confirm next steps and follow-up plans.',
    };
  }, [visit, selectedMode]);

  const handleTranslate = async () => {
    try {
      setIsTranslating(true);
      setTranslatedText('');

      const response = await fetch(`${API_BASE}/translate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetLanguage: language,
          selectedMode,
          overview: summaryContent.overview,
          medicationsAndTests: summaryContent.medicationsAndTests,
          actionItems: summaryContent.actionItems,
          followUp: summaryContent.followUp,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Translate failed:', errorText);
        setTranslatedText(`Translation failed: ${errorText}`);
        setIsTranslating(false);
        return;
      }

      const data = await response.json();

      const formattedTranslation = `
${selectedMode} Summary

Visit Overview:
${data.overview}

Medications / Tests or Procedures Ordered:
${Array.isArray(data.medicationsAndTests) ? data.medicationsAndTests.join('\n') : ''}

Action Items / Instructions:
${Array.isArray(data.actionItems) ? data.actionItems.join('\n') : ''}

Follow-up Plan:
${data.followUp}
      `.trim();

      setTranslatedText(formattedTranslation);
      setIsTranslating(false);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Translation failed. Please try again.');
      setIsTranslating(false);
    }
  };

  if (!visit) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Visit Found</Text>
          <Text style={styles.emptyText}>
            Generate a visit summary from audio first.
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        bounces
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Visits</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Visit Summary</Text>

          <View style={styles.shareButton}>
            <Text style={styles.shareIcon}>⇪</Text>
          </View>
        </View>

        <View style={styles.visitHeader}>
          <View style={styles.calendarIcon}>
            <Text style={styles.calendarIconText}>⌂</Text>
          </View>

          <View style={styles.visitHeaderText}>
            <Text style={styles.visitTitle}>{visit.title}</Text>
            <Text style={styles.visitMeta}>
              {visit.doctor} · {visit.date}
            </Text>
          </View>
        </View>

        <View style={styles.segmentRow}>
          {(['Simple', 'Standard', 'Clinical'] as SummaryMode[]).map((mode) => {
            const isActive = selectedMode === mode;
            return (
              <Pressable
                key={mode}
                style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                onPress={() => {
                  setSelectedMode(mode);
                  setTranslatedText('');
                }}
              >
                <Text
                  style={[styles.segmentText, isActive && styles.segmentTextActive]}
                >
                  {mode}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />

        <SectionTitle title="VISIT OVERVIEW" dotColor="#26B3A8" />
        <Text style={styles.paragraph}>{summaryContent.overview}</Text>

        <SectionTitle
          title="MEDICATIONS / TESTS OR PROCEDURES ORDERED"
          dotColor="#F1A51E"
        />
        <View style={styles.listContainer}>
          {summaryContent.medicationsAndTests.map((item, index) => (
            <View key={index} style={styles.medTag}>
              <Text style={styles.medDot}>•</Text>
              <Text style={styles.medTagText}>{item}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="ACTION ITEMS / INSTRUCTIONS" dotColor="#26B3A8" />
        <View style={styles.listContainer}>
          {summaryContent.actionItems.map((item, index) => (
            <View key={index} style={styles.actionRow}>
              <View style={styles.actionCircle}>
                <Text style={styles.actionCheck}>{index === 0 ? '✓' : ''}</Text>
              </View>
              <Text style={styles.actionText}>{item}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="FOLLOW-UP PLAN" dotColor="#26B3A8" />
        <Text style={styles.paragraph}>{summaryContent.followUp}</Text>

        <SectionTitle title="FULL TRANSCRIPT" dotColor="#123C73" />
        <Text style={styles.paragraph}>{visit.transcript}</Text>

        <View style={styles.translationCard}>
          <Text style={styles.translationTitle}>
            Translate This {selectedMode} Version
          </Text>
          <Text style={styles.translationSubtitle}>
            Translation will apply to the summary version currently selected above.
          </Text>

          <Text style={styles.inputLabel}>Target language</Text>
          <TextInput
            value={language}
            onChangeText={setLanguage}
            placeholder="Enter language"
            style={styles.input}
          />

          <Pressable style={styles.translateButton} onPress={handleTranslate}>
            <Text style={styles.translateButtonText}>
              {isTranslating ? 'Translating...' : `Translate ${selectedMode} Summary`}
            </Text>
          </Pressable>

          <Text style={styles.inputLabel}>Translated output</Text>
          <Text style={styles.translatedOutput}>
            {translatedText || 'No translation yet.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
  dotColor,
}: {
  title: string;
  dotColor: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: dotColor }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 140,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: {
    color: '#55B7B1',
    fontSize: 16,
    fontWeight: '600',
    width: 70,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#304766',
  },
  shareButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    color: '#55B7B1',
    fontSize: 18,
    fontWeight: '700',
    width: 70,
    textAlign: 'right',
  },
  visitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  calendarIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#123C73',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  calendarIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  visitHeaderText: {
    flex: 1,
  },
  visitTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#163A63',
    marginBottom: 2,
  },
  visitMeta: {
    fontSize: 14,
    color: '#A0AFC0',
    fontWeight: '500',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  segmentButton: {
    flex: 1,
    backgroundColor: '#EFF3F7',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#123C73',
  },
  segmentText: {
    color: '#7B8CA2',
    fontSize: 16,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6ECF2',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 6,
  },
  sectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7D8FA5',
    letterSpacing: 0.8,
  },
  paragraph: {
    paddingHorizontal: 20,
    fontSize: 18,
    lineHeight: 32,
    color: '#23405F',
    marginBottom: 34,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    marginBottom: 34,
  },
  medTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#F3D79A',
    backgroundColor: '#FFF9EC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    maxWidth: '100%',
  },
  medDot: {
    color: '#F1A51E',
    fontSize: 20,
    marginRight: 8,
    lineHeight: 20,
  },
  medTagText: {
    color: '#47607D',
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  actionCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#55B7B1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  actionCheck: {
    color: '#55B7B1',
    fontSize: 14,
    fontWeight: '700',
  },
  actionText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 28,
    color: '#23405F',
    fontWeight: '500',
  },
  translationCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#F7F9FC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EDF3',
  },
  translationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#163A63',
    marginBottom: 6,
  },
  translationSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6F8297',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#163A63',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7DEE7',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  translateButton: {
    backgroundColor: '#12325B',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  translateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  translatedOutput: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
  },
  emptyState: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#163A63',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#6F8297',
    textAlign: 'center',
    marginBottom: 18,
  },
  backButton: {
    backgroundColor: '#12325B',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});