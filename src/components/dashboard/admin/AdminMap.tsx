import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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
}

const AdminMap: React.FC<Props> = ({ ambulances, hospitals, accidents }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!mapInstance.current) {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-76.5320, 3.4516],
        zoom: 12,
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

    if (ambulances.length + hospitals.length + accidents.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      ambulances.forEach((a) => bounds.extend([a.longitude, a.latitude]));
      hospitals.forEach((h) => bounds.extend([h.longitude, h.latitude]));
      accidents
        .filter((a) => a.is_active)
        .forEach((acc) => bounds.extend([acc.longitude, acc.latitude]));
      mapInstance.current.fitBounds(bounds, { padding: 50 });
    }
  }, [ambulances, hospitals, accidents]);

  return (
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%", borderRadius: "8px" }}
      />
    </div>
  );
};

export default AdminMap;
