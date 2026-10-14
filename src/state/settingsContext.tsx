/**
 * AtmosIQ - Settings & Preferences Context
 * Handles Celsius/Fahrenheit toggle, wind speed units, and dark/light theme.
 */

import React, { createContext, useContext, useState } from 'react';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'mps';
export type AppTheme = 'dark' | 'light';

interface SettingsContextType {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  theme: AppTheme;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setWindSpeedUnit: (unit: WindSpeedUnit) => void;
  setTheme: (theme: AppTheme) => void;
  formatTemperature: (celsius: number | null | undefined) => string;
  formatWindSpeed: (kmh: number | null | undefined) => string;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  const [windSpeedUnit, setWindSpeedUnit] = useState<WindSpeedUnit>('kmh');
  const [theme, setTheme] = useState<AppTheme>('dark');

  const formatTemperature = (celsius: number | null | undefined): string => {
    if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
    if (temperatureUnit === 'fahrenheit') {
      const f = (celsius * 9) / 5 + 32;
      return `${Math.round(f)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const formatWindSpeed = (kmh: number | null | undefined): string => {
    if (kmh === null || kmh === undefined || isNaN(kmh)) return '--';
    if (windSpeedUnit === 'mph') {
      const mph = kmh * 0.621371;
      return `${Math.round(mph)} mph`;
    }
    if (windSpeedUnit === 'mps') {
      const mps = kmh / 3.6;
      return `${mps.toFixed(1)} m/s`;
    }
    return `${Math.round(kmh)} km/h`;
  };

  return (
    <SettingsContext.Provider
      value={{
        temperatureUnit,
        windSpeedUnit,
        theme,
        setTemperatureUnit,
        setWindSpeedUnit,
        setTheme,
        formatTemperature,
        formatWindSpeed,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
