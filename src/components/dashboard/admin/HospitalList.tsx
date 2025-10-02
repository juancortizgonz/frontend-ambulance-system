import BaseLayout from "@/layouts/BaseLayout";
import { useEffect, useState } from "react";
import api from "@/api/api";

const HospitalList = () => {
    const [hospitals, setHospitals] = useState([]);

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const response = await api.get("/hospitals/");
                setHospitals(response.data);
            } catch (error) {
                console.error("Error fetching hospitals:", error);
            }
        };

        fetchHospitals();
    }, []);

    return (
        <BaseLayout>
            <h1 className="text-2xl font-bold mb-4">Lista de Hospitales</h1>
            {hospitals.map((hospital: any) => (
                <div key={hospital.id} className="p-4 border-b">
                    <h2 className="text-xl font-bold">Nombre: {hospital.name}</h2>
                    <p className="text-gray-600">Dirección: {hospital.address}</p>
                    <p className="text-gray-600">Nivel: {hospital.level}</p>
                    <p className="text-gray-600">Teléfono: {hospital.phone_number}</p>
                    <p className="text-gray-600">Capacidad de Camas: {hospital.bed_capacity}</p>
                    <p className="text-gray-600">Está Disponible: {hospital.is_available ? "Sí" : "No"}</p>
                    <p className="text-gray-600">Descripción: {hospital.description}</p>
                </div>
            ))}
        </BaseLayout>
    );
}

export default HospitalList;