import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PropsWithChildren } from 'react';

export function Panel({
  title,
  children,
  color,
}: PropsWithChildren<{ title: string; color?: string }>) {
  return (
    <View style={[ui.panel, color ? { backgroundColor: color } : null]}>
      <Text accessibilityRole="header" style={ui.title}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function Choice({
  label,
  onPress,
  selected = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[ui.choice, selected && { backgroundColor: '#235972' }]}
    >
      <Text style={ui.label}>{label}</Text>
    </Pressable>
  );
}

export const ui = StyleSheet.create({
  panel: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    gap: 10,
    backgroundColor: '#132641',
    borderRadius: 20,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  text: { color: '#E5EEFA', fontSize: 16, lineHeight: 23 },
  note: { color: '#B6C9DE', fontSize: 13, lineHeight: 19 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  choice: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#223A58',
  },
  label: { color: '#E9F6FF', fontWeight: '600' },
});
