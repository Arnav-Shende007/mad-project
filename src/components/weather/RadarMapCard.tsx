import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Choice, Panel, ui } from './WeatherPanel';
import type { LocationItem } from '@/models/weather.types';

export function RadarMapCard({ location }: { location: LocationItem }) {
  const [open, setOpen] = useState(false);
  const url =
    'https://www.rainviewer.com/map.html?layer=radar&loc=' +
    [location.latitude, location.longitude, 7].join(',');
  return (
    <Panel title={'Rain radar · ' + location.name}>
      <Text style={ui.note}>
        RainViewer · Recent precipitation. Coverage varies by region.
      </Text>
      <Choice
        label={open ? 'Close radar' : 'Explore radar'}
        onPress={() => setOpen(!open)}
      />
      {open && (
        <View style={{ height: 320 }}>
          {Platform.OS === 'web' ? (
            <iframe
              src={url}
              title="Interactive rain radar"
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          ) : (
            <WebView
              source={{ uri: url }}
              startInLoadingState
              renderError={() => (
                <Text style={ui.text}>
                  Radar unavailable. Close and reopen to retry.
                </Text>
              )}
            />
          )}
        </View>
      )}
    </Panel>
  );
}
