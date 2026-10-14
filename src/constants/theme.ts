/**
 * AtmosIQ - Design System, Color Tokens & Typography
 * Deep navy and slate atmospheric palette with cyan/azure accents
 */

import { Platform } from 'react-native';

export const Palette = {
  // Deep atmospheric tones
  spaceNavy: '#0A0F1D',
  deepSlate: '#0F172A',
  cardSlate: '#1E293B',
  cardSurface: '#162033',
  cardBorder: '#334155',
  cardBorderSubtle: 'rgba(148, 163, 184, 0.15)',
  
  // Accents
  cyanAccent: '#06B6D4',
  cyanGlow: '#22D3EE',
  azureBlue: '#38BDF8',
  indigoPulse: '#6366F1',
  violetMisty: '#8B5CF6',
  emeraldFresh: '#10B981',
  amberWarning: '#F59E0B',
  roseAlert: '#F43F5E',

  // Grayscale & Text
  white: '#FFFFFF',
  textPrimaryDark: '#F8FAFC',
  textSecondaryDark: '#94A3B8',
  textMutedDark: '#64748B',

  textPrimaryLight: '#0F172A',
  textSecondaryLight: '#475569',
  textMutedLight: '#94A3B8',
  lightBackground: '#F1F5F9',
  lightCard: '#FFFFFF',
  lightBorder: '#CBD5E1',
};

export const Colors = {
  dark: {
    text: Palette.textPrimaryDark,
    textSecondary: Palette.textSecondaryDark,
    textMuted: Palette.textMutedDark,
    background: Palette.spaceNavy,
    backgroundSecondary: Palette.deepSlate,
    card: Palette.cardSurface,
    cardElevated: Palette.cardSlate,
    cardBorder: Palette.cardBorder,
    borderSubtle: Palette.cardBorderSubtle,
    primary: Palette.cyanAccent,
    primaryGlow: Palette.cyanGlow,
    accent: Palette.azureBlue,
    success: Palette.emeraldFresh,
    warning: Palette.amberWarning,
    error: Palette.roseAlert,
    tabBarBackground: '#0B1120',
    tabBarBorder: '#1E293B',
    tabBarActive: Palette.cyanGlow,
    tabBarInactive: '#64748B',
    chartLine: Palette.cyanGlow,
    chartGrid: 'rgba(148, 163, 184, 0.12)',
    chartFill: 'rgba(34, 211, 238, 0.15)',
  },
  light: {
    text: Palette.textPrimaryLight,
    textSecondary: Palette.textSecondaryLight,
    textMuted: Palette.textMutedLight,
    background: Palette.lightBackground,
    backgroundSecondary: '#E2E8F0',
    card: Palette.lightCard,
    cardElevated: '#FFFFFF',
    cardBorder: Palette.lightBorder,
    borderSubtle: 'rgba(100, 116, 139, 0.12)',
    primary: '#0284C7',
    primaryGlow: '#0EA5E9',
    accent: '#2563EB',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    tabBarActive: '#0284C7',
    tabBarInactive: '#94A3B8',
    chartLine: '#0284C7',
    chartGrid: 'rgba(100, 116, 139, 0.15)',
    chartFill: 'rgba(2, 132, 199, 0.12)',
  },
} as const;

export type ThemeColors = typeof Colors.dark;

export const Typography = {
  displayLarge: {
    fontSize: 48,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },
  displayMedium: {
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  titleMedium: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  titleSmall: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
} as const;
