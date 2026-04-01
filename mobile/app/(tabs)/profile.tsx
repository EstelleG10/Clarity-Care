import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable } from 'react-native';

type SummaryLevel = 'Simple' | 'Standard' | 'Clinical';

export default function ProfileScreen() {
  const [defaultSummaryLevel, setDefaultSummaryLevel] =
    useState<SummaryLevel>('Simple');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>

          <View>
            <Text style={styles.name}>Sarah Johnson</Text>
            <Text style={styles.email}>sarah.johnson@email.com</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Preferred Language</Text>
          <Text style={styles.settingValue}>English</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.settingLabel}>Default Summary Level</Text>

          <View style={styles.optionRow}>
            {(['Simple', 'Standard', 'Clinical'] as SummaryLevel[]).map(
              (level) => (
                <Pressable
                  key={level}
                  onPress={() => setDefaultSummaryLevel(level)}
                  style={[
                    styles.optionButton,
                    defaultSummaryLevel === level && styles.optionButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      defaultSummaryLevel === level && styles.optionTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              )
            )}
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </View>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </Pressable>

        <Pressable style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#163A63',
    marginTop: 20,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E7EDF3',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3BB6B0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#163A63',
  },
  email: {
    fontSize: 14,
    color: '#6B7A90',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7A90',
    marginBottom: 10,
  },
  settingRow: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E7EDF3',
  },
  settingLabel: {
    fontSize: 15,
    color: '#425466',
  },
  settingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#163A63',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E7EDF3',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F6FA',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#12325B',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6B7E',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  currentSelection: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7A90',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#12325B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EDF3',
  },
  logoutText: {
    color: '#7C8DA3',
    fontWeight: '600',
    fontSize: 15,
  },
});