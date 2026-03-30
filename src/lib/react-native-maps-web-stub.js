// Web stub for react-native-maps — native map components are not available in browsers.
// The map screen uses map-web-fallback.tsx on web instead.
const React = require("react");
const { View } = require("react-native");

const Stub = () => React.createElement(View, null);

module.exports = {
  default: Stub,
  MapView: Stub,
  Marker: Stub,
  Polygon: Stub,
  Polyline: Stub,
  Circle: Stub,
  Callout: Stub,
  CalloutSubview: Stub,
  Overlay: Stub,
  UrlTile: Stub,
  WMSTile: Stub,
  LocalTile: Stub,
  Geojson: Stub,
  AnimatedRegion: class {},
  PROVIDER_GOOGLE: "google",
  PROVIDER_DEFAULT: null,
  MAP_TYPES: {},
};
