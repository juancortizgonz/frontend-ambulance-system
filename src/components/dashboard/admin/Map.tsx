import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl"; 

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

interface MapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
}

const Map: React.FC<MapProps> = ({ latitude, longitude, onLocationChange }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [longitude, latitude],
        zoom: 14,
      });

      const marker = new mapboxgl.Marker({ draggable: true })
        .setLngLat([longitude, latitude])
        .addTo(mapInstance.current);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        if (onLocationChange) {
          onLocationChange(lngLat.lat, lngLat.lng);
        }
      });
    }
  }, [latitude, longitude, onLocationChange]);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "400px", borderRadius: "8px" }}
    />
  );
};

export default Map;
