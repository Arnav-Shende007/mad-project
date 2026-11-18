# Deploying and demonstrating the app on a phone

ASSIGNMENT 07 | ATMOSIQ PROJECT

Deploying and demonstrating the app on a phone

Requirement Deploy the app on a mobile device during the demonstration.

Current status Pending physical-device execution and evidence. The repository does not contain an EAS build configuration or an installation artifact.

Student name ____________________ Roll number ____________________

Aim and required proof

Run AtmosIQ on a real phone and demonstrate the complete data workflow. A browser screenshot, a passing unit test, or a GitHub push is not proof of mobile deployment. The demonstration should establish navigation, live API use, XML parsing, durable SQLite storage, visible analysis, and Firebase persistence.

Figure 1. Demonstration sequence. The phone and cloud verification stages still need to be performed.

Choose a demonstration route

Route | What is needed | What it demonstrates

Expo Go if SDK compatible | Expo Go version compatible with SDK 57 and reachable development server | App running in the Expo Go host; not a standalone install

Development build | Configure EAS and expo-dev-client; build and install on the phone | Own native development app, normally connected to Metro

Android internal preview | An EAS preview profile producing an APK | Standalone install suitable for a reliable offline launch

The project already uses SDK 57 and native SQLite. Confirm Expo Go compatibility rather than assuming that any Expo Go version will load the project. A development client requires expo-dev-client, which is not currently listed in package.json. No native ios or android directories need to be created by hand.

Preparation commands and installation plan

Run the current application through a compatible host

npm ci
npx expo-doctor
npx tsc --noEmit
npx expo lint
npm test -- --runInBand
npx expo start

# If LAN access is blocked and tunnel support is available
npx expo start --tunnel

Use a trusted terminal on the development computer. Put the phone and computer on the same reachable network for LAN mode, open the QR link in the compatible app, and wait for bundling. Keep the development server running for this route. Tunnel availability depends on the local setup and network.

Optional EAS development or preview build

npx eas-cli@latest login
npx eas-cli@latest build:configure

# Only for the development-client route
npx expo install expo-dev-client
npx eas-cli@latest build --platform android --profile development
npx expo start --dev-client

# After defining a preview profile that produces an APK
npx eas-cli@latest build --platform android --profile preview

These are preparation instructions, not commands executed during this audit. The preview profile must be defined in eas.json; the word preview alone does not create it. Configure the required EXPO_PUBLIC_FIREBASE values for the build environment. Client configuration is not a substitute for Firestore rules, and an admin service-account key must never be bundled in the app.

Android installation requires a completed APK or development-build link. Physical iPhone installation requires an appropriate signing and distribution route. Store publication is not explicitly required by the assignment; a working physical-device demonstration is the stated goal.

Presentation script and evidence checklist

1. Launch AtmosIQ on the phone. State the device model, OS, build or host, and app version.

2. Open Home, select a city, and refresh the live weather. Explain the REST URL and response format.

3. Show Forecast and Analytics. Explain one summary calculation and one chart.

4. Open XML Data Explorer, choose MET Norway, fetch the real XML, and show one source value and its parsed record.

5. Show the same record in Local Database. Close and reopen the app to verify it remains on the device.

6. Show matching Firebase documents in the console. Use the source timestamp and ID to correlate local and cloud rows. Do not rely only on the Connected badge.

7. Repeat a failure and recovery scenario after the retry gaps have been corrected. Explain what is cached and what is unavailable offline.

Capture during the real demonstration | Completion criterion

Phone launch image | Device and running app visible

Live XML request | Source URL, status, raw XML, and parsed count visible

SQLite restart check | Same record present after reopening

Firebase console image | Matching import and measurement documents visible

Analysis explanation | Input series, formula, unit, and chart described

Personal understanding | Student can trace one record through the code

Does Expo Go count as a standalone app?No. It runs the JavaScript inside the Expo Go host. Confirm whether the examiner accepts this route.

Why use a preview APK?It avoids depending on Metro for launch and is easier to rehearse as an installed Android application.

What is left to finish?Choose a device route, configure and build if needed, install, rehearse the complete workflow, and capture genuine phone and cloud evidence.

Source evidence

app.json line 15

package.json line 5

src/state/weatherContext.tsx line 148

Expo environment setup

EAS Build introduction

Development build configuration