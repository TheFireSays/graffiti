# Demo Status — Web Renderability

**Date:** 2026-03-30
**Branch:** `dev/demo`

## Screen Status

| Screen | Web Status | Native Module | Fix |
|--------|-----------|---------------|-----|
| Welcome | Renders | None | N/A |
| Sign In | Renders | None | N/A |
| Sign Up | Renders | None | N/A |
| Username | Renders | None | N/A |
| Map (index) | Crashes | react-native-maps, expo-location | Web fallback map + mock location |
| Tag/Camera | Crashes | expo-camera, expo-location | Web fallback camera + mock location |
| Crew | Renders | None (data-only) | Mock data |
| Profile | Renders | None (data-only) | Mock data |
| Settings | Renders | None | Mock data |

## Native Modules Needing Fallbacks

1. **react-native-maps** — Used by MapView, TagMarker, ClusterMarker, ZonePolygon
2. **expo-camera** — Used by CameraViewWithHUD
3. **expo-location** — Used by useLocation hook
4. **@sentry/react-native** — Used by error-reporting.ts (silent fail OK)

## Strategy

- Create web fallback components for map and camera
- Hardcode demo location (downtown Austin: 30.2672, -97.7431)
- Mock data for all stores when DEMO_MODE=true
- Platform.OS === 'web' detection for conditional imports
