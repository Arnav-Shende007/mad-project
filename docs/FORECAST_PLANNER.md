# AtmosIQ forecast planner

The home dashboard shows the selected city's forecast in local time. You can choose an activity, change the briefing language, share a forecast image, move the planner above the briefing, and open RainViewer radar. Personal choices are saved on the device. Language selection applies to the briefing.

## Enable Groq briefings

Use Node 22.19 or later. Put `GROQ_API_KEY` in the server environment or in the ignored project-root `.env.local` for local development. Start the service with `npm run briefing`. It listens on 127.0.0.1:8787 by default. Set HOST and PORT in the server environment when running it behind an HTTPS proxy. The service sends only daily temperature range, maximum wind, rain probability and requested language to Groq's openai/gpt-oss-20b model. Model availability and quotas depend on your Groq account. Responses are cached and upstream requests are limited per server process.

Set `EXPO_PUBLIC_BRIEFING_URL=https://YOUR-HOST/briefing` in the **app** build environment and restart Metro or rebuild the app. A physical phone needs a reachable HTTPS host. The app displays “Ask Groq for a briefing” when a URL is configured. Only the endpoint URL belongs in public Expo variables. The regular forecast works without a server.

## Native features

Rebuild Android after installing dependencies. On macOS generate the iOS project with Expo Prebuild and build with Xcode or EAS. Add the AtmosIQ forecast widget from the operating system's widget gallery. It shows the last saved forecast with its city and timestamp and refreshes when the app receives new weather. Expo Go can preview the dashboard. Home-screen widgets and scheduled reminders need a native build.

Grant notification permission from the weather alerts card. Morning briefings use 07:00 in the selected city. Rain reminders use a 60% threshold and heat reminders use a feels-like temperature of 35°C. Reminders are scheduled from available forecast days and hours and refreshed when the dashboard loads new data. The US warnings card retrieves official active NWS alerts while the app is open. The India link opens IMD advisories.

Check on a physical phone by changing cities, granting and revoking notification permission, adding a widget, sharing a card to another app, and reopening the dashboard offline.
