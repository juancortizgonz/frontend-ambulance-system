import React, { useEffect, useMemo, useState, useRef } from "react";
import { reportAccident } from "@/services/services";
import AccidentReportsTable from "@/components/dashboard/admin/AccidentReportsTable";
import { IAccidentReport } from "@/types/interfaces";
import { ToastContainer, toast } from "react-toastify";
import { NavLink } from "react-router";
import { FiPlusCircle, FiList } from "react-icons/fi";
import { FileText, Activity, CheckCircle, Siren, ChevronLeft, ChevronRight, Ambulance, Trash2, Edit, X, Star } from 'lucide-react';
import DatePicker from "react-datepicker";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import api from "@/api/api";
import { AccidentReport, AmbulanceInfo } from "@/types/types";
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

const PeopleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-500">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);


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

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

interface ReportCardProps {
  report: AccidentReport;
  handleEdit: (report: AccidentReport) => void;
  handleDelete: (report: AccidentReport) => void;
  handleAssignAmbulance: (report: AccidentReport) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, handleEdit, handleDelete, handleAssignAmbulance }) => {
  const isUci = report.severity === 'UCI';

  const formattedDate = new Date(report.accident_time).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cardBaseStyle = "flex-shrink-0 w-80 min-h-full bg-white rounded-xl transition-transform transform hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between";
  const uciStyle = "border-2 border-red-500";
  const otherStyle = "border border-gray-200";

  return (
    <div className={`${cardBaseStyle} ${isUci ? uciStyle : otherStyle}`}>
      <div>
        {isUci && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
            PRIORIDAD UCI
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center mb-3">
            <ClockIcon />
            <p className="ml-2 text-sm font-semibold text-gray-700">{formattedDate}</p>
          </div>

          <div className="mb-3">
            <div className="flex items-start">
              <MapPinIcon />
              <p className="ml-2 text-sm text-gray-800 font-medium">{report.address}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 h-16 overflow-y-auto">
            {report.description || "Sin descripción."}
          </p>

          <div className="flex items-center text-sm text-gray-700">
            <PeopleIcon />
            <span className="ml-2"><strong>Personas involucradas:</strong> {report.people_involved}</span>
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-around items-center p-2 bg-gray-50 border-t">
          <button
            onClick={() => handleAssignAmbulance(report)}
            className="flex items-center gap-1 p-1 text-green-600 hover:bg-green-100 rounded"
            title="Asignar ambulancia"
          >
            <Ambulance size={18} /> <span className="text-xs font-semibold">Asignar</span>
          </button>
          <button
            onClick={() => handleEdit(report)}
            className="flex items-center gap-1 p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Editar"
          >
            <Edit size={18} /> <span className="text-xs font-semibold">Editar</span>
          </button>
          <button
            onClick={() => handleDelete(report)}
            className="flex items-center gap-1 p-1 text-red-600 hover:bg-red-100 rounded"
            title="Eliminar"
          >
            <Trash2 size={18} /> <span className="text-xs font-semibold">Borrar</span>
          </button>
        </div>
        <div className={`absolute bottom-0 left-0 w-full h-1 ${isUci ? 'bg-red-500' : 'bg-blue-500'}`}></div>
      </div>
    </div>
  );
};


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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const [selectedReport, setSelectedReport] = useState<AccidentReport | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false)
  const [editForm, setEditForm] = useState<AccidentReport | null>(null)
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<string>("")

  const stats = useMemo(() => {
    const totalReports = accidentReportsFetched.length;
    const activeIncidents = accidentReportsFetched.filter(r => r.is_active).length;
    const resolvedIncidents = accidentReportsFetched.filter(r => r.is_resolved).length;
    const highSeverityIncidents = accidentReportsFetched.filter(r => r.severity === 'UCI').length;
    return { totalReports, activeIncidents, resolvedIncidents, highSeverityIncidents };
  }, [accidentReportsFetched]);

  const unassignedReports = useMemo(() => {
    if (!accidentReportsFetched) return [];
    return accidentReportsFetched
      .filter(report => report.assigned_ambulance === null)
      .sort((a, b) => {
        if (a.severity === 'UCI' && b.severity !== 'UCI') return -1;
        if (a.severity !== 'UCI' && b.severity === 'UCI') return 1;
        return new Date(b.accident_time).getTime() - new Date(a.accident_time).getTime();
      });
  }, [accidentReportsFetched]);

  const fetchAccidentReports = async () => {
    try {
      const response = await api.get("/accident-reports/")
      setAccidentReportsFetched(response.data);
      console.log("Accident reports fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching accident reports:", error);
    }
  }

  useEffect(() => {
    fetchAccidentReports();
    startDashboardTour();
  }, []);


  useEffect(() => {
    const checkScrollable = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setIsScrollable(container.scrollWidth > container.clientWidth);
      }
    };
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [unassignedReports]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };


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
        fetchAccidentReports();
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

  const handleEdit = (report: AccidentReport) => {
    setSelectedReport(report)
    setEditForm({ ...report })
    setIsEditModalOpen(true)
  }

  const handleDelete = (report: AccidentReport) => {
    setSelectedReport(report)
    setIsDeleteModalOpen(true)
  }

  const fetchRecommendedAmbulances = async (id: number) => {
    try {
      const ambulancesRes = await api.get(`/ambulances/accident-reports/${id}/`);

      if (ambulancesRes.status !== 200) {
        toast.error("Error al obtener ambulancias recomendadas");
        return
      }

      const recommendedAmbulances = ambulancesRes.data.map((amb: any, idx: number) => ({
        ...amb,
        isRecommended: idx === 0,
      }));

      setAmbulances(recommendedAmbulances);

      if (recommendedAmbulances.length > 0) {
        setSelectedAmbulance(recommendedAmbulances[0].ambulance.plate_number);
      } else {
        setSelectedAmbulance("");
      }
    } catch (error) {
      toast.error("Error al cargar ambulancias.")
    }
  }

  const handleAssignAmbulance = (report: AccidentReport) => {
    setSelectedReport(report)
    fetchRecommendedAmbulances(report.id);
    setIsAmbulanceModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editForm) return

    try {
      const response = await api.put(`/accident-reports/${editForm.id}/`, editForm);

      if (response.status !== 200) {
        toast.error("Error al guardar el reporte.");
        return
      }

      toast.success("Reporte actualizado con éxito.");
      setIsEditModalOpen(false)
      fetchAccidentReports();
    } catch (error) {
      toast.error("Ocurrió un error al guardar el reporte.");
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedReport) return
    try {
      const response = await api.delete(`/accident-reports/${selectedReport.id}/`);

      if (response.status !== 204) {
        toast.error("Error al eliminar el reporte.");
        return
      }
      toast.success("Reporte eliminado con éxito.");
      setIsDeleteModalOpen(false)
      fetchAccidentReports();
    } catch (error) {
      toast.error("Ocurrió un error al eliminar el reporte.");
    }
  }

  const handleConfirmAmbulance = async () => {
    if (!selectedReport || !selectedAmbulance) return

    try {
      const ambulanceToAssign = ambulances.find((amb) => amb.ambulance.plate_number === selectedAmbulance);

      const response = await api.patch(`/ambulances/plate-number/${selectedAmbulance}/`, {
        status: "in_use",
      })

      const updateReportResponse = await api.patch(`/accident-reports/${selectedReport.id}/`, {
        assigned_ambulance: ambulanceToAssign.ambulance.id,
        is_active: true,
      })

      if (response.status !== 200 || updateReportResponse.status !== 200) {
        toast.error("Error al asignar la ambulancia.");
        return
      }
      toast.success(`Ambulancia ${selectedAmbulance} asignada.`);
      setIsAmbulanceModalOpen(false)
      fetchAccidentReports();
    } catch (error) {
      toast.error("Ocurrió un error al asignar la ambulancia.");
    }
  }

  const handleEditFormChange = (field: keyof AccidentReport, value: any) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      [field]: value,
    })
  }

  return (
    <BaseLayout>
      <div className="p-6 min-h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard de Administración</h1>
          <p className="text-gray-600 mt-1">Gestiona el despacho de ambulancias, creación de reportes de incidentes y revisión de recursos APH.</p>
        </header>

        {/* Unassigned Reports Section */}
        <section id="pending-reports" className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Reportes pendientes de asignación</h2>
            {isScrollable && (
              <div className="flex gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex gap-x-6 pb-4 overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {unassignedReports.length > 0 ? (
                unassignedReports.map(report => (
                  <ReportCard key={report.id} report={report} handleEdit={handleEdit} handleDelete={handleDelete} handleAssignAmbulance={handleAssignAmbulance} />
                ))
              ) : (
                <div className="w-full text-center py-10 bg-white rounded-lg">
                  <p className="text-gray-500">🎉 ¡Excelente! No hay reportes pendientes de asignación.</p>
                </div>
              )}
            </div>
          </div>
        </section>


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
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
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
            <div className="flex gap-x-2 flex-wrap gap-2">
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

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Reporte de Accidente">
        {editForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSaveEdit()
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Tiempo del accidente</label>
              <input
                type="datetime-local"
                value={new Date(editForm.accident_time).toISOString().slice(0, 16)}
                onChange={(e) => handleEditFormChange("accident_time", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleEditFormChange("description", e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">¿Está activo?</label>
                <select
                  value={editForm.is_active ? "true" : "false"}
                  onChange={(e) => handleEditFormChange("is_active", e.target.value === "true")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">¿Está resuelto?</label>
                <select
                  value={editForm.is_resolved ? "true" : "false"}
                  onChange={(e) => handleEditFormChange("is_resolved", e.target.value === "true")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Severidad</label>
              <select
                value={editForm.severity}
                onChange={(e) => handleEditFormChange("severity", e.target.value as any)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="BASIC">Básica</option>
                <option value="MEDIUM">Media</option>
                <option value="UCI">UCI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => handleEditFormChange("address", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
        {selectedReport && (
          <div>
            <p className="text-gray-700 mb-4">
              ¿Está seguro que desea eliminar el reporte de accidente "{selectedReport.description}"?
            </p>
            <p className="text-red-600 mb-6">Esta acción no se puede deshacer.</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isAmbulanceModalOpen} onClose={() => setIsAmbulanceModalOpen(false)} title="Asignar Ambulancia">
        {selectedReport && (
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">Detalles del accidente:</h4>
              <p><span className="font-medium">Dirección:</span> {selectedReport.address}</p>
              <p><span className="font-medium">Severidad:</span> {selectedReport.severity}</p>
            </div>

            <h4 className="font-medium text-gray-900 mb-2">Ambulancias disponibles:</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(ambulances.length === 0) ? (<p>No hay ambulancias adecuadas para atender este incidente.</p>) : ambulances.map((ambulance) => (
                <div
                  key={ambulance.ambulance.id}
                  className={`border rounded-lg p-3 cursor-pointer ${selectedAmbulance === ambulance.ambulance.plate_number
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                    } ${ambulance.isRecommended ? "relative" : ""}`}
                  onClick={() => setSelectedAmbulance(ambulance.ambulance.plate_number)}
                >
                  {ambulance.isRecommended && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <Star size={16} fill="white" />
                    </div>
                  )}
                  <div className="flex justify-between">
                    <h5 className="font-medium text-gray-900 flex items-center">
                      Placa: {ambulance.ambulance.plate_number}
                      {ambulance.isRecommended && (
                        <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          Recomendada
                        </span>
                      )}
                    </h5>
                    <span className={`text-sm font-medium ${ambulance.ambulance.status === "available" ? "text-green-600" : "text-yellow-600"}`}>
                      {ambulance.ambulance.status === "available" ? "Disponible" : "Ocupada"}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>Tipo: {ambulance.ambulance.ambulance_type}</p>
                    <p>Tiempo estimado: {ambulance.estimated_time} min</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAmbulanceModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAmbulance}
                disabled={!selectedAmbulance}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${selectedAmbulance ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                Asignar Ambulancia
              </button>
            </div>
          </div>
        )}
      </Modal>

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
