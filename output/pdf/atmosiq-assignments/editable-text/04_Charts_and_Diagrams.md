# Displaying analysis with charts and diagrams

ASSIGNMENT 04 | ATMOSIQ PROJECT

Displaying analysis with charts and diagrams

Requirement Use charts and diagrams to display analysed data.

Current status Implemented with interactive SVG charts and application architecture diagrams.

Student name ____________________ Roll number ____________________

Aim and choice of visual representation

Use a chart to show numerical change and a diagram to explain system relationships. AtmosIQ uses line charts for a value across a sequence and paired bars for daily high and low temperatures. KPI cards support the charts with summary values.

Visual | Data or concept | Screen

Hourly line or area chart | Temperature sequence and precipitation probabilities | Home

Interactive line chart | Selected metric over the chosen period | Analytics

Paired bar chart | Daily maximum and minimum temperatures | Forecast

Precipitation line chart | Daily rainfall totals | Forecast

System architecture diagram | API, processing, storage, and presentation | Analytics

Sync flow diagram | Local writes, queue, and cloud synchronization | Analytics

From values to plot coordinates

Each chart measures the space available inside its container. A data index becomes an x coordinate, and a value is scaled into the plot height. Larger values appear higher because screen coordinates increase downward. Grid lines, labels, and units help users interpret the result.

x = leftPadding + i / (n - 1) * plotWidth
y = topPadding + plotHeight
    - (value - minimum) / range * plotHeight

The implementation guards the single-point denominator and a zero value range. Interactive targets update the selected observation and the value shown above the chart.

Application screenshots

Figure 1. Actual browser renders of Analytics and Forecast with deterministic example weather responses. These are UI examples, not evidence of a live phone run.

Reading the charts during presentation

On the line chart, identify the metric, unit, time window, and selected value. On the forecast chart, distinguish the maximum-temperature series from the minimum-temperature series. Explain that bars group values by day, while a line makes the progression across time easier to follow.

The screenshots establish that the visual components render in the browser preview. They do not establish native GPU performance or prove that a live external request was made while the image was captured.

Architecture explanation and viva preparation

Figure 2. Current project data paths. JSON weather feeds the statistics and charts directly and is also saved locally. Parsed XML is saved locally and uploaded separately; it does not currently feed the analytics screen.

1. Open Forecast. Tap different bar groups and read the selected high and low values.

2. Open Analytics. Change a supported metric and time period, then select a point.

3. Scroll to System Architecture and explain the purpose of each stage.

4. Explain the local database and sync queue. State the current incomplete XML retry behavior rather than describing the diagram as proof that all retries work.

Viva questions and concise answers

Why use a line chart?It makes change across an ordered time sequence easy to compare.

Why show paired bars for maximum and minimum?Two related values can be compared within each day and across days.

What is the difference between a diagram and a chart?A chart encodes measurements; a diagram explains relationships, stages, or control flow.

Why use SVG?Vector elements scale with the container and can be composed into paths, bars, labels, and selectable points.

Why are labels and units necessary?A curve alone does not identify the measured quantity, scale, or time period.

Result and remaining work

The chart and diagram requirement is implemented. Before the exam, correct unsupported period filters and ensure the displayed KPI population matches the chart period. Real XML charts should be added if the examiner requires analysis of the same XML records that are persisted. The visual radar map is artwork, not an analysed geospatial layer.

Source evidence

src/components/charts/InteractiveLineChart.tsx line 26

src/components/charts/InteractiveBarChart.tsx line 26

src/components/diagrams/SystemArchitectureDiagram.tsx line 22

src/components/diagrams/SyncFlowDiagram.tsx line 11

src/app/(tabs)/forecast.tsx line 26