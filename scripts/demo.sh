#!/bin/bash
# Launch Graffiti in demo mode (web browser, mock data, no backend required)
export EXPO_PUBLIC_DEMO_MODE=true
npx expo start --web --port 8081
