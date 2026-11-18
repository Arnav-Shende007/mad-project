# Reading data from open REST APIs

ASSIGNMENT 01 | ATMOSIQ PROJECT

Reading data from open REST APIs

Requirement Read data from any open REST or SOAP API.

Current status Implemented using REST. SOAP is not required by the stated either-or requirement.

Student name ____________________ Roll number ____________________

Aim and application context

Use an external service as the source of weather data, rather than entering observations manually. AtmosIQ requests data over HTTPS, converts the response to application models, and presents the selected location in the weather dashboard. The XML workflow is a separate path used for Assignment 2.

Concepts to understand

A REST endpoint identifies a resource using a URL. A GET request retrieves its representation. Query parameters select coordinates, weather variables, forecast duration, and timezone. The response status indicates whether the request succeeded; the Content-Type identifies JSON or XML. An asynchronous request lets the UI remain usable while the network responds.

Service | Role in this app | Response

Open-Meteo forecast | Current weather and hourly and daily forecasts | JSON

Open-Meteo geocoding | Resolve a searched city to coordinates | JSON

Open-Meteo air quality | AQI and pollutant observations | JSON

MET Norway classic | Real XML forecast for the XML explorer | XML

NOAA active alerts | Alternative XML weather alert feed | Atom XML

Request and presentation flow

Figure 1. REST ingestion path implemented by the API client and WeatherProvider.

Implementation and observed endpoint checks

The main client functions are searchCities, fetchForecast, fetchAirQuality, and getCompleteWeatherData in src/api/openMeteo.ts. Forecast and geocoding calls retry once on HTTP 429 or 503. Air quality is optional: the main weather view can still load when that request fails.

GET https://api.open-meteo.com/v1/forecast
  ?latitude=51.5074&longitude=-0.1278
  &current=temperature_2m

const res = await fetch(url);
if (!res.ok) throw new Error(`Forecast API HTTP ${res.status}`);
const body = await res.json();

The code above is a shortened explanation of the implemented request handling, not a separate new endpoint.

Read only check | HTTP result | Content type

Open-Meteo current temperature | 200 | application/json

MET Norway classic XML | 200 | application/xml

NOAA active alerts Atom | 200 | application/atom+xml

These public requests succeeded during this audit. Their availability does not prove that a phone can reach them on the demonstration network. Recheck the endpoints shortly before the presentation.

Example URL for the XML assignment

https://api.met.no/weatherapi/locationforecast/2.0/classic?lat=60.10&amp;lon=9.58

The configured MET Norway URL uses fixed coordinates in Norway. It is independent of the city chosen for the JSON dashboard; do not describe it as that city's forecast.

Error and offline behavior

WeatherProvider attempts to load the latest cached current-weather record when live forecast retrieval fails. This fallback is limited: it does not reconstruct all hourly and daily series. The browser adapter also loses its records after a reload, so phone SQLite is the appropriate persistence demonstration.

Demonstration and individual understanding

1. Open Home and search for a city. Explain the difference between the city label and its latitude and longitude.

2. Refresh the forecast and show the location, conditions, hourly chart, and update time.

3. Open More then XML Data Explorer. Identify the source URL, HTTP status, Content-Type, and raw XML.

4. Explain that JSON powers the main dashboard while genuine XML is parsed and saved by a separate workflow.

Viva questions and concise answers

Why is this a REST integration?The client sends HTTP GET requests to resource URLs with query parameters and consumes the returned representations.

Does the requirement force SOAP?No. It explicitly allows REST or SOAP; this project chooses REST.

Why use async and await?Network operations are asynchronous. The UI can show loading state while a Promise resolves.

What does HTTP 200 prove?That the request succeeded at that moment. It does not prove successful parsing, persistence, or Firebase upload.

What is the difference between JSON parsing and XML parsing?JSON is decoded with res.json(). XML text is validated and processed with fast-xml-parser, including element attributes.

Result and remaining work

Requirement 1 is supported by both code and successful public endpoint checks. Improvements still needed include a configurable contact identity for the MET Norway User-Agent and clearer separation of the fixed XML location from the selected city. MET Norway documents its classic XML format as deprecated, so retain an alternative XML source and recheck availability.

Source evidence

src/api/openMeteo.ts line 114

src/api/xmlWeatherApi.ts line 46

src/state/weatherContext.tsx line 66

Open-Meteo forecast reference

MET Norway Locationforecast reference