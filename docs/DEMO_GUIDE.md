# AtmosIQ — Step-by-Step Live Demonstration Guide

This guide is designed for an academic evaluator, instructor, or presenter to demonstrate **AtmosIQ — Weather Intelligence & Analytics** live on a physical Android phone, iOS device, or web browser.

---

## 🎯 Demonstration Sequence Summary

| Step | Action | Feature Demonstrated | Academic Requirement |
| :--- | :--- | :--- | :--- |
| **1** | Open AtmosIQ Dashboard | Live Open-Meteo REST API Ingestion & Current Weather | **Requirement A** |
| **2** | City Search & Selection | Geocoding API with Autocomplete & Dynamic Refresh | **Requirement A** |
| **3** | Forecast & Multi-Day Trends | 7-Day Outlook & Interactive High/Low Bars | **Section 4 & 5** |
| **4** | Analytics & Intelligence | Metric Filters, KPI Cards, Trends, Natural Language Insights | **Section 4 & 5** |
| **5** | Architecture & Sync Flow | Interactive Pipeline & Data Flow Diagrams | **Section 5** |
| **6** | XML Data Explorer | Genuine REST XML Fetch, Header Inspection & Validation | **Requirement B** |
| **7** | XML Parsing & Normalization | Parsing into TypeScript Models with 0 Crashes | **Requirement B** |
| **8** | SQLite Database Inspection | Local Tables, Schema Verification, Saved Records | **Requirement C** |
| **9** | Cloud Sync / Firebase | Queue Processing, Batch Writes, Firestore Status | **Requirement D** |
| **10** | Offline Resiliency Check | Seamless Local Cache Fallback & Sync Queueing | **Requirement 7** |

---

## 📋 Step-by-Step Live Walkthrough

### Step 1: Launch Application & View Live Weather
1. Start the development server (`npx expo start`) and scan the QR code with **Expo Go** on your Android smartphone.
2. Observe the deep atmospheric navy interface.
3. Verify that the **Live WMO** badge is green in the top right header.
4. Verify current temperature, condition description, humidity, wind velocity, surface pressure, and the horizontally scrollable 48-hour hourly forecast.
5. Note the data source attribution at the bottom: *Open-Meteo REST API & WMO Standard*.

### Step 2: Search for a New City
1. Tap the city search bar at the top of the Home screen.
2. Type a city name (e.g. `Tokyo` or `New York` or `Paris`).
3. Notice the live debounced autocomplete dropdown populated from Open-Meteo's Geocoding API.
4. Tap the result. The dashboard immediately recalculates current observations, hourly forecasts, and air quality metrics for the new coordinates.

### Step 3: Explore 7-Day Forecast & Thermal Dispersion
1. Tap the **Forecast** tab on the bottom navigation bar.
2. Point out the **Interactive Dual-Bar Chart**:
   - Cyan bars represent Daily Maximum Temperatures.
   - Azure bars represent Daily Minimum Temperatures.
   - Tap any bar to view exact temperature values for that day.
3. Point out the **Precipitation Trend Chart** showing projected rainfall volume.
4. Scroll through the daily breakdown cards showing WMO condition icons and precipitation probabilities.

### Step 4: Examine Analytics Dashboard & Intelligence Engine
1. Tap the **Analytics** tab on the bottom navigation bar.
2. **Interactive Metric Filters**:
   - Tap `Temperature`, `Precipitation`, `Wind Speed`, `Barometer`, or `Air Quality`.
   - Toggle between `24-Hour Hourly` and `7-Day Daily` time scopes.
   - Point out that the SVG Line Chart dynamically re-renders with smooth curves and touch point scrubber.
3. **Statistical Foundation (Requirement 4F)**:
   - Point out the KPI cards calculating **Arithmetic Mean**, **Statistical Median**, **Observation Range**, and **Standard Deviation (Variance)**.
4. **Data-Grounded Natural Language Insights (Requirement 4G)**:
   - Read aloud the automatically generated insights (e.g. thermal trend slope, wettest day percentage concentration, prevailing wind direction).

### Step 5: Inspect System Architecture Diagrams
1. Scroll down on the **Analytics** screen.
2. Point out the interactive **System Architecture & Data Pipeline**:
   - Tap through Stages 1 to 6 (REST APIs → Header Validation → SQLite Persistence → Cloud Sync → Statistical Analytics → Presentation UI).
3. Point out the **SQLite & Firebase Synchronization Architecture Diagram** showing how offline writes queue and commit in batches.

### Step 6: The XML Data Explorer (Requirement B Live Proof)
1. Tap the **XML Data** tab on the bottom navigation bar.
2. **Explain to Evaluator**:
   - Open-Meteo primarily returns JSON; to satisfy the academic XML parsing requirement with complete integrity, AtmosIQ integrates the **Norwegian Meteorological Institute (MET Norway) Locationforecast 2.0 Classic XML API** and the **NOAA National Weather Service Alerts ATOM/XML API**.
3. Select **MET Norway Weather Forecast (XML)**.
4. Tap **Fetch & Parse Live XML Response**:
   - Show the live HTTP 200 status badge and `Content-Type: application/xml`.
   - Point out payload size (e.g. 135+ KB) and parsing execution time (< 30 ms).
5. Tap **Raw XML Response** sub-tab:
   - Show the actual `<?xml version="1.0" ...?>` XML payload with `<weatherdata>`, `<time>`, `<location>`, `<temperature>`, `<humidity>`, and `<pressure>`.
6. Tap **Normalized Records** sub-tab:
   - Show the structured cards showing parsed temperature in Celsius, wind vectors, and timestamps.
7. Point out the **Persistence & Cloud Sync Status**:
   - Confirms that records were written to SQLite `xml_weather_records` and queued for Firestore.

### Step 7: Inspect the Local SQLite Database (Requirement C)
1. Tap the **Local DB** tab on the bottom navigation bar.
2. Point out the **Database Summary Counters**:
   - Locations count
   - Weather records count
   - XML records count
   - Pending sync queue count
3. Tap through the sub-tabs:
   - **Weather**: inspect saved records with IDs, temperatures, and cloud sync status.
   - **XML Records**: inspect records saved from the XML Explorer.
   - **Sync Queue**: inspect enqueued items awaiting Firestore upload.
   - **Diagnostics**: review SQLite WAL journal mode, foreign key constraints, and last write timestamp.

### Step 8: Cloud Synchronization with Firebase Firestore (Requirement D)
1. Tap the **Cloud Sync** tab on the bottom navigation bar.
2. Point out the **Firestore Status Card**:
   - If configured with `.env`: shows connected project ID and green indicator.
   - If unconfigured: shows *Local-Only SQLite Mode* without false success.
3. Tap **Trigger Manual Cloud Sync**:
   - If connected, shows the live upload batch commit and updates the total synced counter.
4. Point out the **Firestore Collections Schema** documentation explaining deterministic document IDs and security rules.

### Step 9: Offline Resiliency Demonstration
1. On your phone, toggle Airplane Mode ON (or disable Wi-Fi/Mobile Data).
2. Switch back to the **Home** tab and pull down to refresh.
3. Point out that the application does not crash:
   - The top header automatically displays **Offline Cache**.
   - Current weather readings and forecasts load directly from the local SQLite database.
4. Re-enable Wi-Fi/data.

### Step 10: Settings & Unit Conversions
1. Tap the **Settings** tab.
2. Toggle Temperature Unit between **°C** and **°F**.
3. Toggle Wind Speed Unit between **km/h**, **mph**, and **m/s**.
4. Return to the Home tab and verify that every card and chart reflects the chosen units instantly.
