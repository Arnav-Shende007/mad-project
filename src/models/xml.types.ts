/**
 * AtmosIQ - XML Data Processing & Storage Models
 */

export interface XmlEndpointMetadata {
  id: string;
  name: string;
  agency: string;
  url: string;
  formatDescription: string;
  contentTypeExpected: string;
}

export interface RawXmlFetchResult {
  endpointId: string;
  url: string;
  status: number;
  contentType: string;
  headers: Record<string, string>;
  rawXml: string;
  byteSize: number;
  fetchedAt: string;
  isGenuineXml: boolean;
}

export interface NormalizedXmlWeatherRecord {
  id: string;
  sourceEndpoint: string;
  timestamp: string;
  locationName: string;
  latitude: number;
  longitude: number;
  temperatureC: number;
  humidityPercent?: number;
  pressureHpa?: number;
  windSpeedMps?: number;
  windDirectionDeg?: number;
  weatherCondition?: string;
  cloudCoverPercent?: number;
  dewpointC?: number;
  rawNodeSnippet?: string;
}

export interface XmlParseReport {
  success: boolean;
  sourceEndpoint: string;
  fetchedAt: string;
  rawXmlLength: number;
  contentType: string;
  statusCode: number;
  parsedRecordCount: number;
  records: NormalizedXmlWeatherRecord[];
  sqliteSavedCount: number;
  firebaseSyncedCount: number;
  errorMessage?: string;
  parseDurationMs: number;
}
