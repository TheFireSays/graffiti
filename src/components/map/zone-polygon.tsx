import { Polygon } from "react-native-maps";
import type { MapZone } from "../../lib/geo";

interface ZonePolygonProps {
  zone: MapZone;
  onPress?: (zone: MapZone) => void;
}

const UNCONTROLLED_COLOR = "#444444";

export function ZonePolygon({ zone, onPress }: ZonePolygonProps) {
  const fillColor = zone.controllingCrewColor ?? UNCONTROLLED_COLOR;

  return (
    <Polygon
      coordinates={zone.coordinates}
      fillColor={hexToRgba(fillColor, 0.2)}
      strokeColor={hexToRgba(fillColor, 0.6)}
      strokeWidth={2}
      tappable={!!onPress}
      onPress={() => onPress?.(zone)}
    />
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
