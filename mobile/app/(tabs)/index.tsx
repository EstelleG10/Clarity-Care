import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import AppHeader from '@/components/AppHeader';

const API_BASE = 'http://10.74.242.45:4000';

type SummaryKey = 'simple' | 'standard' | 'clinical';

export default function HomeScreen() {
  const [hasConsent, setHasConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const [transcript, setTranscript] = useState('');
  const [summaries, setSummaries] = useState<{
    simple: string;
    standard: string;
    clinical: string;
  } | null>(null);

  const [selectedSummary, setSelectedSummary] =
    useState<SummaryKey>('simple');

  const doctorName = 'Dr. Gupta';
  const visitType = 'Annual Physical';

  const currentSummaryText = useMemo(() => {
    if (!summaries) return '';
    return summaries[selectedSummary];
  }, [summaries, selectedSummary]);
const uploadAudioFile = async (
  fileUri: string,
  fileName: string,
  fileType?: string | null
) => {
  setIsGenerating(true);

  try {
    const formData = new FormData();
    formData.append('audio', {
      uri: fileUri,
      name: fileName,
      type: fileType || 'audio/mp4',
    } as any);

    const response = await fetch(`${API_BASE}/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', errorText);
      setIsGenerating(false);
      Alert.alert('Upload failed', errorText);
      return;
    }

    const data = await response.json();

    setTranscript(data.transcript);
    setSummaries(data.summaries);
    setSelectedSummary('simple');
    setIsGenerating(false);
  } catch (error) {
    console.error('Upload/generation error:', error);
    setIsGenerating(false);
    Alert.alert(
      'Error',
      'Something went wrong while uploading or generating the summary.'
    );
  }
};
const handleRecordPress = async () => {
  if (isGenerating) return;

  if (!hasConsent) {
    Alert.alert(
      'Consent required',
      'You and your clinician must consent before recording.'
    );
    return;
  }

  try {
    if (!isRecording) {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          'Microphone permission is required to record.'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      return;
    }

    if (!recording) {
      Alert.alert('Error', 'No recording found.');
      setIsRecording(false);
      return;
    }

    setIsRecording(false);

    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    setRecording(null);

    if (!uri) {
      Alert.alert('Error', 'Could not find the audio file.');
      return;
    }

    await uploadAudioFile(uri, 'visit.m4a', 'audio/mp4');
  } catch (error) {
    console.error('Recording error:', error);
    setIsGenerating(false);
    Alert.alert('Error', 'Something went wrong while recording.');
  }
};

  const handleUploadPress = async () => {
    if (isGenerating || isRecording) return;

    if (!hasConsent) {
      Alert.alert(
        'Consent required',
        'You and your clinician must consent before uploading audio.'
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      if (!file?.uri) {
        Alert.alert('Error', 'No file selected.');
        return;
      }

      const lowerName = (file.name || '').toLowerCase();
      const isSupported =
        lowerName.endsWith('.m4a') ||
        lowerName.endsWith('.mp3') ||
        lowerName.endsWith('.wav') ||
        lowerName.endsWith('.mp4') ||
        lowerName.endsWith('.mpeg') ||
        lowerName.endsWith('.mpga') ||
        lowerName.endsWith('.webm');

      if (!isSupported) {
        Alert.alert(
          'Unsupported file',
          'Please upload an m4a, mp3, wav, mp4, mpeg, mpga, or webm audio file.'
        );
        return;
      }

      await uploadAudioFile(
        file.uri,
        file.name || 'upload.m4a',
        file.mimeType || 'audio/m4a'
      );
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Could not pick the audio file.');
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
                By recording or uploading audio, you agree to capture this
                appointment. Your clinician must also consent.
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

          <Text style={styles.sectionLabel}>Visit Details</Text>

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
              style={[
                styles.recordOuter,
                isGenerating && styles.recordOuterDisabled,
              ]}
              onPress={handleRecordPress}
              disabled={isGenerating}
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
                  {isGenerating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View
                      style={[
                        styles.recordDot,
                        isRecording && styles.recordDotActive,
                      ]}
                    />
                  )}
                </View>
              </View>
            </Pressable>

            <Text style={styles.recordText}>
              {isGenerating
                ? 'GENERATING SUMMARY...'
                : isRecording
                ? 'TAP TO STOP'
                : 'TAP TO RECORD'}
            </Text>

            <Text style={styles.recordSubtext}>
              {isGenerating
                ? 'Please wait while we transcribe and create your summaries.'
                : isRecording
                ? 'Recording appointment audio now.'
                : 'Tap once to start and again to stop recording.'}
            </Text>
          </View>

          <Pressable
            style={[
              styles.uploadButton,
              (isGenerating || isRecording) && styles.uploadButtonDisabled,
            ]}
            onPress={handleUploadPress}
            disabled={isGenerating || isRecording}
          >
            <Text style={styles.uploadButtonText}>
              {isGenerating ? 'Generating...' : 'Upload Audio to Generate Summary'}
            </Text>
          </Pressable>

          <Text style={styles.uploadHint}>
            Best results: upload an m4a, mp3, wav, or mp4 audio file.
          </Text>

          {summaries && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeaderRow}>
                <Text style={styles.summaryTitle}>Visit Summary</Text>
                <Text style={styles.summaryBadge}>Ready</Text>
              </View>

              <Text style={styles.summarySectionTitle}>Choose version</Text>

              <View style={styles.segmentRow}>
                <Pressable
                  style={[
                    styles.segmentButton,
                    selectedSummary === 'simple' && styles.segmentButtonActive,
                  ]}
                  onPress={() => setSelectedSummary('simple')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selectedSummary === 'simple' && styles.segmentTextActive,
                    ]}
                  >
                    Simple
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.segmentButton,
                    selectedSummary === 'standard' &&
                      styles.segmentButtonActive,
                  ]}
                  onPress={() => setSelectedSummary('standard')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selectedSummary === 'standard' &&
                        styles.segmentTextActive,
                    ]}
                  >
                    Standard
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.segmentButton,
                    selectedSummary === 'clinical' &&
                      styles.segmentButtonActive,
                  ]}
                  onPress={() => setSelectedSummary('clinical')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selectedSummary === 'clinical' &&
                        styles.segmentTextActive,
                    ]}
                  >
                    Clinical
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.summarySectionTitle}>Summary</Text>
              <Text style={styles.summaryText}>{currentSummaryText}</Text>

              <Text style={styles.summarySectionTitle}>Transcript</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>
          )}

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
    marginBottom: 20,
  },
  recordOuter: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: '#FFF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordOuterDisabled: {
    opacity: 0.75,
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
    textAlign: 'center',
  },
  recordSubtext: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#7C8DA3',
    textAlign: 'center',
    maxWidth: 280,
  },
  uploadButton: {
    backgroundColor: '#12325B',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadHint: {
    textAlign: 'center',
    color: '#7C8DA3',
    fontSize: 13,
    marginBottom: 24,
  },
  summaryCard: {
    marginBottom: 28,
    backgroundColor: '#F8FBFD',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EDF3',
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#163A63',
  },
  summaryBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#13795B',
    backgroundColor: '#E7F8F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  summarySectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C8DA3',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentButton: {
    flex: 1,
    backgroundColor: '#EEF3F8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#12325B',
  },
  segmentText: {
    color: '#59708A',
    fontWeight: '600',
    fontSize: 14,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#2E4154',
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#5D6F82',
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