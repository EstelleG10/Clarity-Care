import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import AppHeader from '@/components/AppHeader';

export default function HomeScreen() {
  const [hasConsent, setHasConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const doctorName = 'Dr. Gupta';
  const visitType = 'Annual Physical';

  const handleRecordPress = () => {
    if (!hasConsent) {
      Alert.alert(
        'Consent required',
        'You and your clinician must consent before recording.'
      );
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      Alert.alert('Recording stopped', 'Next step: generate transcript/summary.');
    } else {
      setIsRecording(true);
      Alert.alert('Recording started', 'The visit is now being recorded.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <AppHeader title={'Ready to Record'} />

        <View style={styles.bottomSection}>
          <Pressable
            style={styles.consentCard}
            onPress={() => setHasConsent(!hasConsent)}
          >
            <View style={styles.consentAccent} />
            <View style={styles.consentIconCircle}>
              <Text style={styles.consentIconText}>i</Text>
            </View>

            <View style={styles.consentTextContainer}>
              <Text style={styles.consentTitle}>Consent to Record</Text>
              <Text style={styles.consentDescription}>
                By recording, you agree to capture this appointment. Your
                clinician must also consent.
              </Text>
            </View>

            <View
              style={[
                styles.checkBox,
                !hasConsent && styles.checkBoxUnchecked,
              ]}
            >
              <Text style={styles.checkMark}>{hasConsent ? '✓' : ''}</Text>
            </View>
          </Pressable>

          <Text style={styles.sectionLabel}>Visit Details (optional)</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>DOCTOR</Text>
              <Text style={styles.detailValue}>{doctorName}</Text>
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>VISIT TYPE</Text>
              <Text style={styles.detailValue}>{visitType}</Text>
            </View>
          </View>

          <View style={styles.recordSection}>
            <Pressable
              style={styles.recordOuter}
              onPress={handleRecordPress}
            >
              <View
                style={[
                  styles.recordMiddle,
                  isRecording && styles.recordMiddleActive,
                ]}
              >
                <View
                  style={[
                    styles.recordInner,
                    isRecording && styles.recordInnerActive,
                  ]}
                >
                  <View
                    style={[
                      styles.recordDot,
                      isRecording && styles.recordDotActive,
                    ]}
                  />
                </View>
              </View>
            </Pressable>

            <Text style={styles.recordText}>
              {isRecording ? 'TAP TO STOP' : 'TAP TO RECORD'}
            </Text>
          </View>

          <Text style={styles.recentVisitsLabel}>RECENT VISITS</Text>

          <View style={styles.recentVisitCard}>
            <View style={styles.recentVisitIcon} />
            <View>
              <Text style={styles.recentVisitTitle}>Annual Physical</Text>
              <Text style={styles.recentVisitSubtitle}>Dr. Gupta • Feb 26</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#12325B',
  },
  scrollContent: {
    flexGrow: 1,
  },
  greeting: {
    color: '#B7C8DC',
    fontSize: 16,
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '700',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  consentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EDF3',
    position: 'relative',
    marginBottom: 24,
  },
  consentAccent: {
    position: 'absolute',
    left: 0,
    top: 18,
    bottom: 18,
    width: 4,
    backgroundColor: '#3BB6B0',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  consentIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E9F7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 12,
  },
  consentIconText: {
    color: '#3BB6B0',
    fontSize: 18,
    fontWeight: '700',
  },
  consentTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#163A63',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#5D6F82',
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#3BB6B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkBoxUnchecked: {
    backgroundColor: '#D9E2EC',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLabel: {
    color: '#7C8DA3',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 34,
  },
  detailBox: {
    flex: 1,
    backgroundColor: '#F3F6FA',
    borderRadius: 14,
    padding: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: '#A0AFC0',
    fontWeight: '700',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: '#5A6B7E',
    fontWeight: '600',
  },
  recordSection: {
    alignItems: 'center',
    marginBottom: 38,
  },
  recordOuter: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: '#FFF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordMiddle: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: '#FFE0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordMiddleActive: {
    backgroundColor: '#FFD2D2',
  },
  recordInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E92F2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInnerActive: {
    backgroundColor: '#C81E1E',
  },
  recordDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  recordDotActive: {
    borderRadius: 4,
  },
  recordText: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '700',
    color: '#76879B',
    letterSpacing: 1,
  },
  recentVisitsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C8DA3',
    marginBottom: 14,
    letterSpacing: 1,
  },
  recentVisitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBFD',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7EDF3',
  },
  recentVisitIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DDF6F4',
    marginRight: 12,
  },
  recentVisitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#163A63',
  },
  recentVisitSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#7C8DA3',
  },
});