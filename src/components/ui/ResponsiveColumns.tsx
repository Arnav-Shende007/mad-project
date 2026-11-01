import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useWideLayout } from '@/hooks/use-wide-layout';

export function ResponsiveColumns({ children }: { children: React.ReactNode }) {
  const wide = useWideLayout();
  return (
    <View style={[styles.container, wide && styles.wide]}>
      {React.Children.map(children, child => child && <View style={[styles.column, wide && styles.wideColumn]}>{child}</View>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  wide: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { minWidth: 0 },
  wideColumn: { flex: 1 },
});
