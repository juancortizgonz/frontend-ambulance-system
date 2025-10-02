import { useEffect, useState } from "react";
import AdminMap from "@/components/dashboard/admin/AdminMap";
import api from "@/api/api";
import BaseLayout from "@/layouts/BaseLayout";

const AdminMapPage = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <BaseLayout>
      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">
          Mapa de Ambulancias (🚑), Hospitales (🏥) y Accidentes (⚠️)
        </h2>
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <AdminMap
            ambulances={ambulances}
            hospitals={hospitals}
            accidents={accidents}
          />
        )}
      </section>
    </BaseLayout>
  );
};

export default AdminMapPage;
