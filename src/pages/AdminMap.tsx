import { useEffect, useState, useRef } from "react";
import { Maximize } from 'lucide-react';
import AdminMap from "@/components/dashboard/admin/AdminMap";
import api from "@/api/api";
import BaseLayout from "@/layouts/BaseLayout";

const AdminMapPage = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccidentCoords, setSelectedAccidentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ambulancesRes, hospitalsRes, accidentsRes] = await Promise.all([
          api.get("/ambulances/"),
          api.get("/hospitals/"),
          api.get("/accident-reports/"),
        ]);
        setAmbulances(ambulancesRes.data);
        setHospitals(hospitalsRes.data);
        setAccidents(accidentsRes.data);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAccidentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accidentId = parseInt(e.target.value);
    const accident = accidents.find((a: any) => a.id === accidentId);
    if (accident) {
      setSelectedAccidentCoords({ lat: accident.latitude, lng: accident.longitude });
    }
  };

  const handleFullscreen = () => {
    if (mapContainerRef.current) {
      mapContainerRef.current.requestFullscreen();
    }
  };

  return (
    <BaseLayout>
      <section className="p-4 flex flex-col h-[calc(100vh-8rem)]">
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-xl font-bold">
              Mapa de Actividad
            </h2>
            <div className="flex items-center gap-2">
              <select onChange={handleAccidentSelect} defaultValue="" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5">
                <option value="" disabled>Selecciona un accidente</option>
                {accidents.filter((a: any) => a.is_active).map((accident: any) => (
                  <option key={accident.id} value={accident.id}>
                    ID: {accident.id} - {accident.address || 'Sin dirección'}
                  </option>
                ))}
              </select>
              <button onClick={() => setSelectedAccidentCoords(null)} className="px-3 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors text-sm">
                Vista General
              </button>
              <button onClick={handleFullscreen} className="p-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <div ref={mapContainerRef} className="flex-grow">
            <AdminMap
              ambulances={ambulances}
              hospitals={hospitals}
              accidents={accidents}
              centerCoordinates={selectedAccidentCoords}
            />
          </div>
        )}
      </section>
    </BaseLayout>
  );
};

export default AdminMapPage;
