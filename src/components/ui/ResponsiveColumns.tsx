import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Layout } from '@/constants/theme';

export function ResponsiveColumns({ children }: { children: React.ReactNode }) {
  const { width, fontScale } = useWindowDimensions();
  const wide = width >= Layout.wideBreakpoint && fontScale < 1.5;
  return (
    <View style={[styles.container, wide && styles.wide]}>
      {React.Children.map(children, child => child && <View style={styles.column}>{child}</View>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  wide: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, minWidth: 0 },
});
