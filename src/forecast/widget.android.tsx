import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FlexWidget,
  TextWidget,
  registerWidgetTaskHandler,
  requestWidgetUpdate,
} from 'react-native-android-widget';
import type { WidgetSnapshot } from './widget';

function render(snapshot: WidgetSnapshot | null) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        backgroundColor: '#132641',
        width: 'match_parent',
        height: 'match_parent',
        padding: 14,
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {[
        snapshot?.city || 'AtmosIQ',
        snapshot?.temperature || 'Open the app for weather',
        snapshot?.detail || '',
        snapshot?.time || '',
      ].map((text, index) => (
        <TextWidget
          key={index}
          text={text}
          style={{ color: '#FFFFFF', fontSize: index === 1 ? 22 : 13 }}
        />
      ))}
    </FlexWidget>
  );
}
export function registerWidget() {
  registerWidgetTaskHandler(async ({ widgetAction, renderWidget }) => {
    if (widgetAction === 'WIDGET_DELETED') return;
    const stored = await AsyncStorage.getItem('widget-snapshot');
    renderWidget(render(stored ? JSON.parse(stored) : null));
  });
}
export async function updateWidget(snapshot: WidgetSnapshot) {
  await AsyncStorage.setItem('widget-snapshot', JSON.stringify(snapshot));
  await requestWidgetUpdate({
    widgetName: 'AtmosForecast',
    renderWidget: () => render(snapshot),
  });
}
