import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { useMapStore } from "../../stores/map-store";
import { DEMO_LOCATION } from "../../lib/config";

interface MapWebFallbackProps {
  userLocation: { latitude: number; longitude: number } | null;
}

export function MapWebFallback({ userLocation }: MapWebFallbackProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<unknown>(null);
  const polygonsRef = useRef<Map<string, unknown>>(new Map());

  const zones = useMapStore((s) => s.zones);
  const tags = useMapStore((s) => s.tags);
  const selectTag = useMapStore((s) => s.selectTag);
  const selectZone = useMapStore((s) => s.selectZone);
  const selectedZone = useMapStore((s) => s.selectedZone);
  const selectedTag = useMapStore((s) => s.selectedTag);

  const center = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [DEMO_LOCATION.latitude, DEMO_LOCATION.longitude];

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (!mapRef.current || leafletRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { center: center as [number, number], zoom: 15 });
      leafletRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Zone polygons
      zones.forEach((zone) => {
        if (!zone.coordinates?.length) return;
        const coords = zone.coordinates.map((c) => [c.latitude, c.longitude] as [number, number]);
        const color = zone.controllingCrewColor ?? "#444444";
        const polygon = L.polygon(coords, { color, fillColor: color, fillOpacity: 0.25, weight: 2 }).addTo(map);
        polygon.bindTooltip(
          `<b>${zone.name}</b><br/>${zone.controllingCrewAbbreviation ? `Controlled by ${zone.controllingCrewAbbreviation}` : "Unclaimed"}`,
          { permanent: false, className: "graffiti-tooltip" }
        );
        polygon.on("click", () => selectZone(zone));
        polygonsRef.current.set(zone.id, polygon);
      });

      // Tag markers
      tags.forEach((tag) => {
        if (!tag.latitude || !tag.longitude) return;
        const color = tag.crewColor ?? "#999999";
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:${color};border:2px solid white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:bold;color:white;box-shadow:0 2px 6px rgba(0,0,0,0.6);cursor:pointer;">${tag.crewAbbreviation ?? "?"}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([tag.latitude, tag.longitude], { icon }).addTo(map);
        marker.on("click", () => selectTag(tag));
        polygonsRef.current.set(`tag-${tag.id}`, marker);
      });

      // User location
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="background:#4ecdc4;border:3px solid white;border-radius:50%;width:16px;height:16px;box-shadow:0 0 0 4px rgba(78,205,196,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon }).addTo(map).bindTooltip("You");
      }

      // Styles
      const style = document.createElement("style");
      style.textContent = `
        .graffiti-tooltip { background:#1a1a2e; color:#fff; border:1px solid #333; border-radius:6px; font-size:12px; }
        .leaflet-tooltip-top:before { border-top-color:#333; }
        @keyframes zone-pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .zone-highlighted { animation: zone-pulse 1s ease-in-out 3; }
      `;
      document.head.appendChild(style);
    });

    return () => {
      if (leafletRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (leafletRef.current as any).remove();
        leafletRef.current = null;
        polygonsRef.current.clear();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to selected zone — pan + highlight
  useEffect(() => {
    if (!leafletRef.current) return;
    const map = leafletRef.current as any;

    // Reset all zones to normal style
    zones.forEach((zone) => {
      const poly = polygonsRef.current.get(zone.id) as any;
      if (!poly) return;
      const color = zone.controllingCrewColor ?? "#444444";
      poly.setStyle({ color, fillColor: color, fillOpacity: 0.25, weight: 2 });
    });

    if (!selectedZone) return;

    const poly = polygonsRef.current.get(selectedZone.id) as any;
    if (!poly) return;

    // Highlight selected zone
    poly.setStyle({ color: "#ffffff", fillColor: selectedZone.controllingCrewColor ?? "#4ecdc4", fillOpacity: 0.45, weight: 3 });

    // Pan to zone center
    if (selectedZone.coordinates?.length) {
      import("leaflet").then((L) => {
        const coords = selectedZone.coordinates!.map((c) => [c.latitude, c.longitude] as [number, number]);
        const bounds = L.latLngBounds(coords);
        map.flyToBounds(bounds, { padding: [40, 40], duration: 0.8 });
      });
    }
  }, [selectedZone, zones]);

  // React to selected tag — pan to it
  useEffect(() => {
    if (!leafletRef.current || !selectedTag?.latitude || !selectedTag?.longitude) return;
    const map = leafletRef.current as any;

    // Pulse the tag marker
    const marker = polygonsRef.current.get(`tag-${selectedTag.id}`) as any;
    if (marker) {
      const el = marker.getElement();
      if (el) {
        el.style.transform += " scale(1.6)";
        el.style.transition = "transform 0.2s ease";
        el.style.zIndex = "1000";
        setTimeout(() => {
          el.style.transform = el.style.transform.replace(" scale(1.6)", "");
        }, 600);
      }
    }

    map.flyTo([selectedTag.latitude, selectedTag.longitude], 17, { duration: 0.8 });
  }, [selectedTag]);

  return (
    <View style={styles.container}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
