import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
  TrafficLayer, 
  Polyline,
} from "@react-google-maps/api";
import { useAuth } from "@/hooks/useAuth";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type LatLngLiteral = { lat: number; lng: number };
type DirectionsResult = google.maps.DirectionsResult | null;
type GoogleMapsRef = google.maps.Map | null;

const containerStyle = { width: "100%", height: "80vh" };
const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const hospitals = [
  { lat: 3.43018335, lng: -76.5454400504182 },
  { lat: 3.2571925, lng: -76.5443504949529 },
];

const AmbulanceDashboard: React.FC = () => {
  const [origin, setOrigin] = useState<LatLngLiteral | null>(null);
  const [destination, setDestination] = useState<string>("");
  const [directionsResponse, setDirectionsResponse] = useState<DirectionsResult>(null);
  const [destinationMarker, setDestinationMarker] = useState<LatLngLiteral | null>(null);
  const [routeStarted, setRouteStarted] = useState<boolean>(false);
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const mapRef = useRef<GoogleMapsRef>(null);
  
  const { token, userId } = useAuth()
  const user_id = userId;
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setOrigin({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (error) => {
          console.error("Error obteniendo la ubicación:", error);
          setLoading(false);
        }
      );
    } else {
      alert("Geolocalización no es compatible con este navegador.");
      setLoading(false);
    }
  }, []);

  //Useeffect para la peticion de origen
  useEffect(() => {
    const interval = setInterval(() => {
      updateAmbulanceLocation();
    }, 1000000);

    return () => clearInterval(interval);
  }, [origin]);

  const updateAmbulanceLocation = async () => {
    if (!origin) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: origin }, async (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;

       
        if (!token || !user_id) {
          console.error("No se encontró el token o user_id en localStorage.");
          return;
        }

        try {
          const response = await fetch(`http://localhost:8000/api/v1/ambulances/${user_id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({
              latitude: origin.lat,
              longitude: origin.lng,
              address: address,
            }),
          });

          if (!response.ok) {
            throw new Error("Error en la solicitud PATCH.");
          }

          console.log("Ubicación de la ambulancia actualizada con éxito.");
        } catch (error) {
          console.error("Error actualizando la ubicación:", error);
        }
      } else {
        console.error("No se pudo obtener la dirección.");
      }
    });
  };

  const findClosestHospital = async () => {
    if (!origin) return;
  
    const service = new window.google.maps.DistanceMatrixService();
    
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: hospitals,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      async (response, status) => {
        if (status === "OK" && response.rows.length > 0) {
          const distances = response.rows[0].elements;
          let minIndex = 0;
          let minDistance = distances[0].distance.value;
  
          for (let i = 1; i < distances.length; i++) {
            if (distances[i].distance.value < minDistance) {
              minDistance = distances[i].distance.value;
              minIndex = i;
            }
          }
  
          const closestHospital = hospitals[minIndex];
          setRouteStarted(true);
  
          // Llamar a la API Routes para obtener la ruta al hospital más cercano
          await getRouteToHospital(closestHospital);
        }
      }
    );
  };
  
  const getRouteToHospital = async (hospital) => {
    if (!origin || !hospital) return;
  
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: hospital.lat,
            longitude: hospital.lng,
          },
        },
      },
      travelMode: "DRIVE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false,
      },
      languageCode: "en-US",
      units: "METRIC",
    };
  
    try {
      const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": googleMapsApiKey,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      if (!response.ok) {
        console.error("Error en la respuesta de Routes API:", response.status, response.statusText);
        return;
      }
  
      const data = await response.json();
  
      if (data.routes && data.routes.length > 0) {
        setRoute(data.routes[0]);
      } else {
        console.error("No se encontró una ruta válida en la respuesta.");
      }
    } catch (error) {
      console.error("Error al obtener la ruta:", error);
    }
  };

  
  useEffect(() => {
    const fetchAccidentReports = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8000/api/v1/accident-reports/", {
          method: "GET",
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) throw new Error("Error en la solicitud GET.");
        
        const data = await response.json();
        console.log("Datos recibidos de la API:", data);

  
        // Filtrar el accidente asignado a la ambulancia con ID y que no esté resuelto
        const assignedAccident = data.find(accident => 
          Number(accident.assigned_ambulance_user_id) === Number(user_id) && !accident.is_resolved
        );
  
        if (assignedAccident && assignedAccident.latitude && assignedAccident.longitude) {
          const lat = parseFloat(assignedAccident.latitude);
          const lng = parseFloat(assignedAccident.longitude);
          
          console.log("Coordenadas del accidente antes de actualizar estado:", lat, lng);
          setDestination({ lat, lng }); // Ahora se usa latitud y longitud en lugar de address
          console.log("Coordenadas del accidente después de actualizar estado:", lat, lng);
        } else {
          console.log("No se encontró un accidente asignado a la ambulancia 1 que no esté resuelto.");
        }
      } catch (error) {
        console.error("Error obteniendo los reportes de accidentes:", error);
      }
    };
  
    fetchAccidentReports();
  }, []);
  
  
  const handleStartRoute = () => {
    
      setRouteStarted(true);
      getRoute();
    
  };
  


  const handleClearDestination = () => {
    setDestination("");
    setRoute(null);
    setDirectionsResponse(null);
    setDestinationMarker(null);
    setRouteStarted(false);
    setEstimatedTime("");
  };


  const handleFinalize = async () => {
    // Restablecer el estado a valores predeterminados
    setRoute(null);
    setDestination("");
    setDirectionsResponse(null);
    setDestinationMarker(null);
    setRouteStarted(false);
    setEstimatedTime("");
  
    if (!token) return;
  
    try {
      // Obtener la lista de accidentes
      const response = await fetch("http://localhost:8000/api/v1/accident-reports/", {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error("Error en la solicitud GET.");
  
      const data = await response.json();
      console.log("Datos recibidos de la API:", data);
  
      // Filtrar el accidente asignado a la ambulancia con ID 1 y que no esté resuelto
      const assignedAccident = data.find(
        (accident) => Number(accident.assigned_ambulance_user_id) === Number(user_id) && !accident.is_resolved
      );
  
      if (assignedAccident) {
        const accidentId = assignedAccident.id;
  
        // PATCH para marcar el accidente como resuelto
        const patchResponse = await fetch(
          `http://localhost:8000/api/v1/accident-reports/${accidentId}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({
              is_active: false,
              is_resolved: true,
            }),
          }
        );
  
        if (!patchResponse.ok) throw new Error("Error al actualizar el accidente.");
        console.log("Accidente marcado como resuelto");
  
        // PATCH para actualizar el estado de la ambulancia
        if (user_id) {
          const ambulanceResponse = await fetch(
            `http://localhost:8000/api/v1/ambulances/${user_id}/`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
              },
              body: JSON.stringify({
                status: "available",
              }),
            }
          );
  
          if (!ambulanceResponse.ok) throw new Error("Error al actualizar la ambulancia.");
          console.log("Estado de la ambulancia actualizado a 'available'");
        }
      }
    } catch (error) {
      console.error("Error en la finalización:", error);
    }
  };
  
  const getRoute = async () => {
    if (!origin || !destination) return;
  
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        },
      },
      travelMode: "DRIVE",
      computeAlternativeRoutes: false,     // Opcional, si lo necesitas
      routeModifiers: {
        avoidTolls: false,                 // Opcional, si lo necesitas
        avoidHighways: false,              // Opcional, si lo necesitas
        avoidFerries: false,               // Opcional, si lo necesitas
      },
      languageCode: "en-US",               // Opcional, si lo necesitas
      units: "IMPERIAL",                   // Opcional, si lo necesitas
    };
  
    console.log("Enviando solicitud a Routes API:", requestBody);
  
    try {
      const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": googleMapsApiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      console.log("Respuesta completa de Routes API:", response);
  
      if (!response.ok) {
        console.error("Error en la respuesta de Routes API:", response.status, response.statusText);
        return;
      }
  
      const data = await response.json();
      console.log("Datos de la API de rutas:", data);
  
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        console.log("ESTO ES EL VERDADERO ROUTE", data.routes[0]) 
        if (route.polyline && route.polyline.encodedPolyline) {
          setRoute(route);
          const encodedPolyline = route.polyline.encodedPolyline;
          console.log('Encoded polyline:', encodedPolyline);
          // Aquí puedes procesar el polyline como lo necesitas
        } else {
          console.error('No se encontró la propiedad "encodedPolyline" en la respuesta');
        }
      } else {
        console.error('No se encontró la propiedad "routes" en la respuesta');
      }
  
    } catch (error) {
      console.error("Error al obtener la ruta:", error);
    }
  };
  
  


  return (
  <LoadScript googleMapsApiKey={googleMapsApiKey || ""} libraries={libraries}>
    <div className="flex flex-col items-center">
      {loading ? (
        <p>Cargando ubicación...</p>
      ) : (
        <>
          <div className="flex mb-4">
            <button className="bg-red-500 text-white p-2 ml-2" onClick={handleClearDestination}>
              Limpiar Destino
            </button>
            <button
              className="bg-green-500 text-white p-2 ml-2"
              onClick={findClosestHospital}
              disabled={!origin}
            >
              Redireccion a Hospital
            </button>
            <button
              className={`bg-blue-500 text-white p-2 ml-2 ${!destination ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleStartRoute}
              disabled={!destination}
            >
              Enrutarme
            </button>
            <button
              className={`bg-red-500 text-white p-2 ml-2 ${!destination ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleFinalize}
              disabled={!destination}
            >
              Finalizado
            </button>
          </div>
          {estimatedTime && <p>Tiempo estimado de llegada: {estimatedTime}</p>}
          <GoogleMap
            mapContainerStyle={{
              height: "600px", // Asegúrate de que el mapa tenga una altura y anchura definidas
              width: "100%",
            }}              
            center={origin!}
            zoom={15}
            ref={mapRef}
          >
            {/* Verificar si google.maps.geometry.encoding está disponible */}
            {console.log("google.maps.geometry.encoding:", google.maps.geometry.encoding.decodePath)}
            {console.log("ESTO ES ROUTE:", route)}
            {origin && <Marker position={origin} />}
            {destination && <Marker position={destination} />}
            {route && route.polyline && route.polyline.encodedPolyline && (
              <>
                {console.log("Polyline codificada:", route.polyline.encodedPolyline)}
                {console.log("Polyline decodificada:", google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline))}
               

                <Polyline
                  path={google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline)}
                  options={{ strokeColor: "#FF0000", strokeWeight: 9 }}
                />
              </>
            )}
          </GoogleMap>
        </>
      )}
    </div>
  </LoadScript>
);

};

export default AmbulanceDashboard;
