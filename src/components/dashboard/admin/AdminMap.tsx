import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { HeatmapView } from "@/types/types";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

interface Ambulance {
  id: number;
  plate_number: string;
  ambulance_type: "BASIC" | "UCI";
  status: "available" | "in_use" | "out_of_service";
  capacity: number;
  last_inspection_date: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface Hospital {
  id: number;
  name: string;
  level: string;
  classification: string;
  address: string;
  phone_number: string;
  bed_capacity: number;
  is_available: boolean;
  latitude: number;
  longitude: number;
  description: string;
}

interface Accident {
  id: number;
  description: string;
  is_active: boolean;
  severity: string;
  latitude: number;
  longitude: number;
  address: string;
  type_place: string;
  people_involved: number;
}

interface Props {
  ambulances: Ambulance[];
  hospitals: Hospital[];
  accidents: Accident[];
  centerCoordinates?: { lat: number; lng: number } | null;
}

const AdminMap: React.FC<Props> = ({
  ambulances,
  hospitals,
  accidents,
  centerCoordinates,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [heatmapView, setHeatmapView] = useState<HeatmapView>(null);

  const setupHeatmap = (map: mapboxgl.Map) => {
    // Add ambulance heatmap source and layer
    map.addSource("ambulances-heatmap", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: ambulances.map((a) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [a.longitude, a.latitude],
          },
          properties: {},
        })),
      },
    });
    map.addLayer({
      id: "ambulances-heat",
      type: "heatmap",
      source: "ambulances-heatmap",
      paint: {
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "mag"],
          0,
          0,
          6,
          1,
        ],
        "heatmap-intensity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          1,
          9,
          3,
        ],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)",
        ],
        "heatmap-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          2,
          9,
          20,
        ],
        "heatmap-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          1,
          9,
          0.5,
        ],
      },
    });

    // Add accident heatmap source and layer
    map.addSource("accidents-heatmap", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: accidents
          .filter((a) => a.is_active)
          .map((a) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [a.longitude, a.latitude],
            },
            properties: {},
          })),
      },
    });
    map.addLayer({
      id: "accidents-heat",
      type: "heatmap",
      source: "accidents-heatmap",
      paint: {
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "mag"],
          0,
          0,
          6,
          1,
        ],
        "heatmap-intensity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          1,
          9,
          3,
        ],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0,0,255,0)",
          0.2,
          "rgb(0,255,255)",
          0.4,
          "rgb(0,255,0)",
          0.6,
          "rgb(255,255,0)",
          0.8,
          "rgb(255,165,0)",
          1,
          "rgb(255,0,0)",
        ],
        "heatmap-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          2,
          9,
          20,
        ],
        "heatmap-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          1,
          9,
          0.5,
        ],
      },
    });
  };
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!mapInstance.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-76.532, 3.4516],
        zoom: 12,
      });

      map.on("load", () => {
        if (!mapInstance.current) {
          mapInstance.current = map;
          setupHeatmap(map);
          setHeatmapView(null); // Initially hide both heatmaps
        }
      });
    }
  }, []);
  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    ambulances.forEach((ambulance) => {
      if (!ambulance.latitude || !ambulance.longitude) return;

      const el = document.createElement("div");
      el.textContent = "🚑";
      el.style.fontSize = "24px";
      el.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3>🚑 ${ambulance.plate_number}</h3>
        <p><b>Tipo:</b> ${ambulance.ambulance_type}</p>
        <p><b>Estado:</b> ${ambulance.status}</p>
        <p><b>Capacidad:</b> ${ambulance.capacity}</p>
        <p><b>Última inspección:</b> ${ambulance.last_inspection_date}</p>
        <p><b>Dirección:</b> ${ambulance.address}</p>
      `);

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([ambulance.longitude, ambulance.latitude])
        .setPopup(popup)
        .addTo(mapInstance.current!);

      markersRef.current.push(marker);
    });

    hospitals.forEach((hospital) => {
      if (!hospital.latitude || !hospital.longitude) return;

      const el = document.createElement("div");
      el.textContent = "🏥";
      el.style.fontSize = "26px";
      el.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3>🏥 ${hospital.name}</h3>
        <p><b>Nivel:</b> ${hospital.level}</p>
        <p><b>Clasificación:</b> ${hospital.classification}</p>
        <p><b>Camas:</b> ${hospital.bed_capacity}</p>
        <p><b>Disponible:</b> ${hospital.is_available ? "✅ Sí" : "❌ No"}</p>
        <p><b>Teléfono:</b> ${hospital.phone_number}</p>
        <p><b>Dirección:</b> ${hospital.address}</p>
        <p><i>${hospital.description}</i></p>
      `);

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([hospital.longitude, hospital.latitude])
        .setPopup(popup)
        .addTo(mapInstance.current!);

      markersRef.current.push(marker);
    });

    accidents
      .filter((accident) => accident.is_active)
      .forEach((accident) => {
        if (!accident.latitude || !accident.longitude) return;

        const el = document.createElement("div");
        el.textContent = "⚠️";
        el.style.fontSize = "26px";
        el.style.cursor = "pointer";

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <h3>⚠️ Accidente</h3>
          <p><b>Descripción:</b> ${accident.description}</p>
          <p><b>Severidad:</b> ${accident.severity}</p>
          <p><b>Lugar:</b> ${accident.type_place}</p>
          <p><b>Personas involucradas:</b> ${accident.people_involved}</p>
          <p><b>Dirección:</b> ${accident.address}</p>
        `);

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([accident.longitude, accident.latitude])
          .setPopup(popup)
          .addTo(mapInstance.current!);

        markersRef.current.push(marker);
      });

    if (
      !centerCoordinates &&
      ambulances.length + hospitals.length + accidents.length > 0
    ) {
      const bounds = new mapboxgl.LngLatBounds();
      ambulances.forEach((a) => bounds.extend([a.longitude, a.latitude]));
      hospitals.forEach((h) => bounds.extend([h.longitude, h.latitude]));
      accidents
        .filter((a) => a.is_active)
        .forEach((acc) => bounds.extend([acc.longitude, acc.latitude]));
      mapInstance.current.fitBounds(bounds, { padding: 50 });
    }
  }, [ambulances, hospitals, accidents, centerCoordinates]);

  useEffect(() => {
    if (mapInstance.current && centerCoordinates) {
      mapInstance.current.flyTo({
        center: [centerCoordinates.lng, centerCoordinates.lat],
        zoom: 15,
      });
    }
  }, [centerCoordinates]);

  useEffect(() => {
    if (!mapInstance.current) return;

    if (heatmapView === "ambulances") {
      mapInstance.current.setLayoutProperty(
        "ambulances-heat",
        "visibility",
        "visible"
      );
      mapInstance.current.setLayoutProperty(
        "accidents-heat",
        "visibility",
        "none"
      );
    } else if (heatmapView === "accidents") {
      mapInstance.current.setLayoutProperty(
        "ambulances-heat",
        "visibility",
        "none"
      );
      mapInstance.current.setLayoutProperty(
        "accidents-heat",
        "visibility",
        "visible"
      );
    } else {
      mapInstance.current.setLayoutProperty(
        "ambulances-heat",
        "visibility",
        "none"
      );
      mapInstance.current.setLayoutProperty(
        "accidents-heat",
        "visibility",
        "none"
      );
    }
  }, [heatmapView]);

  return (
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%", borderRadius: "8px" }}
      />
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setHeatmapView("ambulances")}
          style={{
            padding: "10px",
            background: heatmapView === "ambulances" ? "#ddd" : "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Heatmap Ambulancias
        </button>
        <button
          onClick={() => setHeatmapView("accidents")}
          style={{
            padding: "10px",
            background: heatmapView === "accidents" ? "#ddd" : "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Heatmap Accidentes
        </button>
        {heatmapView && (
          <button
            onClick={() => setHeatmapView(null)}
            style={{
              padding: "10px",
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Limpiar Heatmap
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminMap;
