import React, { useEffect, useState } from "react";
import { reportAccident } from "@/services/services";
import AccidentReportsTable from "@/components/dashboard/admin/AccidentReportsTable";
import { IAccidentReport } from "@/types/interfaces";
import { ToastContainer, toast } from "react-toastify";
import { NavLink } from "react-router";
import { FiPlusCircle, FiList } from "react-icons/fi";
import DatePicker from "react-datepicker";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import api from "@/api/api";
import { AccidentReport } from "@/types/types";
import BaseLayout from "@/layouts/BaseLayout";

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
  }, []);

  return (
    <BaseLayout>
      <div className="p-4">
        <div className="container flex justify-center gap-x-2">
          <a
            href="/create-report"
            className="flex items-center justify-center p-4 bg-orange-500 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-opacity-50 transition duration-300 ease-in-out font-semibold rounded-sm"
            tabIndex={0}
          >
            <FiPlusCircle className="mr-2" size={24} />
            Generar nuevo reporte
          </a>
          <NavLink
            to="/history"
            className="flex items-center justify-center p-4 bg-green-600 font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 ease-in-out rounded-sm">
            <FiList className="mr-2" size={24} />
            Ver historial de accidentes
          </NavLink>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50">
            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6 bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-auto"
            >
              <header className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Crear reporte de accidente
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Izquierda */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="accidentDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Fecha y hora
                    </label>
                    <DatePicker
                      id="accidentDate"
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      showTimeSelect
                      dateFormat="Pp"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Describe el incidente"
                    />
                  </div>
                  <div className="flex items-center space-x-6">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Activo</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="isResolved"
                        checked={formData.isResolved}
                        onChange={handleChange}
                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Resuelto</span>
                    </label>
                  </div>
                </div>

                {/* Derecha */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="severity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Severidad
                    </label>
                    <select
                      id="severity"
                      name="severity"
                      value={formData.severity}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="BASIC">Básico</option>
                      <option value="UCI">UCI</option>
                    </select>
                    {errors.severity && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.severity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Dirección
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      onChange={async (e) => {
                        handleChange(e);
                        const coords = await getCoordinatesFromAddress(
                          e.target.value
                        );
                        if (coords)
                          setFormData((prev) => ({ ...prev, ...coords }));
                      }}
                      placeholder="Ej. Calle 123 #45-67"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="latitude"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Latitud
                      </label>
                      <input
                        id="latitude"
                        name="latitude"
                        type="number"
                        value={formData.latitude || ""}
                        readOnly
                        className="mt-1 block w-full rounded-lg bg-gray-100 border-gray-300 shadow-inner py-2 px-3 text-sm text-gray-600"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="longitude"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Longitud
                      </label>
                      <input
                        id="longitude"
                        name="longitude"
                        type="number"
                        value={formData.longitude || ""}
                        readOnly
                        className="mt-1 block w-full rounded-lg bg-gray-100 border-gray-300 shadow-inner py-2 px-3 text-sm text-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition transform hover:-translate-y-0.5"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <div>
        <AccidentReportsTable data={accidentReportsFetched} />
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
