/**
 * AtmosIQ - XML Parsing & Normalization Unit Tests
 */

import { parseAndNormalizeXml } from '../src/api/xmlWeatherApi';
import { RawXmlFetchResult } from '../src/models/xml.types';

describe('XML Parser & Normalization Engine', () => {
  const sampleMetNorwayXml = `<?xml version="1.0" encoding="UTF-8"?>
<weatherdata xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" created="2026-10-14T12:00:00Z">
  <meta>
    <model name="met_public_forecast" termin="2026-10-14T12:00:00Z"/>
  </meta>
  <product class="pointData">
    <time datatype="forecast" from="2026-10-14T12:00:00Z" to="2026-10-14T12:00:00Z">
      <location altitude="120" latitude="60.1" longitude="9.58">
        <temperature id="TTT" unit="celsius" value="8.5"/>
        <windDirection id="dd" deg="180.0" name="S"/>
        <windSpeed id="ff" mps="3.2" beaufort="2" name="Light breeze"/>
        <humidity unit="percent" value="72.0"/>
        <pressure id="pr" unit="hPa" value="1015.4"/>
        <cloudiness id="NN" percent="45.0"/>
      </location>
    </time>
    <time datatype="forecast" from="2026-10-14T13:00:00Z" to="2026-10-14T13:00:00Z">
      <location altitude="120" latitude="60.1" longitude="9.58">
        <temperature id="TTT" unit="celsius" value="9.1"/>
        <windDirection id="dd" deg="190.0" name="S"/>
        <windSpeed id="ff" mps="4.0" beaufort="3" name="Gentle breeze"/>
        <humidity unit="percent" value="68.5"/>
        <pressure id="pr" unit="hPa" value="1014.8"/>
      </location>
    </time>
  </product>
</weatherdata>`;

  it('should successfully parse and normalize valid MET Norway XML', () => {
    const rawResult: RawXmlFetchResult = {
      endpointId: 'met_norway_classic',
      url: 'https://api.met.no/weatherapi/locationforecast/2.0/classic?lat=60.10&lon=9.58',
      status: 200,
      contentType: 'application/xml',
      headers: { 'content-type': 'application/xml' },
      rawXml: sampleMetNorwayXml,
      byteSize: sampleMetNorwayXml.length,
      fetchedAt: '2026-10-14T12:00:00Z',
      isGenuineXml: true,
    };

    const report = parseAndNormalizeXml(rawResult, 'Oslo Grid');

    expect(report.success).toBe(true);
    expect(report.statusCode).toBe(200);
    expect(report.parsedRecordCount).toBe(2);
    expect(report.records.length).toBe(2);

    const rec1 = report.records[0];
    expect(rec1.temperatureC).toBe(8.5);
    expect(rec1.humidityPercent).toBe(72.0);
    expect(rec1.pressureHpa).toBe(1015.4);
    expect(rec1.windSpeedMps).toBe(3.2);
    expect(rec1.windDirectionDeg).toBe(180.0);
    expect(rec1.locationName).toBe('Oslo Grid');

    const rec2 = report.records[1];
    expect(rec2.temperatureC).toBe(9.1);
    expect(rec2.windSpeedMps).toBe(4.0);
  });

  it('should gracefully reject and flag malformed XML', () => {
    const brokenXml = '<weatherdata><product><time><unclosedTag>broken</time></weatherdata>';

    const rawResult: RawXmlFetchResult = {
      endpointId: 'broken',
      url: 'https://example.com/broken.xml',
      status: 200,
      contentType: 'application/xml',
      headers: { 'content-type': 'application/xml' },
      rawXml: brokenXml,
      byteSize: brokenXml.length,
      fetchedAt: '2026-10-14T12:00:00Z',
      isGenuineXml: true,
    };

    const report = parseAndNormalizeXml(rawResult);

    expect(report.success).toBe(false);
    expect(report.parsedRecordCount).toBe(0);
    expect(report.records.length).toBe(0);
    expect(report.errorMessage).toBeDefined();
    expect(report.errorMessage).toContain('Malformed XML');
  });

  it('should parse NOAA NWS Alert ATOM/XML feed entries', () => {
    const noaaAtomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:cap="urn:oasis:names:tc:emergency:cap:1.2">
  <id>https://api.weather.gov/alerts</id>
  <title>NOAA NWS Current Alerts</title>
  <updated>2026-10-14T12:00:00Z</updated>
  <entry>
    <id>https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.1</id>
    <title>High Wind Warning</title>
    <summary>Damaging winds up to 60 mph expected</summary>
    <cap:severity>Severe</cap:severity>
    <cap:areaDesc>Coastal Maine</cap:areaDesc>
  </entry>
</feed>`;

    const rawResult: RawXmlFetchResult = {
      endpointId: 'noaa_nws_alerts',
      url: 'https://api.weather.gov/alerts/active.atom',
      status: 200,
      contentType: 'application/atom+xml',
      headers: { 'content-type': 'application/atom+xml' },
      rawXml: noaaAtomXml,
      byteSize: noaaAtomXml.length,
      fetchedAt: '2026-10-14T12:00:00Z',
      isGenuineXml: true,
    };

    const report = parseAndNormalizeXml(rawResult);

    expect(report.success).toBe(true);
    expect(report.parsedRecordCount).toBe(1);
    expect(report.records[0].weatherCondition).toContain('High Wind Warning');
    expect(report.records[0].locationName).toContain('Coastal Maine');
  });
});
