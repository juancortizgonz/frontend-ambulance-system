import React, { useEffect, useMemo, useState } from "react";
import { reportAccident } from "@/services/services";
import AccidentReportsTable from "@/components/dashboard/admin/AccidentReportsTable";
import { IAccidentReport } from "@/types/interfaces";
import { ToastContainer, toast } from "react-toastify";
import { NavLink } from "react-router";
import { FiPlusCircle, FiList } from "react-icons/fi";
import { FileText, Activity, CheckCircle, Siren } from 'lucide-react';
import DatePicker from "react-datepicker";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import api from "@/api/api";
import { AccidentReport } from "@/types/types";
import BaseLayout from "@/layouts/BaseLayout";
import { startDashboardTour } from "@/utils/tour";

// Iconos SVG inline
const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-gray-500"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
)

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-gray-500"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-green-500"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

const AlertTriangleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-yellow-500"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  </svg>
)

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
)

const AdminDashboard: React.FC = () => {
  const geocodingClientKey = import.meta.env.VITE_MAPBOX_GEOCODING;

  const [accidentReportsFetched, setAccidentReportsFetched] = useState<AccidentReport[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    accidentTime: "",
    description: "",
    isActive: true,
    isResolved: false,
    resolvedAt: "",
    latitude: 0,
    longitude: 0,
    address: "",
    assignedAmbulance: null,
    severity: "BASIC",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const stats = useMemo(() => {
    const totalReports = accidentReportsFetched.length;
    const activeIncidents = accidentReportsFetched.filter(r => r.is_active).length;
    const resolvedIncidents = accidentReportsFetched.filter(r => r.is_resolved).length;
    const highSeverityIncidents = accidentReportsFetched.filter(r => r.severity === 'UCI').length;
    return { totalReports, activeIncidents, resolvedIncidents, highSeverityIncidents };
  }, [accidentReportsFetched]);


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const element = e.target;
    const { name, value, type, checked } = element as HTMLInputElement;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const geocodingClient = mbxGeocoding({
    accessToken:
      geocodingClientKey,
  });

  interface Coordinates {
    latitude: number;
    longitude: number;
  }

  const getCoordinatesFromAddress = async (address: string): Promise<Coordinates | null> => {
    const response = await geocodingClient
      .forwardGeocode({
        query: address,
        limit: 1,
      })
      .send();

    const match = response.body.features[0];
    if (match) {
      return {
        latitude: match.center[1],
        longitude: match.center[0],
      };
    }
    return null;
  };

  const isValid = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.address)
      newErrors.address = "La dirección del accidente es requerida.";
    if (!formData.severity)
      newErrors.severity = "La severidad del accidente es requerida.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (date: Date | null): string | undefined => {
    if (!date) return undefined;
    
    const iso = date.toISOString();
    const [datePart, timePart] = iso.split("T");
    const [hms, msZ] = timePart.split(".");
    return `${datePart}T${hms}.000000Z`;
  };

  const toSnakeCase = (obj: Record<string, any>): IAccidentReport => {
    const newObject: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        newObject[newKey] = obj[key];
      }
    }
    return newObject;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid()) {
      const data = {
        ...formData,
        accidentTime: formatDate(selectedDate),
      };

      const snakeCaseData = toSnakeCase(data);

      try {
        console.log(
          `Data para el POST: ${JSON.stringify(snakeCaseData, null, 2)}`
        );
        await reportAccident(snakeCaseData);
        toast.success("Reporte de accidente creado satisfactoriamente.");
        closeModal();
        setFormData({
          accidentTime: "",
          description: "",
          isActive: true,
          isResolved: false,
          resolvedAt: "",
          latitude: 0,
          longitude: 0,
          address: "",
          assignedAmbulance: null,
          severity: "BASIC",
        });
        setSelectedDate(null);
        setErrors({});
      } catch (error) {
        if (error instanceof Error) {
          if (
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError")
          ) {
            toast.error(
              "No se pudo conectar con el servidor. Verifique su conexión o intente más tarde."
            );
          } else {
            toast.error("Hubo un error al crear el reporte. Intente de nuevo.");
          }
          console.error(`Ocurrió un error al reportar el accidente: ${error}`);
        } else {
          console.error(`Ocurrió un error desconocido: ${error}`);
        }
      }
    }
  };

  useEffect(() => {
    const fetchAccidentReports = async () => {
      try {
        const response = await api.get("/accident-reports/")
        setAccidentReportsFetched(response.data);
        console.log("Accident reports fetched successfully:", response.data);
      } catch (error) {
        console.error("Error fetching accident reports:", error);
      }
    }

    fetchAccidentReports();
    
    // Start the tour
    startDashboardTour();
  }, []);

  return (
    <BaseLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard de Administración</h1>
          <p className="text-gray-600 mt-1">Vista general de la actividad y reportes de incidentes.</p>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reportes Totales</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalReports}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Incidentes Activos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.activeIncidents}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Casos Resueltos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.resolvedIncidents}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Siren className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Alta Gravedad (UCI)</p>
              <p className="text-2xl font-bold text-gray-800">{stats.highSeverityIncidents}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons & Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Reportes de Incidentes Recientes</h2>
            <div className="flex gap-x-2">
              <a
                id="btn-create-report"
                href="/create-report"
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlusCircle className="mr-2" size={20} />
                Nuevo Reporte
              </a>
              <NavLink
                id="btn-view-history"
                to="/history"
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiList className="mr-2" size={20} />
                Ver Historial
              </NavLink>
            </div>
          </div>
          <AccidentReportsTable data={accidentReportsFetched} />
        </div>
        
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50">
            {/* Modal content remains the same */}
          </div>
        )}
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BaseLayout>
  );
};

export default AdminDashboard;
