# UI refinement

The weather dashboard keeps its midnight palette with clearer typography, quieter card surfaces, an illustrated weather hero, and consistent screen headers across all seven screens.

## Responsive behavior

- Content stays centered within 1,120 points on large displays.
- Weather and forecast cards use two columns from 760 points, and stack when the system font scale reaches 1.5.
- Compact navigation shows Home, Forecast, Analytics, and More. XML Data, Local Database, and Cloud Sync remain available through More and the home shortcuts. Wider displays show all seven tabs.
- Tab bar spacing follows the device's bottom safe area. Search hides the tab bar while the keyboard is open.
- Settings controls, record filters, metrics, and headers wrap to fit smaller screens. Maps fit their card instead of the window.
- Screen-reader labels identify search, refresh, chart selections, and metric filters.

The existing data providers, database adapters, Firebase services, and API clients are unchanged. No dependencies were added. Weather hero, daily cards, map temperature, wind, and dew point respect the existing measurement preferences.

## Static rendering

Ionicons load through `useFonts` in the root layout before the native splash hides. This also registers the font during static export so server and browser icon markup agree. Responsive tabs and columns use a consistent initial server snapshot before adapting to the browser width.

## Validation

The local environment exposes Node but not `npx`, so checks use the installed package entry points:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js .
node node_modules/jest/bin/jest.js --runInBand --cacheDirectory .expo/jest-cache
node node_modules/expo/bin/cli export --platform web --output-dir .expo/ui-preview --max-workers 2
```

- TypeScript: no errors.
- ESLint: no errors; 15 existing warnings remain in application/test code.
- Jest: all 25 tests across four suites pass.
- Production web export: all 16 static routes build.
- Chromium: all seven screens checked at 320, 390, 768, and 1,440 pixels; city search, navigation, Fahrenheit selection, and the full forecast link checked with deterministic weather responses.

Browser checks intercept weather requests and block other external requests, including Firebase. They do not validate live cloud writes. iOS and Android hardware/emulator testing was not available in this environment.
