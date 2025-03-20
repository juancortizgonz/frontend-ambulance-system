import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

import 'mapbox-gl/dist/mapbox-gl.css';

import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE, INITIAL_CENTER, INITIAL_ZOOM } from "@/config/mapbox";

const MapPage = () => {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    const [center, setCenter] = useState<[number, number]>(INITIAL_CENTER)
    const [zoom, setZoom] = useState(INITIAL_ZOOM)

    useEffect(() => {
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        if (mapContainerRef.current) {
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: center,
            zoom: zoom,
            style: MAPBOX_STYLE
          });
        }

        if (mapRef.current) {
          mapRef.current.on('move', () => {
              const mapCenter = mapRef.current?.getCenter();
              const mapZoom = mapRef.current?.getZoom();
        
              if (mapCenter) {
                setCenter([mapCenter.lng, mapCenter.lat]);
              }
              if (mapZoom !== undefined) {
                setZoom(mapZoom);
              }
          });
        }
    
        return () => {
          if (mapRef.current) {
            mapRef.current.remove();
          }
        }
      }, [])

    const handleGoBack = () => {
        window.location.href = "/";
    };

  return (
    <>
        {/* Location information */}
        <div className="z-10 absolute bottom-0 right-0 m-3 bg-red-600 text-white px-4 py-2 border rounded-lg">
            Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
        </div>

        {/* Map */}
        <div id="map-container" className="h-screen w-full bg-red-700" ref={mapContainerRef} />

        {/* Back button */}
        <button
            onClick={handleGoBack}
            className="self-start mb-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition z-10 absolute top-0 left-0 m-3"
        >
            ← Regresar
        </button>
    </>
  );
};

export default MapPage;
