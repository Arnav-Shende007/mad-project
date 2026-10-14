/**
 * AtmosIQ - Official WMO Weather Code Mappings (Open-Meteo Standard)
 */

export interface WeatherConditionInfo {
  code: number;
  description: string;
  iconName: string;
  category: 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'thunderstorm';
  color: string;
}

export const WMO_WEATHER_MAP: Record<number, WeatherConditionInfo> = {
  0: { code: 0, description: 'Clear sky', iconName: 'sunny', category: 'clear', color: '#F59E0B' },
  1: { code: 1, description: 'Mainly clear', iconName: 'partly-sunny', category: 'clear', color: '#FBBF24' },
  2: { code: 2, description: 'Partly cloudy', iconName: 'partly-sunny', category: 'cloudy', color: '#38BDF8' },
  3: { code: 3, description: 'Overcast', iconName: 'cloudy', category: 'cloudy', color: '#94A3B8' },
  45: { code: 45, description: 'Foggy', iconName: 'cloud', category: 'fog', color: '#64748B' },
  48: { code: 48, description: 'Depositing rime fog', iconName: 'cloud', category: 'fog', color: '#64748B' },
  51: { code: 51, description: 'Light drizzle', iconName: 'rainy', category: 'rain', color: '#06B6D4' },
  53: { code: 53, description: 'Moderate drizzle', iconName: 'rainy', category: 'rain', color: '#0284C7' },
  55: { code: 55, description: 'Dense drizzle', iconName: 'rainy', category: 'rain', color: '#0369A1' },
  56: { code: 56, description: 'Light freezing drizzle', iconName: 'snow', category: 'snow', color: '#7DD3FC' },
  57: { code: 57, description: 'Dense freezing drizzle', iconName: 'snow', category: 'snow', color: '#38BDF8' },
  61: { code: 61, description: 'Slight rain', iconName: 'rainy', category: 'rain', color: '#38BDF8' },
  63: { code: 63, description: 'Moderate rain', iconName: 'rainy', category: 'rain', color: '#0284C7' },
  65: { code: 65, description: 'Heavy rain', iconName: 'thunderstorm', category: 'rain', color: '#1D4ED8' },
  66: { code: 66, description: 'Light freezing rain', iconName: 'snow', category: 'snow', color: '#7DD3FC' },
  67: { code: 67, description: 'Heavy freezing rain', iconName: 'snow', category: 'snow', color: '#38BDF8' },
  71: { code: 71, description: 'Slight snow', iconName: 'snow', category: 'snow', color: '#E0F2FE' },
  73: { code: 73, description: 'Moderate snow', iconName: 'snow', category: 'snow', color: '#BAE6FD' },
  75: { code: 75, description: 'Heavy snow', iconName: 'snow', category: 'snow', color: '#93C5FD' },
  77: { code: 77, description: 'Snow grains', iconName: 'snow', category: 'snow', color: '#E0F2FE' },
  80: { code: 80, description: 'Slight rain showers', iconName: 'rainy', category: 'rain', color: '#38BDF8' },
  81: { code: 81, description: 'Moderate rain showers', iconName: 'rainy', category: 'rain', color: '#0284C7' },
  82: { code: 82, description: 'Violent rain showers', iconName: 'thunderstorm', category: 'rain', color: '#1E40AF' },
  85: { code: 85, description: 'Slight snow showers', iconName: 'snow', category: 'snow', color: '#BAE6FD' },
  86: { code: 86, description: 'Heavy snow showers', iconName: 'snow', category: 'snow', color: '#93C5FD' },
  95: { code: 95, description: 'Thunderstorm', iconName: 'thunderstorm', category: 'thunderstorm', color: '#8B5CF6' },
  96: { code: 96, description: 'Thunderstorm with hail', iconName: 'thunderstorm', category: 'thunderstorm', color: '#7C3AED' },
  99: { code: 99, description: 'Severe thunderstorm with hail', iconName: 'thunderstorm', category: 'thunderstorm', color: '#6D28D9' },
};

export function getWeatherConditionInfo(code: number | null | undefined): WeatherConditionInfo {
  if (code === null || code === undefined || !WMO_WEATHER_MAP[code]) {
    return {
      code: code ?? -1,
      description: 'Variable conditions',
      iconName: 'partly-sunny',
      category: 'cloudy',
      color: '#38BDF8',
    };
  }
  return WMO_WEATHER_MAP[code];
}

export function getAqiCategory(usAqi: number | null | undefined): {
  label: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' | 'Unknown';
  color: string;
  description: string;
} {
  if (usAqi === null || usAqi === undefined) {
    return { label: 'Unknown', color: '#94A3B8', description: 'AQI data unavailable' };
  }
  if (usAqi <= 50) return { label: 'Good', color: '#10B981', description: 'Air quality is satisfactory.' };
  if (usAqi <= 100) return { label: 'Moderate', color: '#F59E0B', description: 'Air quality is acceptable.' };
  if (usAqi <= 150) return { label: 'Unhealthy for Sensitive', color: '#F97316', description: 'Sensitive groups may experience health effects.' };
  if (usAqi <= 200) return { label: 'Unhealthy', color: '#EF4444', description: 'Some members of the general public may experience health effects.' };
  if (usAqi <= 300) return { label: 'Very Unhealthy', color: '#8B5CF6', description: 'Health alert: the risk of health effects is increased for everyone.' };
  return { label: 'Hazardous', color: '#7F1D1D', description: 'Health warning of emergency conditions: everyone is more likely to be affected.' };
}
