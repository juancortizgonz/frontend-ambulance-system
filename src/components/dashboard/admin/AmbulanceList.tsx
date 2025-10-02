import BaseLayout from "@/layouts/BaseLayout";
import { useEffect, useState } from "react";
import api from "@/api/api";

const AmbulanceList = () => {
    const [ambulances, setAmbulances] = useState([]);

    useEffect(() => {
        const fetchAmbulances = async () => {
            try {
                const response = await api.get("/ambulances/");
                setAmbulances(response.data);
            } catch (error) {
                console.error("Error fetching ambulances:", error);
            }
        };

        fetchAmbulances();
    }, []);

    return (
        <BaseLayout>
            <h1 className="text-2xl font-bold mb-4">Lista de Ambulancias</h1>
            {ambulances.map((ambulance: any) => (
                <div key={ambulance.id} className="p-4 border-b">
                    <h2 className="text-xl font-bold">Placa: {ambulance.plate_number}</h2>
                    <p className="text-gray-600">Tipo de ambulancia: {ambulance.ambulance_type}</p>
                    <p className="text-gray-600">Estado: {ambulance.status === "out_of_service" ? "Fuera de servicio" : (ambulance.status === "in_use" ? "Ocupada" : "Disponible")}</p>
                    <p className="text-gray-600">Capacidad: {ambulance.capacity}</p>
                    <p className="text-gray-600">Última Inspección: {ambulance.last_inspection_date}</p>
                    <p className="text-gray-600">Latitud: {ambulance.latitude}</p>
                    <p className="text-gray-600">Longitud: {ambulance.longitude}</p>
                </div>
            ))}
        </BaseLayout>
    );
}
export default AmbulanceList;