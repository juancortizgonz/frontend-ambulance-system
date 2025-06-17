import { useRef, useEffect } from "react"
import mapboxgl from "mapbox-gl"

import 'mapbox-gl/dist/mapbox-gl.css'

const MapContainer = () => {
    const mapRef = useRef<any>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)

    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    const HOSPITAL_DATA = import.meta.env.VITE_HOSPITAL_DATA_URL

    useEffect(() => {
        mapboxgl.accessToken = MAPBOX_TOKEN
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current as HTMLDivElement,
            style: 'mapbox://styles/juancortizgonz/cm8g9tvvs014901s5hv2p1rcf',
            center: [-76.53335893302167, 3.4495788844945596],
            zoom: 12,
        })

        mapRef.current.on('load', () => {
      const layerId = 'data-hospital-cali-cookeh'

    interface HospitalFeatureProperties {
      title?: string;
      description?: string;
      [key: string]: any;
    }

    interface HospitalFeature {
      type: string;
      geometry: {
        type: string;
        coordinates: number[];
      };
      properties: HospitalFeatureProperties;
    }

    mapRef.current.on('click', layerId, (e: mapboxgl.MapLayerMouseEvent & { features?: HospitalFeature[] }) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const coordinates = feature.geometry.coordinates.slice();
      const props = feature.properties;

      const popupHTML = `
        <h3>${props.name || 'Sin título'}</h3>
      `;

      new mapboxgl.Popup()
        .setLngLat(coordinates as [number, number])
        .setHTML(popupHTML)
        .addTo(mapRef.current);
    });

      mapRef.current.on('mouseenter', layerId, () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });
      mapRef.current.on('mouseleave', layerId, () => {
        mapRef.current.getCanvas().style.cursor = '';
      });
    });

        return () => {
            mapRef.current?.remove()
        }
    }, [])

    return (
        <>
            <div ref={mapContainerRef} className="bg-red-400 w-full h-screen" id="map-container" />
        </>
    );
}

export default MapContainer