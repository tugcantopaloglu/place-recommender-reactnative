# Place Recommender

An Expo and React Native application for finding places based on location and
preferences, saving favorites and visit plans, and configuring recommendations
and notifications. The interface is in Turkish. The code uses Firebase,
Google Places, native maps, React Navigation and Redux Toolkit.

![Application icon](assets/icon.png)

## Development

Use Node.js 22 and npm with the committed lockfile:

```bash
npm ci
npm start
```

The app remains on Expo SDK 52 and React Native 0.76. Keep SDK-compatible native
module versions together. A development build is required for native map and
background location behavior; a JavaScript bundle alone is not a native app build.

Configure the Firebase project in `src/config/firebase.ts`, Google Places access
in the places service, and OAuth clients in the authentication code for your
application identifiers. Provider configuration and platform identifiers must
match the intended Firebase and Google projects. Existing values are not replaced
by the validation scripts.

## Checks

```bash
npm run type-check
npm test
npm run bundle
```

Type checking covers the full source tree. Tests exercise the actual TypeScript
notification and store modules with isolated native and Firebase dependencies.
They verify task registration before tracking starts, persisted user binding,
permission denial, empty events, the daily trigger and the settings reducer.
The bundle command exports Android and iOS Hermes bundles and assets into `dist`.
CI runs these checks on pushes and pull requests without publishing an app.

These checks do not verify Firebase authentication, OAuth sign-in, Google Places
responses, device map rendering, background location delivery, notification
permissions or store distribution. Test those on real development builds with
the configured provider accounts before shipping.

## Background location

The location task is defined at module scope using `expo-task-manager`. Tracking
stores the active user's identifier locally before starting native updates. The
task reads that identifier for events after a process restart. Stopping tracking
removes it. Permission denial prevents a task from starting.

The `expo-location` plugin enables the iOS background mode and Android background
and foreground-service permissions in generated native projects. Native changes
require rebuilding the development client. Foreground and background location
permissions still require user consent on the device.

## Source layout

- `App.tsx` supplies the Redux store and theme provider.
- `src/navigation/` contains authentication and main navigation.
- `src/store/slices/` contains authentication, places, favorites and settings state.
- `src/services/` handles provider requests, recommendations and notifications.
- `src/screens/` and `src/components/` contain the application UI.

## Dependency maintenance

Compatible dependency updates and removal of unused self-reference and legacy
Google sign-in packages reduce the original audit findings. The retained SDK 52
dependency graph still has reported vulnerabilities, including a critical finding.
Use `npm audit` to inspect the current graph. A coordinated Expo/Firebase upgrade
needs type checking, bundling and native/provider acceptance; an automatic forced
downgrade does not establish compatibility.

See [privacy-policy.md](privacy-policy.md) and
[terms-of-service.md](terms-of-service.md) for the existing application policies.
