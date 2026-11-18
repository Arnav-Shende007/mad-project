# Running the application across platforms

ASSIGNMENT 06 | ATMOSIQ PROJECT

Running the application across platforms

Requirement The application should run for all types of operating systems.

Current status Android, iOS, and web are the intended targets. Browser behavior is verified; native phone execution and desktop app packages are not verified.

Student name ____________________ Roll number ____________________

Scope and interpretation

React Native components and Expo Router are shared across the mobile and browser builds. This repository targets Android and iOS apps plus a website. Windows, macOS, and Linux users can access the web version in a browser; there is no implemented native desktop packaging target. Confirm whether the examiner means these platforms or literally expects native software for every desktop OS.

Platform | Current target | Evidence and limitation

Android | Native Expo application | Package identifier configured; physical-device execution not established

iOS | Native Expo application | Bundle identifier configured; signing and device execution not established

Web | Static browser application | Production export and responsive Chromium checks pass

Windows macOS Linux | Browser access to web build | Not separate native desktop applications

Shared and platform-specific code

Platform resolution chooses storageAdapter.native.ts on mobile and storageAdapter.ts for web. Native code uses expo-sqlite and an on-device atmosiq.db file. The web adapter uses JavaScript Map objects and imitates selected SQL statements. It is not browser SQLite and is not durable storage.

Responsive browser evidence and platform risks

Figure 1. Actual wide browser preview of Home with deterministic example data. This establishes responsive rendering, not native desktop installation.

Platform differences to explain

Native apps have device safe areas and a software keyboard. Web builds run under browser network policies, including CORS and restrictions on request headers. A User-Agent accepted in a Node or native request may not be controllable by browser JavaScript.

The web adapter does not enforce the full SQL semantics or foreign keys. Its INSERT mapping assumes one parameter per column, even where the repository SQL uses literal values. Consequently, browser counters and queue behavior are not proof that native persistence works.

Icon fonts are loaded in the root layout. Responsive columns and tabs use an initial server snapshot that agrees with static HTML before adapting to the browser width. This avoids the initial markup differences found during UI testing.

Platform test matrix and demonstration steps

Test | Android phone | iPhone | Browser

Launch and navigation | Pending | Pending | Passed

Responsive screens and charts | Pending | Pending | Passed with fixtures

Restart persistence | Must verify native SQLite | Must verify native SQLite | Not durable in current adapter

Live XML request | Pending on demo network | Pending on demo network | Not proven by fixture checks

Live Firestore readback | Pending | Pending | Not performed

Native install package | Not recorded | Not recorded | Not applicable

1. Choose an Android phone as the primary demonstration device and run the complete checklist in Assignment 7.

2. If iOS is required, repeat the same data and persistence checks on an actual iPhone or an approved simulator.

3. Start or host the static web build and check the supported browsers. Explain that browser storage currently differs from mobile SQLite.

4. Record the tested OS version, device model, app version, and result for each platform rather than claiming universal support from one screenshot.

Viva questions and conclusion

Does one codebase mean identical execution everywhere?No. The shared UI still relies on platform-specific storage, browser policies, native modules, and signing.

Does a successful web export prove an APK works?No. Export verifies a web bundle, not a native Android build or runtime.

What remains for this assignment?Native Android and iOS test evidence, durable web persistence if required, and agreement on whether browser access satisfies desktop OS coverage.

Source evidence

app.json line 14

package.json line 8

src/database/storageAdapter.native.ts line 17

src/database/storageAdapter.ts line 13

src/app/_layout.tsx line 19

Expo SDK 57 reference

Expo web development reference