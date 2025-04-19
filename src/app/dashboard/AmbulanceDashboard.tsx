import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";

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
import Footer from "@/components/Footer";

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
  const [lastRouteAction, setLastRouteAction] = useState<"hospital" | "accidente" | null>(null);
  const [origin, setOrigin] = useState<LatLngLiteral | null>(null);
  const [destination, setDestination] = useState<LatLngLiteral | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<DirectionsResult>(null);
  const [routeStarted, setRouteStarted] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [showEndRouteModal, setEndRouteShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Estado para mostrar/ocultar el modal
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [closestHospital, setClosestHospital] = useState<LatLngLiteral | null>(null); // Estado para almacenar el hospital más cercano
  const [hasShownModal, setHasShownModal] = useState(false); // Nueva bandera para controlar la visualización del modal

  const originIcon = window.google?.maps
  ? {
      url: "https://img.icons8.com/plasticine/100/ambulance.png",
      scaledSize: { width: 40, height: 40 }, 
    }
  : undefined;

const destinationIcon = window.google?.maps
  ? {
      url: "https://img.icons8.com/color/48/car-crash.png",
      scaledSize: { width: 50, height: 50 }, 
    }
  : undefined;

const hospitalIcon = window.google?.maps
  ? {
      url: "https://img.icons8.com/dusk/64/hospital.png",
      scaledSize: { width: 40, height: 40 }, 
    }
  : undefined;

  const playSound = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(utterance);
  };

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

  //Useeffect para enviar la posicion de la ambulancia a la base de datos con una direccion humana.
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
          setClosestHospital(closestHospital); // Guardamos el hospital más cercano en el estado
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
          setDestination({ lat, lng }); 
          setSelectedAccident(assignedAccident);
          if (!hasShownModal) {
            setShowModal(true); // Mostrar el modal 
            setHasShownModal(true); // Marcar que ya se mostró el modal
            playSound("Accidente recibido"); // Reproducir sonido de alerta
          }
        } else {
          console.log("No se encontró un accidente asignado a la ambulancia 1 que no esté resuelto.");
        }
      } catch (error) {
        console.error("Error obteniendo los reportes de accidentes:", error);
      }
    };
    fetchAccidentReports(); // Ejecutar la primera vez de inmediato

    // Ejecutar la función de forma periódica
    const intervalId = setInterval(fetchAccidentReports, 12000); // Cada 10 segundos

    // Limpiar intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [token, user_id, hasShownModal]); // Agregar 'hasShownModal' a las dependencias

  
  
  const handleStartRoute = () => {
    
      setRouteStarted(true);
      getRoute();
    
  };
  


  const handleClearDestination = () => {
    setDestination(null);
    setRoute(null);
    setDirectionsResponse(null);
    setRouteStarted(false);
    setEstimatedTime("");
    setSelectedAccident(null);
    setClosestHospital(null)
  };

  const handleFinalize = async () => {
    setShowConfirmModal(true); // Mostrar el modal de confirmación
  };

  const handleConfirmFinalize  = async () => {

    setShowConfirmModal(false); 
    setLastRouteAction(null);
    setRoute(null);
    setDestination(null);
    setClosestHospital(null)
    setDirectionsResponse(null);
    setRouteStarted(false);
    setEstimatedTime("");
    setEndRouteShowModal(true);
    //setHasShownModal(false);
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
  
  const handleDetailsClick = () => {
    setShowModal(true);
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
  

  const handleCancelFinalize = () => {
    setShowConfirmModal(false); // Cerrar el modal de confirmación si el usuario cancela
  };

  
  const handleRefresh = () => {
    if (lastRouteAction === "hospital") {
      getRouteToHospital(closestHospital);
    } else if (lastRouteAction === "accidente") {
      getRoute();
    }
  };
  
  return (
    <>
    

     {/* Modal de Confirmación */}
     <Modal show={showConfirmModal} onHide={handleCancelFinalize}>
        <Modal.Header closeButton>
          <Modal.Title>¿Está seguro de finalizar el recorrido?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Esta acción conlleva la <strong style={{ color: "red" }}>terminación</strong> del servicio de enrutamiento actual.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelFinalize}>
            No
          </Button>
          <Button variant="danger" onClick={handleConfirmFinalize}>
            Sí, estoy seguro
          </Button>
        </Modal.Footer>
      </Modal>

    <Modal show={showModal && selectedAccident} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalles del Accidente</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "white" }}>
        <p><strong style={{ color: "red" }}>Hora del Accidente:</strong> <span style={{ color: "black" }}>{new Date(selectedAccident?.accident_time).toLocaleString()}</span></p>
        <p><strong style={{ color: "red" }}>Fecha de Creación:</strong> <span style={{ color: "black" }}>{new Date(selectedAccident?.created_at).toLocaleString()}</span></p>
        <p><strong style={{ color: "red" }}>Descripción:</strong> <span style={{ color: "black" }}>{selectedAccident?.description}</span></p>
        <p><strong style={{ color: "red" }}>Severidad:</strong> <span style={{ color: "black" }}>{selectedAccident?.severity}</span></p>
        <p><strong style={{ color: "red" }}>Dirección:</strong> <span style={{ color: "black" }}>{selectedAccident?.address}</span></p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={() => setShowModal(false)}>Cerrar</Button>
      </Modal.Footer>
    </Modal>


    {showEndRouteModal && (
  <Modal show={showEndRouteModal} onHide={() => setEndRouteShowModal(false)} centered>
    <Modal.Header closeButton>
      <Modal.Title>Ruta Finalizada</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>El servicio ha sido completado satisfactoriamente. <br />Le invitamos a completar la encuesta en: https://forms.gle/Q84yDim5VxnCzrnv8. Su participación es valiosa para mejorar el sistema.</p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="danger" onClick={() => setEndRouteShowModal(false)}>
        Cerrar
      </Button>
    </Modal.Footer>
  </Modal>
)}

    <LoadScript googleMapsApiKey={googleMapsApiKey || ""} libraries={libraries}>
    <div className="flex flex-col items-center">
      {loading ? (
        <p>Cargando ubicación...</p>
      ) : (
        <>
          <div className="flex mb-3  mt-3">
            <button className="bg-red-500 text-white p-3 ml-2 rounded-lg" onClick={handleClearDestination}>
              Limpiar destino actual
            </button>
            <button
              className="bg-green-500 text-white p-3 ml-2 rounded-lg"
              onClick={() => {
              setLastRouteAction("hospital");
              findClosestHospital()
              }}
              
              disabled={!origin}
            >
              Redireccion al hospital
            </button>
            <button
              className={`bg-blue-500 text-white p-3 ml-2 rounded-lg ${!destination ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={destination ? handleDetailsClick : selectedAccident}
              disabled={!destination}
            >
              Detalles del accidente
            </button>
            <button
              className={`bg-blue-500 text-white p-3 ml-2 rounded-lg ${!destination ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={ () => {
              setLastRouteAction("accidente");
              handleStartRoute();
              }}
              disabled={!destination}
            >
              Enrutar al accidente
            </button>
            <button
              className={`bg-red-500 text-white p-3 ml-2 rounded-lg ${!destination ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleFinalize}
              disabled={!destination}
            >
              Ruta finalizada
            </button>
            <button
              className={`bg-red-500 text-white p-3 ml-2 rounded-lg ${!lastRouteAction ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleRefresh}
              disabled={!lastRouteAction}
            >
              Actualizar mapa
            </button>
          </div>
          {estimatedTime && <p>Tiempo estimado de llegada: {estimatedTime}</p>}
          <GoogleMap
            mapContainerStyle={{
              height: "550px", // Asegúrate de que el mapa tenga una altura y anchura definidas
              width: "100%",
            }}              
            center={origin!}
            zoom={15}
            ref={mapRef}
          >
            {/* Verificar si google.maps.geometry.encoding está disponible */}
         
            {origin && <Marker position={origin} icon={originIcon} />}
            {console.log("este es el destino", destination)}
            {destination && <Marker position={destination} icon={destinationIcon} />}
            {closestHospital && <Marker position={closestHospital} icon={hospitalIcon} />}

            {route && route.polyline && route.polyline.encodedPolyline && (
              <>
                {console.log("Polyline codificada:", route.polyline.encodedPolyline)}
                {console.log("Polyline decodificada:", google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline))}
               

                <Polyline
                  path={google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline)}
                  options={{ strokeColor: "#FF0000", strokeWeight: 5 }}
                />
              </>
            )}
          </GoogleMap>
        </>
      )}
    </div>
  </LoadScript>

  <Footer/>
  </>
);

};

export default AmbulanceDashboard;
