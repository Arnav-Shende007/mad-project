# Analysing weather data before display

ASSIGNMENT 03 | ATMOSIQ PROJECT

Analysing weather data before display

Requirement Perform analysis while displaying the data.

Current status Implemented for the Open-Meteo dataset. XML-derived analysis is not currently connected to the analytics screen.

Student name ____________________ Roll number ____________________

Aim and distinction from raw display

Turn weather readings into summaries that make patterns easier to explain. Showing a temperature is raw display; calculating mean temperature, dispersion, a trend, and a data-derived statement is analysis. WeatherProvider calls computeWeatherAnalytics after fetching the JSON weather dataset and passes the result to the analytics UI.

Figure 1. Analysis path. The XML workflow currently stores its report separately from these weather analytics.

Analysis | Implemented operation | Interpretation

Temperature | Mean, median, extremes, range, standard deviation | Typical value and spread

Trend | Least-squares slope of daily high temperatures | Rising, falling, or stable

Precipitation | Total, mean, wettest day, rainy-day count | Amount and distribution of rain

Wind | Mean and maximum speed, direction label | Wind conditions across the series

Atmosphere and AQI | Humidity, pressure trend, AQI category | Additional environmental context

Data quality rules

sanitizeNumbers removes null, undefined, NaN, and non-finite values. Empty series return zero summaries with sampleCount zero. During presentation, explain that a zero with no samples means unavailable data, not a confirmed physical zero. Rounding is used for presentation-friendly numerical results.

Worked calculations and their meaning

Use the illustrative sequence 22, 24, 26, 28 C. This small example is for explaining the algorithm and is not a live weather result.

Metric | Calculation | Result

Mean | (22 + 24 + 26 + 28) / 4 | 25 C

Median | Middle pair average (24 + 26) / 2 | 25 C

Minimum and maximum | Smallest and largest values | 22 C and 28 C

Range | 28 - 22 | 6 C

Population variance | (9 + 1 + 1 + 9) / 4 | 5 C squared

Population standard deviation | Square root of 5 | 2.24 C

Linear trend slope | x indices 0, 1, 2, 3 | 2 C per sample

Formulas used by the project

mean = sum(values) / n
range = maximum - minimum
standard deviation = sqrt(sum((x - mean)^2) / n)

slope = (n*sum(i*y) - sum(i)*sum(y))
        / (n*sum(i*i) - sum(i)*sum(i))

trend = RISING  when slope > 0.4
        FALLING when slope < -0.4
        STABLE  otherwise

The standard deviation implementation divides by n, so it is a population statistic. It is not the sample estimator that divides by n minus 1. A slope is per sample index; it represents per day only when the series contains evenly spaced daily values.

The precipitation code counts a rainy day when precipitationSum is at least 0.5 mm. Present this as an application rule. Natural-language insights are deterministic statements derived from these summaries; the project does not train a machine-learning forecasting model.

Demonstration and analytical limitations

1. Open Analytics and select temperature. Read the mean, median, minimum, maximum, range, and standard-deviation cards.

2. Choose a data point in the chart and explain the selected value separately from a multi-observation summary.

3. Switch to precipitation and wind. Describe the unit and the chosen period.

4. Choose one generated insight and trace it to a formula and the relevant hourly or daily series.

Corrections recommended before final presentation

Period consistency. Temperature KPI summaries use the full hourly array, which can contain 48 observations, while the chart can show 24 hours. Pressure and AQI retain hourly data even when the interface says 7 days. Make the filters change both data and labels, or disable unsupported combinations.

Time alignment. The API mapping takes the first 48 hourly entries, which can start at midnight. Filter from the selected location's current time before labelling the first entry Now.

Wind direction. An arithmetic average of angles is unreliable around north: 350 and 10 degrees average numerically to 180. Use a circular mean for the direction summary.

XML connection. If the examiner expects the same XML records to be stored and analysed, add an XML analysis view. Current charts use JSON forecast data, not xmlReport.records. Confirm this interpretation rather than claiming one unified data pipeline.

Why can mean and median differ?The mean is sensitive to extreme values. The median depends on the ordered middle position.

What does standard deviation describe?How widely the values are dispersed around their mean, in the original unit.

Does positive slope prove that tomorrow will be warmer?No. It summarizes the supplied sequence; it is not a causal claim or a new forecast.

Source evidence

src/analytics/statistics.ts line 20

src/analytics/statistics.ts line 71

src/analytics/weatherAnalytics.ts line 25

src/app/(tabs)/analytics.tsx line 102

src/api/openMeteo.ts line 292