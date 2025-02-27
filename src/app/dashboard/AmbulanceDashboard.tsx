import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
  TrafficLayer, // <---- Importación añadida
} from "@react-google-maps/api";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type LatLngLiteral = { lat: number; lng: number };
type DirectionsResult = google.maps.DirectionsResult | null;
type GoogleMapsRef = google.maps.Map | null;

const containerStyle = { width: "100%", height: "80vh" };
const libraries: ("places")[] = ["places"];

const hospitals: string[] = [
  "Cra. 38 Bis #5B2-04, Santa Isabel, Cali, Valle del Cauca",
  "Circunvalación #9-13, Jamundí, Valle del Cauca",
  "Av. 2 Nte. #24N-157, El Piloto, Cali, Valle del Cauca",
];

const AmbulanceDashboard: React.FC = () => {
  const [origin, setOrigin] = useState<LatLngLiteral | null>(null);
  const [destination, setDestination] = useState<string>("");
  const [directionsResponse, setDirectionsResponse] = useState<DirectionsResult>(null);
  const [destinationMarker, setDestinationMarker] = useState<LatLngLiteral | null>(null);
  const [routeStarted, setRouteStarted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const mapRef = useRef<GoogleMapsRef>(null);
  const user_id = localStorage.getItem("user");
  console.log("ESTE ES EL USER_ID", user_id);
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
        const token = localStorage.getItem("token");
        const user_id = localStorage.getItem("user");

        console.log("Token:", token);
        console.log("User ID:", user_id);

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

  const findClosestHospital = () => {
    if (!origin) return;

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: hospitals,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
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
          setDestination(hospitals[minIndex]);
          setRouteStarted(true);
        }
      }
    );
  };

  
  useEffect(() => {
    const fetchAccidentReports = async () => {
      const token = localStorage.getItem("token");
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
    
  };
  


  const handleClearDestination = () => {
    setDestination("");
    setDirectionsResponse(null);
    setDestinationMarker(null);
    setRouteStarted(false);
    setEstimatedTime("");
  };


  const handleFinalize = async () => {
    // Restablecer el estado a valores predeterminados
    setDestination("");
    setDirectionsResponse(null);
    setDestinationMarker(null);
    setRouteStarted(false);
    setEstimatedTime("");
  
    const token = localStorage.getItem("token");
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
        const user_id = localStorage.getItem("user");
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
            <GoogleMap mapContainerStyle={containerStyle} center={origin!} zoom={15} ref={mapRef}>
              <TrafficLayer /> {/* <---- Capa de tráfico añadida aquí */}
  
              {routeStarted && origin && destination && (
                <DirectionsService
                  options={{
                    origin: origin,
                    destination: destination,
                    provideRouteAlternatives: true,
                    travelMode: google.maps.TravelMode.DRIVING,
                  }}
                  callback={(response) => {
                    if (response && response.status === "OK") {
                      setDirectionsResponse(response);
                      setEstimatedTime(response.routes[0].legs[0].duration.text);
                    }
                  }}
                />
              )}
              {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
              {origin && <Marker position={origin} />}
            </GoogleMap>
          </>
        )}
      </div>
    </LoadScript>
  );
  
};

export default AmbulanceDashboard;
