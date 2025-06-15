"use client"

import type React from "react"

import { useState } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, Edit, Trash2, Ambulance, X, Check, Clock, MapPin, Star } from "lucide-react"
import { AccidentReport } from "@/types/types"
import api from "@/api/api"
import type { AmbulanceInfo } from "@/types/types";

const columnHelper = createColumnHelper<AccidentReport>()

// ToDo: Change this to use the existing Modal component from the project
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
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function AccidentReportsTable({ data }: { data: AccidentReport[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedReport, setSelectedReport] = useState<AccidentReport | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false)

  const [editForm, setEditForm] = useState<AccidentReport | null>(null)

  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<string>("")

  const columns = [
    columnHelper.accessor("accident_time", {
      header: "Tiempo del accidente",
      cell: (info) => new Date(info.getValue()).toLocaleString("es-ES"),
    }),
    columnHelper.accessor("description", {
      header: "Descripción",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("is_active", {
      header: "¿Está activo?",
      cell: (info) => (
        <span className={info.getValue() ? "text-green-600" : "text-red-600"}>{info.getValue() ? "Sí" : "No"}</span>
      ),
    }),
    columnHelper.accessor("is_resolved", {
      header: "¿Está resuelto?",
      cell: (info) => (
        <span className={info.getValue() ? "text-green-600" : "text-red-600"}>{info.getValue() ? "Sí" : "No"}</span>
      ),
    }),
    columnHelper.accessor("severity", {
      header: "Severidad",
      cell: (info) => {
        const severity = info.getValue()
        let colorClass = ""

        switch (severity) {
          case "BASIC":
            colorClass = "bg-orange-100 text-orange-800"
            break
          case "UCI":
            colorClass = "bg-red-100 text-red-800"
            break
        }

        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{severity}</span>
      },
    }),
    columnHelper.accessor("address", {
      header: "Dirección",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("reference_point", {
      header: "Punto de referencia",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("people_involved", {
      header: "Personas involucradas",
      cell: (info) => (
        <span>{info.getValue()} personas</span>
      ),
    }),
    columnHelper.accessor("additional_notes", {
      header: "Notas adicionales",
      cell: (info) => (
        info.getValue() ? info.getValue() : <span className="text-gray-500 italic">Ninguna</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => (
         (info.row.original.is_resolved) ? (<span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Reporte finalizado</span>) : (((info.row.original.assigned_ambulance === null) ? (<div className="flex space-x-2">
          <button
            onClick={() => handleEdit(info.row.original)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Editar"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(info.row.original)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => handleAssignAmbulance(info.row.original)}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Asignar ambulancia"
          >
            <Ambulance size={18} />
          </button>
        </div>) : (
            <button
              onClick={() => {
              // Llama a la nueva función pasando el id del reporte y el id de la ambulancia asignada
              handleFinishReport(info.row.original.id, info.row.original.assigned_ambulance);
              }}
              className="p-1 px-3 py-1 border border-green-600 text-green-700 bg-white hover:bg-green-50 rounded flex items-center space-x-1"
              title="Finalizar reporte"
            >
              <span className="text-xs font-semibold">Finalizar</span>
              <Check size={18} className="ml-1" />
            </button>
        )))
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleEdit = (report: AccidentReport) => {
    setSelectedReport(report)
    setEditForm({ ...report })
    setIsEditModalOpen(true)
  }

  const handleDelete = (report: AccidentReport) => {
    setSelectedReport(report)
    setIsDeleteModalOpen(true)
  }

  const handleFinishReport = async (accidentReportId: number, ambulanceId: number) => {
    try {
      const response = await api.patch(`/accident-reports/${accidentReportId}/`, {
        is_resolved: true,
        is_active: false,
        resolved_at: new Date().toISOString(),
        assigned_ambulance: null,
      });

      const fetchedAmbulance = await api.get(`/ambulances/${ambulanceId}/`);

      const ambulanceResponse = await api.patch(`/ambulances/plate-number/${fetchedAmbulance.data.plate_number}/`, {
        status: "available",
      })

      if (response.status !== 200 || ambulanceResponse.status !== 200) {
        console.error("Error al finalizar el reporte:", response.data);
        return;
      }

      alert("Reporte de accidente finalizado correctamente.");
      setIsAmbulanceModalOpen(false);
      setSelectedReport(null);
      setEditForm(null);
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error al finalizar el reporte:", error);
      return;
    }
  }

  const fetchRecommendedAmbulances = async (id: number) => {
    const ambulances = await api.get(`/ambulances/accident-reports/${id}/`);

    if (ambulances.status !== 200) {
      console.error("Error al obtener ambulancias recomendadas:", ambulances.data)
      return
    }

    const recommendedAmbulances = ambulances.data.map((amb: any, idx: number) => ({
      ...amb,
      isRecommended: idx === 0,
    }));

    setAmbulances(recommendedAmbulances);
    console.log("Ambulancias recomendadas:", recommendedAmbulances);

    if (recommendedAmbulances.length === 0) {
      setSelectedAmbulance("");
      setEstimatedTime([]);
      return;
    } else {
      setSelectedAmbulance(recommendedAmbulances[0].id);
    }

    setEstimatedTime((ambulances.data as { estimated_time: number }[]).map((amb: { estimated_time: number }) => amb.estimated_time));
  }

  const handleAssignAmbulance = (report: AccidentReport) => {
    setSelectedReport(report)
    fetchRecommendedAmbulances(report.id);
    setSelectedAmbulance(ambulances.find((amb) => amb.is_recommended)?.plate_number || "")
    setIsAmbulanceModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editForm) return

    const response = await api.put(`/accident-reports/${editForm.id}/`, editForm);

    if (response.status !== 200) {
      console.error("Error al guardar el reporte:", response.data)
      return
    }

    setIsEditModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!selectedReport) return

    const response = await api.delete(`/accident-reports/${selectedReport.id}/`);

    if (response.status !== 204) {
      console.error("Error al eliminar el reporte:", response.data)
      return
    }

    setIsDeleteModalOpen(false)
  }

  const handleConfirmAmbulance = async () => {
    if (!selectedReport || !selectedAmbulance) return

    try {
      const response = await api.patch(`/ambulances/plate-number/${selectedAmbulance}/`, {
        status: "in_use",
      })

      const updateReportResponse = await api.patch(`/accident-reports/${selectedReport.id}/`, {
        assigned_ambulance: ambulances.find((amb) => amb.ambulance.plate_number === selectedAmbulance)?.ambulance.id,
        is_active: true,
      })

      if (response.status !== 200 || updateReportResponse.status !== 200) {
        console.error("Error al asignar la ambulancia:", response.data)
        return
      }
    } catch (error) {
      console.error("Error al asignar la ambulancia:", error)
      return
    }

    setIsAmbulanceModalOpen(false)
  }

  const handleEditFormChange = (field: keyof AccidentReport, value: any) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      [field]: value,
    })
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Reportes de Accidentes</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      {header.column.getCanSort() && (
                        <span>
                          {{
                            asc: <ChevronUp size={14} />,
                            desc: <ChevronDown size={14} />,
                          }[header.column.getIsSorted() as string] ?? (
                              <div className="opacity-0 group-hover:opacity-100 w-4 h-4"></div>
                            )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
        </div>
        <span className="text-sm text-gray-700">
          Página{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </strong>
        </span>
      </div>

      {/* Modal de Edición */}
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
                value={editForm.accident_time.replace(" ", "T")}
                onChange={(e) => handleEditFormChange("accident_time", e.target.value.replace("T", " "))}
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
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Punto de referencia</label>
              <input
                type="text"
                value={editForm.reference_point}
                onChange={(e) => handleEditFormChange("reference_point", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Personas involucradas</label>
              <input
                type="text"
                value={editForm.people_involved}
                onChange={(e) => handleEditFormChange("people_involved", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notas adicionales</label>
              <textarea
                value={editForm.additional_notes}
                onChange={(e) => handleEditFormChange("additional_notes", e.target.value)}
                rows={3}
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

      {/* Modal de Eliminación */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
        {selectedReport && (
          <div>
            <p className="text-gray-700 mb-4">
              ¿Está seguro que desea eliminar el reporte de accidente "{selectedReport.description}" ocurrido el{" "}
              {new Date(selectedReport.accident_time).toLocaleString()}?
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

      {/* Modal de Asignación de Ambulancia */}
      <Modal isOpen={isAmbulanceModalOpen} onClose={() => setIsAmbulanceModalOpen(false)} title="Asignar Ambulancia">
        {selectedReport && (
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">Detalles del accidente:</h4>
              <p className="text-gray-700">
                <span className="font-medium">Descripción:</span> {selectedReport.description}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Dirección:</span> {selectedReport.address}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Severidad:</span>
                {selectedReport.severity === "BASIC" ? (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                  Básica
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  UCI
                  </span>
                )}
              </p>
            </div>

            <h4 className="font-medium text-gray-900 mb-2">Ambulancias disponibles:</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(ambulances.length === 0) ? (<p>No hay ambulancias adecuadas para atender este incidente.</p>) : ambulances.map((ambulance) => (
                <div
                  key={ambulance.ambulance.id}
                  className={`border rounded-lg p-3 ${selectedAmbulance === ambulance.ambulance.plate_number
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                    } ${ambulance.is_recommended ? "relative" : ""}`}
                >
                  {ambulance.is_recommended && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <Star size={16} fill="white" />
                    </div>
                  )}
                  <div className="flex items-start">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${selectedAmbulance === ambulance.ambulance.plate_number ? "bg-blue-500 text-white" : "border border-gray-300"
                        }`}
                    >
                      {selectedAmbulance === ambulance.ambulance.plate_number && <Check size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h5 className="font-medium text-gray-900 flex items-center">
                          Ambulancia con placa {ambulance.ambulance.plate_number}
                          {ambulance.is_recommended && (
                            <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                              Recomendada
                            </span>
                          )}
                        </h5>
                        <span className="text-green-600 font-medium">{(ambulance.ambulance.status === "available") ? "Disponible" : "Ocupada"}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          <span><strong>Latitud:</strong> {parseFloat(ambulance.ambulance.latitude).toFixed(4)} | <strong>Longitud:</strong> {parseFloat(ambulance.ambulance.longitude).toFixed(4)} | <strong>Dirección:</strong> {ambulance.ambulance.address}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock size={14} className="mr-1" />
                          <span><strong>Tiempo estimado:</strong> {ambulance.estimated_time} min</span>
                        </div>
                        <div className="mt-1">
                          <span><strong>Capacidad:</strong> {ambulance.ambulance.capacity} personas</span>
                        </div>
                        <div className="mt-1">
                          <span><strong>Última fecha de inspección:</strong> {new Date(ambulance.ambulance.last_inspection_date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAmbulance(ambulance.ambulance.plate_number)}
                    className="mt-2 w-full py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    Seleccionar
                  </button>
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
    </div>
  )
}
