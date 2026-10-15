/**
 * AtmosIQ - SQLite & Firebase Synchronization Flow Diagram
 * Explains local offline storage, queueing, deduplication, and Firestore cloud sync.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export function SyncFlowDiagram() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="sync-circle-outline" size={20} color={Palette.emeraldFresh} />
        <Text style={styles.headerTitle}>SQLite & Firebase Synchronization Architecture</Text>
      </View>
      <Text style={styles.headerDesc}>
        Dual-layer persistence guarantees uninterrupted offline usage while maintaining reliable eventual consistency with Firestore.
      </Text>

      {/* Diagram Flow Columns */}
      <View style={styles.flowContainer}>
        {/* Step 1: Local Writes */}
        <View style={styles.flowStep}>
          <View style={[styles.stepIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="save-outline" size={18} color={Palette.emeraldFresh} />
          </View>
          <Text style={styles.stepTitle}>1. Local SQLite Write</Text>
          <Text style={styles.stepDesc}>
            Incoming weather & XML records are persisted immediately to local SQLite using WAL mode and transactions.
          </Text>
        </View>

        <View style={styles.flowArrow}>
          <Ionicons name="arrow-down" size={16} color={Palette.textMutedDark} />
        </View>

        {/* Step 2: Sync Queue */}
        <View style={styles.flowStep}>
          <View style={[styles.stepIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="layers-outline" size={18} color={Palette.amberWarning} />
          </View>
          <Text style={styles.stepTitle}>2. Sync Queue Enqueue</Text>
          <Text style={styles.stepDesc}>
            Unsynchronized records enter the SQLite `sync_queue` table with status &apos;PENDING&apos; and retry counter = 0.
          </Text>
        </View>

        <View style={styles.flowArrow}>
          <Ionicons name="arrow-down" size={16} color={Palette.textMutedDark} />
        </View>

        {/* Step 3: Cloud Batch Sync */}
        <View style={styles.flowStep}>
          <View style={[styles.stepIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <Ionicons name="cloud-upload-outline" size={18} color={Palette.cyanGlow} />
          </View>
          <Text style={styles.stepTitle}>3. Batch Firestore Commit</Text>
          <Text style={styles.stepDesc}>
            Batch commits (up to 500 docs) use deterministic IDs (doc: `w_london_timestamp`) to deduplicate uploads.
          </Text>
        </View>

        <View style={styles.flowArrow}>
          <Ionicons name="arrow-down" size={16} color={Palette.textMutedDark} />
        </View>

        {/* Step 4: Status Resolution */}
        <View style={styles.flowStep}>
          <View style={[styles.stepIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="checkmark-done-circle-outline" size={18} color={Palette.indigoPulse} />
          </View>
          <Text style={styles.stepTitle}>4. Status Resolution</Text>
          <Text style={styles.stepDesc}>
            On Firestore acknowledgment, records transition to &apos;COMPLETED&apos;. On network failure, records retry with backoff.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    marginVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    ...Typography.titleSmall,
    color: Palette.textPrimaryDark,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  headerDesc: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  flowContainer: {
    backgroundColor: Palette.deepSlate,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  flowStep: {
    padding: Spacing.sm,
    backgroundColor: Palette.cardSurface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  stepIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    ...Typography.bodySmall,
    color: Palette.textPrimaryDark,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    ...Typography.caption,
    color: Palette.textSecondaryDark,
    lineHeight: 16,
  },
  flowArrow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
});
