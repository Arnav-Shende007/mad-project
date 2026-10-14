/**
 * AtmosIQ - System Architecture & Data Flow Diagram Component
 * Visualizes the complete data pipeline: REST APIs -> XML/JSON Parsing -> SQLite -> Firebase -> Analytics -> UI
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

interface PipelineStep {
  id: string;
  stageNumber: number;
  title: string;
  tech: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
  details: string[];
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'rest_apis',
    stageNumber: 1,
    title: 'Data Sources & REST APIs',
    tech: 'Open-Meteo & MET Norway & NOAA',
    icon: 'cloud-download-outline',
    color: Palette.cyanGlow,
    description: 'Retrieves multi-source meteorological observations via standard HTTP GET.',
    details: [
      'Open-Meteo: Geocoding, Current, 48h Hourly, 7-Day Daily Forecasts, Air Quality (JSON)',
      'MET Norway: Official Nordic WMO-compliant XML Forecast REST API (XML)',
      'NOAA NWS: Real-time Active Severe Weather Alerts Feed (Atom XML)',
    ],
  },
  {
    id: 'parsing_validation',
    stageNumber: 2,
    title: 'Response Validation & Parsing',
    tech: 'fast-xml-parser & HTTP Header Inspection',
    icon: 'code-slash-outline',
    color: Palette.azureBlue,
    description: 'Validates genuine XML/JSON response formats and inspects HTTP headers.',
    details: [
      'Content-Type and status code verification',
      'Structural XML syntax validation (XMLValidator)',
      'Parsing to typed domain representations with 0 native crashes',
    ],
  },
  {
    id: 'sqlite_persistence',
    stageNumber: 3,
    title: 'Local Database (SQLite)',
    tech: 'expo-sqlite & Versioned Migrations',
    icon: 'server-outline',
    color: Palette.emeraldFresh,
    description: 'Persistent local storage with foreign keys, transactional writes, and WAL mode.',
    details: [
      'Schema: locations, weather_records, forecast_records, air_quality_records',
      'xml_imports & normalized xml_weather_records',
      'Offline-first cache and pending sync_queue',
    ],
  },
  {
    id: 'firebase_sync',
    stageNumber: 4,
    title: 'Cloud Synchronization',
    tech: 'Firebase Cloud Firestore JS SDK',
    icon: 'cloud-upload-outline',
    color: Palette.amberWarning,
    description: 'Batch cloud upload with deterministic document IDs and automatic retries.',
    details: [
      'Batched writes (max 500 records per Firestore commit)',
      'Deterministic document IDs prevent redundant duplicates',
      'Graceful offline queueing when Firebase credentials are unconfigured',
    ],
  },
  {
    id: 'analytics_engine',
    stageNumber: 5,
    title: 'Statistical Analytics Engine',
    tech: 'Mathematical Algorithms & Trend Regression',
    icon: 'stats-chart-outline',
    color: Palette.violetMisty,
    description: 'Computes descriptive statistics and data-grounded natural language insights.',
    details: [
      'Mean, Median, Min/Max, Range, Standard Deviation',
      'Least-squares linear regression slope for thermal and pressure trends',
      'Automated observations derived strictly from active dataset',
    ],
  },
  {
    id: 'mobile_ui',
    stageNumber: 6,
    title: 'Presentation & Visualizations',
    tech: 'React Native & SVG Charts & Expo Router',
    icon: 'phone-portrait-outline',
    color: Palette.cyanAccent,
    description: 'Atmospheric deep slate interface with interactive charts and bottom tabs.',
    details: [
      'Interactive SVG temperature and precipitation charts',
      'Dedicated XML Data Explorer and Local Database inspection screens',
      'Cross-platform support for Android, iOS, and Web',
    ],
  },
];

export function SystemArchitectureDiagram() {
  const [selectedStage, setSelectedStage] = useState<string>('rest_apis');
  const activeStep = PIPELINE_STEPS.find((s) => s.id === selectedStage) || PIPELINE_STEPS[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="git-network-outline" size={20} color={Palette.cyanGlow} />
        <Text style={styles.headerTitle}>System Architecture & Data Pipeline</Text>
      </View>
      <Text style={styles.headerSub}>
        Tap any pipeline stage to inspect data transformation, protocols, and persistence mechanisms:
      </Text>

      {/* Stage selector bubbles */}
      <View style={styles.pipelineRow}>
        {PIPELINE_STEPS.map((step, idx) => {
          const isSelected = selectedStage === step.id;
          return (
            <React.Fragment key={step.id}>
              <TouchableOpacity
                style={[
                  styles.nodeBubble,
                  { borderColor: isSelected ? step.color : Palette.cardBorder },
                  isSelected && { backgroundColor: `${step.color}20` },
                ]}
                onPress={() => setSelectedStage(step.id)}
                activeOpacity={0.7}
              >
                <Ionicons name={step.icon} size={18} color={isSelected ? step.color : Palette.textSecondaryDark} />
                <Text style={[styles.nodeStage, isSelected && { color: step.color, fontWeight: '700' }]}>
                  {step.stageNumber}
                </Text>
              </TouchableOpacity>
              {idx < PIPELINE_STEPS.length - 1 && (
                <View style={styles.connectorLine}>
                  <Ionicons name="chevron-forward" size={12} color={Palette.cardBorder} />
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Active Stage Detailed Card */}
      <View style={[styles.detailsCard, { borderColor: `${activeStep.color}40` }]}>
        <View style={styles.detailsHeader}>
          <View style={[styles.stepBadge, { backgroundColor: `${activeStep.color}20`, borderColor: activeStep.color }]}>
            <Text style={[styles.stepBadgeText, { color: activeStep.color }]}>Stage {activeStep.stageNumber}</Text>
          </View>
          <Text style={styles.activeTitle}>{activeStep.title}</Text>
        </View>

        <Text style={styles.activeTech}>Tech: {activeStep.tech}</Text>
        <Text style={styles.activeDescription}>{activeStep.description}</Text>

        <View style={styles.bulletsList}>
          {activeStep.details.map((detail, dIdx) => (
            <View key={`detail-${dIdx}`} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={14} color={activeStep.color} style={{ marginTop: 3 }} />
              <Text style={styles.bulletText}>{detail}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    ...Typography.titleMedium,
    color: Palette.textPrimaryDark,
    marginLeft: Spacing.sm,
  },
  headerSub: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    marginBottom: Spacing.md,
  },
  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  nodeBubble: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    backgroundColor: Palette.deepSlate,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeStage: {
    fontSize: 9,
    color: Palette.textMutedDark,
    marginTop: -2,
  },
  connectorLine: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: Palette.deepSlate,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  stepBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  activeTitle: {
    ...Typography.titleSmall,
    color: Palette.textPrimaryDark,
    flex: 1,
  },
  activeTech: {
    ...Typography.bodySmall,
    color: Palette.cyanGlow,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  activeDescription: {
    ...Typography.bodySmall,
    color: Palette.textSecondaryDark,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  bulletsList: {
    marginTop: Spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletText: {
    ...Typography.bodySmall,
    color: Palette.textPrimaryDark,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
