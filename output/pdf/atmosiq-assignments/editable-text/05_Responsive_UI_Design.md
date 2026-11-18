# Designing a clear and responsive application UI

ASSIGNMENT 05 | ATMOSIQ PROJECT

Designing a clear and responsive application UI

Requirement Prepare a good UI for the application.

Current status Implemented and browser-tested at four widths. Native usability still requires a phone check.

Student name ____________________ Roll number ____________________

Design objective

Make the weather easy to scan, the navigation predictable, and the details readable on narrow and wide screens. The current UI uses a midnight background, consistent cards, clear headings, high-contrast text, and cyan accents for interactive and selected elements.

Design decision | User benefit | Implementation

Weather hero and large temperature | Understand the local outlook quickly | WeatherHeroHeader

Four compact tabs | Avoid seven cramped labels on a phone | Responsive tab layout

More and dashboard shortcuts | Keep XML, database, and sync tools reachable | Settings and home hub

Centered width and adaptive columns | Avoid excessively stretched cards | 1,120 point maximum, 760 breakpoint

Safe-area padding and larger controls | Fit device cutouts and touch interaction | Bottom insets and 44-point key controls

Loading, error, and offline states | Explain what the app is currently doing | Home and weather context

Screen organisation

Home prioritizes current conditions and the hourly outlook. Forecast shows daily comparisons. Analytics groups metric filters, charts, and explanations. More contains unit preferences and links to XML Data Explorer, Local Database, and Cloud Sync. These screens retain their existing routes and data operations.

Mobile UI examples

Figure 1. Home and More in the browser preview at a 390-pixel viewport. Example weather data is used for repeatable UI checks.

Interaction and accessibility checks

The search button has an accessible name and expanded state. Refresh and chart targets identify their action or value. Selected metric filters expose selection state. The tab bar respects bottom safe-area insets and hides while the keyboard is open.

Responsive columns stack for system font scales of 1.5 or above. A browser resize check is not a substitute for a real screen-reader, large-text, keyboard, or touch test on a phone.

Verification and honest presentation of data

1. Open Home and locate the current city, temperature, condition, and update time.

2. Search for another city and show selection feedback.

3. Open More and change the temperature unit. Return to Home and verify the formatted temperature.

4. Open each data tool from More. Show that the compact tabs do not remove functionality.

5. Resize the browser or rotate a suitable test device and check readability and touch targets.

Evidence from the completed UI pass

Seven screens were exercised at 320, 390, 768, and 1,440 pixels in Chromium. The 28 checks found no document-level horizontal overflow, and the final run reported no page errors. Search, tab navigation, Fahrenheit selection, and the full-forecast link passed with deterministic responses.

The latest verification also passes TypeScript and all 25 unit tests. Lint has zero errors and 15 existing warnings. These checks reduce regression risk but do not establish native-device behavior or live Firebase access.

Data presentation still to improve

Label or remove illustrative weather values before presentation. The map is a stylized illustration. Moon phase and rise/set labels are fixed, pollen values read None without measured pollen data, and the AQI card falls back to 42 when no value is available. Presenting these as observations would be misleading. Some unit labels in Analytics remain fixed in Celsius and km/h even after preferences change.

What makes the UI responsive?Its layout adapts to available width and font scale rather than assuming one screen size.

Why use a shared design system?Common spacing, colors, typography, and surfaces keep screens consistent and make changes easier to maintain.

Why show an unavailable state?Missing data should be distinguishable from a genuine zero or a measured safe condition.

Source evidence

src/constants/theme.ts line 7

src/components/ui/ResponsiveColumns.tsx line 5

src/hooks/use-wide-layout.ts line 10

src/app/(tabs)/_layout.tsx line 15

src/components/weather/AqiPollenCard.tsx line 12

src/app/(tabs)/index.tsx line 343