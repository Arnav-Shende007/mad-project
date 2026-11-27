import { Text, VStack } from '@expo/ui/swift-ui';
import { createWidget } from 'expo-widgets';
import type { WidgetSnapshot } from './widget';

function Snapshot(props: WidgetSnapshot) {
  'widget';
  return (
    <VStack>
      <Text>{props.city || 'AtmosIQ'}</Text>
      <Text>{props.temperature || 'Open AtmosIQ'}</Text>
      <Text>{props.detail || ''}</Text>
      <Text>{props.time || ''}</Text>
    </VStack>
  );
}
const widget = createWidget('AtmosForecast', Snapshot);
export function registerWidget() {}
export async function updateWidget(snapshot: WidgetSnapshot) {
  widget.updateSnapshot(snapshot);
}
