import React, { useEffect, useState } from "react";
import { reportAccident, getAccidentReports } from "@/services/services";
import { IAccidentReport } from "@/types/interfaces";
import { ToastContainer, toast } from "react-toastify";
import { NavLink } from "react-router";
import { FiPlusCircle, FiList } from "react-icons/fi";
import DatePicker from "react-datepicker";
import Button from "@/components/ui/button/Button"
import { useAuth } from "@/hooks/useAuth"
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"

import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

type AccidentReport = {
  id: number
  address: string
  severity: "BASIC" | "UCI"
  accident_time: string
  is_resolved: boolean
  description: string
}

type Ambulance = {
  id: string
  name: string
  distance: number // en km
  estimatedTime: number // en minutos
  available: boolean
  crew: number // número de personal
}

// Ambulancias disponibles (datos quemados por ahora)
const availableAmbulances: Ambulance[] = [
  {
    id: "AMB-001",
    name: "Unidad 101",
    distance: 1.2,
    estimatedTime: 4,
    available: true,
    crew: 3,
  },
  {
    id: "AMB-002",
    name: "Unidad 205",
    distance: 2.5,
    estimatedTime: 8,
    available: true,
    crew: 2,
  },
  {
    id: "AMB-003",
    name: "Unidad 310",
    distance: 3.7,
    estimatedTime: 12,
    available: true,
    crew: 4,
  },
  {
    id: "AMB-004",
    name: "Unidad 422",
    distance: 5.1,
    estimatedTime: 15,
    available: true,
    crew: 3,
  },
]

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

const columnHelper = createColumnHelper<AccidentReport>()

const AdminDashboard: React.FC = () => {
  const geocodingClientKey = import.meta.env.VITE_MAPBOX_GEOCODING;

  const [selectedReport, setSelectedReport] = useState<AccidentReport | null>(null)
  const [isModalAccidentReportOpen, setIsModalAccidentReportOpen] = useState(false)
  const [accidentReports, setAccidentReports] = useState<AccidentReport[]>([])

  // Definición de columnas
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("address", {
      header: "Ubicación",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <MapPinIcon />
          <span>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("severity", {
      header: "Severidad",
      cell: (info) => {
        const severity = info.getValue()
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severity === "UCI"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
              }`}
          >
            {severity.valueOf() === "UCI" ? "Grave - UCI" : "Atención básica"}
          </span>
        )
      },
    }),
    columnHelper.accessor("accident_time", {
      header: "Hora",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <ClockIcon />
          <span>{new Date(info.getValue()).toLocaleString()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("is_resolved", {
      header: "Estado",
      cell: (info) => {
        const status = info.getValue()
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status
              ? "border-green-500 text-green-500"
              : "border-orange-500 text-orange-500"
              }`}
          >
            {status.valueOf() ? "Resuelto" : "Pendiente"}
          </span>
        )
      },
    }),
    columnHelper.accessor("description", {
      header: "Descripción",
      cell: (info) => (
        <div className="max-w-xs truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => {
        const isResolved = info.row.original.is_resolved; // Obtener el estado del reporte
        return (
          <button
            className={`inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${isResolved
                ? "bg-gray-400 text-gray-700 cursor-not-allowed" // Estilo para botón deshabilitado
                : "bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
              }`}
            onClick={() => {
              if (!isResolved) {
                setSelectedReport(info.row.original);
                setIsModalAccidentReportOpen(true);
              }
            }}
            disabled={isResolved} // Deshabilitar si el reporte está resuelto
          >
            Asignar ambulancia
          </button>
        );
      },
    }),
  ]

  const table = useReactTable({
    data: accidentReports,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Función para asignar ambulancia (simulada por ahora)
  const assignAmbulance = (ambulanceId: string) => {
    console.log(`Asignando ambulancia ${ambulanceId} al reporte ${selectedReport?.id}`)
    setIsModalOpen(false)
  }

  const { clearAuthInfo } = useAuth()

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
    return date.toISOString().split(".")[0] + "Z";
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
        const response = await getAccidentReports();
        console.log(`Accident reports fetched: ${JSON.stringify(response, null, 2)}`);
        setAccidentReports(response);
      } catch (error) {
        console.error("Error fetching accident reports:", error);
      }
    };

    fetchAccidentReports();
  }, [])

  return (
    <>
      <h3>Admin dashboard</h3>
      <Button onClick={clearAuthInfo}>Cerrar sesión</Button>
      <div className="p-4">
        <div className="container flex gap-x-4">
          <button
            onClick={openModal}
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                openModal();
              }
            }}
          >
            <FiPlusCircle className="mr-2" size={24} />
            Reportar un nuevo accidente
          </button>
          <NavLink
            to="/history"
            className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105">
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
      <div className="w-10/12 mx-auto my-8">
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal personalizado para asignar ambulancia */}
        {isModalAccidentReportOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50"
            role="dialog"
            tabIndex={-1}
            onClick={(e) => {
              // Cierra el modal si el clic ocurre fuera del contenido del modal
              if (e.target === e.currentTarget) {
                setIsModalAccidentReportOpen(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsModalAccidentReportOpen(false);
              }
            }}
          >
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Asignar ambulancia</h3>
                <button
                  onClick={() => setIsModalAccidentReportOpen(false)}
                  className="rounded-full p-1 hover:bg-gray-100"
                  aria-label="Cerrar modal"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="py-4">
                {selectedReport && (
                  <div className="mb-4 rounded-md bg-gray-50 p-3 text-sm">
                    <p className="font-medium">Reporte: {selectedReport.id}</p>
                    <p className="flex items-center gap-1 text-gray-600">
                      <MapPinIcon /> {selectedReport.address}
                    </p>
                    <p className="mt-1 text-gray-600">{selectedReport.description}</p>
                  </div>
                )}

                <h3 className="mb-2 text-sm font-medium">Ambulancias disponibles:</h3>
                <div className="space-y-3">
                  {availableAmbulances.map((ambulance, index) => (
                    <div
                      key={ambulance.id}
                      className={`relative rounded-lg border p-3 ${index === 0 ? "border-2 border-green-500 bg-green-50" : "border-gray-200"
                        }`}
                    >
                      {index === 0 && (
                        <div className="absolute right-2 top-2">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Recomendada
                          </span>
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{ambulance.name}</p>
                          <div className="mt-1 space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-1">
                              <MapPinIcon /> A {ambulance.distance} km
                            </p>
                            <p className="flex items-center gap-1">
                              <ClockIcon /> Tiempo estimado: {ambulance.estimatedTime} min
                            </p>
                            <p className="flex items-center gap-1">
                              {ambulance.crew >= 3 ? <CheckCircleIcon /> : <AlertTriangleIcon />} Personal:{" "}
                              {ambulance.crew}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => assignAmbulance(ambulance.id)}
                          className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${index === 0 ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                          Asignar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
