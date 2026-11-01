import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Layout, Palette } from '@/constants/theme';

interface Props {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  action?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, icon, action }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>ATMOSIQ / WEATHER INTELLIGENCE</Text>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {action ?? (
        <View style={styles.icon}>
          <Ionicons name={icon} size={22} color={Palette.cyanGlow} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%', maxWidth: Layout.contentMaxWidth, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 22,
  },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 10, letterSpacing: 1.6, fontWeight: '700', color: Palette.cyanGlow, marginBottom: 8 },
  title: { fontSize: 27, letterSpacing: -0.8, fontWeight: '700', color: Palette.white },
  subtitle: { fontSize: 13, lineHeight: 20, color: Palette.textSecondaryDark, marginTop: 6 },
  icon: {
    width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Palette.accentSoft, borderWidth: 1, borderColor: Palette.accentBorder,
  },
});
