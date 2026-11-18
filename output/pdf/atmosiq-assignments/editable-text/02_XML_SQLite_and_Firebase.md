# Parsing XML and storing it in SQLite and Firebase

ASSIGNMENT 02 | ATMOSIQ PROJECT

Parsing XML and storing it in SQLite and Firebase

Requirement Parse an XML response and store the parsed data in SQLite and Firebase.

Current status Core pipeline implemented. Complete retry coverage, native history retention, and live cloud verification still need attention.

Student name ____________________ Roll number ____________________

Aim and theory

Fetch genuine XML from a public endpoint, validate its structure, extract measurements, and save a normalized record locally and in the cloud. SQLite is a relational database on the phone. Cloud Firestore, the Firebase product used here, stores documents in collections; it is not Firebase Realtime Database.

Figure 1. Primary XML pipeline. The cloud step runs only when Firebase is configured and parsing succeeds.

Stage | Implementation | Important detail

Fetch | fetchRawXmlFromEndpoint | Captures URL, status, headers, XML text, and byte size

Validate | XMLValidator.validate | Returns an error for malformed structure

Parse | XMLParser | Keeps attributes with the @_ prefix

Local save | persistXmlReport | Saves import metadata and normalized child rows

Cloud save | syncXmlReportDirectly | Uploads import metadata and at most 25 records

Parser configuration

new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
  parseAttributeValue: true,
});

Keeping attributes matters because the MET Norway forecast stores temperature, wind speed, and coordinates in XML attributes, not only text nodes.

Worked XML mapping and database design

<location latitude="60.1" longitude="9.58">
  <temperature unit="celsius" value="8.5"/>
  <windSpeed mps="3.2" name="Light breeze"/>
  <humidity unit="percent" value="72.0"/>
  <pressure unit="hPa" value="1015.4"/>
</location>

Figure 2. Shortened XML from the parser unit-test fixture. These values are an example, not a live observation.

XML field | Normalized model | SQLite column

temperature @_value | temperatureC = 8.5 | temperature_c

windSpeed @_mps | windSpeedMps = 3.2 | wind_speed_mps

humidity @_value | humidityPercent = 72 | humidity_percent

pressure @_value | pressureHpa = 1015.4 | pressure_hpa

time @_from | timestamp | timestamp

Local relationships and cloud collections

xml_imports records the request source, fetch timestamp, HTTP status, content type, parsing status, and row count. xml_weather_records contains the normalized measurements. A transaction groups the import and child inserts. A sync_queue item records work for later cloud synchronization.

SELECT id, import_id, timestamp, temperature_c
FROM xml_weather_records
ORDER BY timestamp DESC LIMIT 5;

Firestore collections
  xmlImports/{importId}
  xmlWeatherRecords/{recordId}

The direct cloud path uses a Firestore write batch. Its recordsSynced count includes the import document, so 25 uploaded measurement documents can appear as a count of 26. This is not the same as 26 parsed measurements.

Verification procedure and known gaps

1. On the phone, open More then XML Data Explorer and choose MET Norway. Show the actual source coordinates and a successful HTTP response.

2. Inspect Raw XML and Parsed Records. Match one temperature and timestamp to the source attributes.

3. Open Local Database and its XML Records view. Check that the same normalized record exists after the app is closed and reopened.

4. Open the Firebase console for the configured project. Verify matching measurement values in xmlWeatherRecords and import metadata in xmlImports. A local Connected label is not proof of server acceptance.

5. Disable network, ingest or retain a pending import, then reconnect and retry. Verify every expected record rather than only a success counter.

What must be completed or corrected

Cloud completeness. The direct path uploads only the first 25 records. The queued retry path writes import metadata plus 10 sample records inside xmlImports, not all child documents in xmlWeatherRecords. A complete solution needs chunked upload of every normalized record, a shared import ID, and per-record retry and completion tracking.

Data fidelity. NOAA alerts are currently assigned a constant 15 C and fixed coordinates. The generic handler, including WaterML, creates a synthetic 20 C record. These are not parsed measurements. Use the MET Norway handler for the measurement demonstration; implement source-specific schemas or reject unsupported XML.

Local history. Replacing a location can delete its related native rows through ON DELETE CASCADE. An isolated SQLite reproduction with this repository schema changed one weather row to zero after re-saving its parent location. Use a true update or conflict-update operation and verify history retention on the phone.

Validation and identity. Parsing is not gated on HTTP success, and the selected city name can be attached to the fixed Norway coordinates. Reject failed responses before persistence and preserve the actual source location.

Viva questions and source evidence

Why validate before parsing?Validation detects malformed XML with a useful error. Parsing converts the valid syntax into an object tree.

Why normalize the records?A consistent model makes typed storage, queries, and display independent of the source XML structure.

Why have parent and child tables?One XML import can contain many observations. import_id connects each observation to its source request.

Why use a transaction?Related local inserts should succeed together or roll back together on the native SQLite path.

Why parameterize SQL?Values are bound separately from SQL text, which avoids quoting errors and reduces SQL injection risk.

What does a Firestore batch guarantee?The writes in a committed batch are atomic. Local and cloud operations together are not one distributed transaction.

What is still missing for the full assignment proof?A phone restart test for native SQLite and verified live Firebase documents, plus complete upload and retry coverage for all parsed rows.

Tests and conclusion

The parser suite checks a valid MET forecast, malformed XML rejection, and NOAA feed parsing. The database tests use the web adapter, so passing tests do not establish native SQLite durability or foreign-key behavior. The Firebase tests do not perform an authenticated end-to-end cloud write. The assignment is implemented at pipeline level but should not yet be described as fully verified end to end.

Source evidence

src/api/xmlWeatherApi.ts line 91

src/database/migrations.ts line 77

src/database/sqlite.ts line 158

src/database/sqlite.ts line 47

src/firebase/firestoreSync.ts line 312

src/state/weatherContext.tsx line 148

__tests__/firebaseSync.test.ts line 8

Expo SDK 57 SQLite reference

Firestore batches reference

SQLite REPLACE behavior