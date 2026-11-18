# Project readiness and remaining implementation

PROJECT READINESS AUDIT | ATMOSIQ

Project readiness and remaining implementation

The project contains the main assignment features, but it is not yet fully verified for the final physical-device demonstration. The most important corrections are native SQLite history retention, complete XML cloud synchronization, truthful data presentation, and device deployment.

Audit baseline 6f3f503 | Prepared 1 November 2026

Requirement | Assessment | Evidence or next step

1 Open API | Implemented and endpoint checked | Open-Meteo, MET Norway, and NOAA returned HTTP 200

2 XML SQLite Firebase | Partly complete end to end | Parser and storage code exist; correct retry completeness and prove live persistence

3 Analysis | Implemented for JSON | Connect stored XML analysis if the examiner expects one data pipeline

4 Charts and diagrams | Implemented | Interactive line and bar charts and system diagrams render

5 Good UI | Implemented with data caveats | Responsive browser pass succeeds; illustrative cards need labels

6 All OS | Targeted but not fully tested | Android and iOS intended; browser verified; no native desktop package

7 Phone deployment | Pending evidence | Install or run on a real phone and rehearse the full workflow

Verified during this audit

All 25 unit tests across four suites pass. TypeScript passes. Lint has zero errors and 15 existing warnings. The preceding UI validation built 16 static routes and checked seven screens at four widths with no page errors. Public read-only checks returned 200 for JSON forecast, MET XML, and NOAA Atom. No Firebase writes or physical-phone installation were performed for this documentation task.

Priority fixes before the final demonstration

1 Preserve native database history

saveLocation uses INSERT OR REPLACE, while related tables reference locations with ON DELETE CASCADE. On a duplicate location ID, SQLite REPLACE deletes the old parent before inserting the new row. In an isolated test using the repository schema with foreign keys enabled, one existing weather row became zero after the parent was saved again. This can erase local history on refresh.

Required correction Use an actual update or INSERT ON CONFLICT DO UPDATE for the location. Add a native SQLite integration test that refreshes the same city twice and verifies that previous observations remain. This issue was reproduced with the SQLite engine, not on the user's phone.

2 Upload and retry every parsed XML record

syncXmlReportDirectly limits uploads to 25 normalized records. persistXmlReport queues only ten sample records, and syncPendingQueue later uploads that sample inside the import document instead of creating all child documents. Separate direct and queued paths also generate different import IDs. The synced counter and local synced flags therefore do not reliably prove full replication.

Required correction Persist a single import identity and a full upload manifest. Batch all child records in bounded chunks, track acknowledged rows, and make retries idempotent. Verify exact local and cloud counts and values after a network failure.

3 Keep XML values and source identity truthful

NOAA alert parsing supplies a constant temperature and fixed coordinates. Generic XML, including the listed WaterML endpoint, creates a synthetic temperature. WeatherProvider also supplies the selected city name to the fixed Norway forecast.

Required correction Preserve source coordinates and labels, reject failed or unsupported responses, and represent alerts or hydrological values with their actual schemas. MET Norway is the usable implemented measurement parser for the current demonstration.

Additional implementation and validation gaps

Area | Current gap | Recommended action

Web storage | Map-based, lost on reload, incomplete SQL behavior | Use a durable supported browser storage design if persistent web data is required

Analysis period | 24-hour chart can be paired with 48-hour KPIs; pressure and AQI ignore 7-day choice | Apply one consistent filter or disable unsupported options

Forecast time | First hourly entries can start at midnight but are labelled Now | Filter with the source location time before slicing

Wind direction | Arithmetic average fails around north | Use a circular mean

XML analytics | XML report is not an analytics input | Add an XML analysis view if same-data analysis is expected

Weather decoration | Fixed moon times, pollen None, fallback AQI, artwork map | Label illustrative content or show data unavailable

Preference units | Analytics keeps fixed C and km/h labels | Make unit conversion consistent or explicitly identify native units

Firebase proof | Client initialization is shown as Connected | Verify accepted documents and values in the live console

Deployment | No recorded phone run or EAS configuration | Select a route and collect real installation and restart evidence

Testing limits to explain honestly

Database unit tests exercise the web adapter, not the phone SQLite engine. The Firebase tests check configuration and status behavior; they do not prove successful live writes. Browser screenshots use deterministic weather responses for repeatable UI checks. A successful API request from the computer does not establish browser CORS compatibility or phone network access.

Completion plan and individual presentation preparation

1. Correct location replacement and verify retained history using the real SQLite adapter.

2. Unify XML identities and make full-record Firebase uploads and retries complete.

3. Remove or label synthetic observations and preserve the actual XML source location.

4. Align analytics windows and time labels; add XML-derived analysis if required by the examiner.

5. Choose the primary Android or iOS demonstration route and install or launch the app on that phone.

6. Run a live XML to SQLite to Firebase test, reopen the app, compare IDs and measurements, and save the evidence.

7. Rehearse the seven individual reports. Every presenter should explain the endpoint, parser attributes, SQL relationship, cloud batch, formula, chart, and deployment method.

Questions each student should be able to answer

Where is the API URL built? Which format is returned? Which XML attribute becomes temperatureC? Which column stores it? How is import_id used? What happens if Firebase is unavailable? Which formula produces the displayed average? Which data points are included in the chart? What is stored after the app is restarted? Which parts of the screenshot are illustrative?

Source evidence

src/database/sqlite.ts line 47

src/database/migrations.ts line 47

src/firebase/firestoreSync.ts line 354

src/database/sqlite.ts line 210

src/api/xmlWeatherApi.ts line 195

src/database/storageAdapter.ts line 13

src/app/(tabs)/analytics.tsx line 102

src/api/openMeteo.ts line 292

__tests__/firebaseSync.test.ts line 8

SQLite conflict handling

MET Norway classic XML format status