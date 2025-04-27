import Modal from "@/components/Modal"
import React, { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { reportAccident } from "@/services/services"
import { AccidentReport } from "@/types/interfaces"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { NavLink } from "react-router"
import Button from "@/components/ui/button/Button"
import { useAuth } from "@/hooks/useAuth"

// Icons
import { FiPlusCircle, FiList } from "react-icons/fi"


const AdminDashboard: React.FC = () => {
    const { clearAuthInfo } = useAuth()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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
        severity: "BASIC"
    })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const element = e.target
        const { name, value, type, checked } = element as HTMLInputElement
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const isValid = (): boolean => {
        const newErrors: { [key: string]: string } = {}
        if (!formData.address) newErrors.address = "La dirección del accidente es requerida."
        if (!formData.severity) newErrors.severity = "La severidad del accidente es requerida."
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const formatDate = (date: Date | null): string | undefined => {
        if (!date) return undefined
        return date.toISOString().split(".")[0] + "Z"
    }

    const toSnakeCase = (obj: Record<string, any>): AccidentReport => {
        const newObject: any = {}
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
                newObject[newKey] = obj[key]
            }
        }
        return newObject
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isValid()) {
            const data = {
                ...formData,
                accidentTime: formatDate(selectedDate),
            }

            const snakeCaseData = toSnakeCase(data)

            try {
                console.log(`Data para el POST: ${JSON.stringify(snakeCaseData, null, 2)}`)
                await reportAccident(snakeCaseData)
                toast.success("Reporte de accidente creado satisfactoriamente.")
                closeModal()
            } catch (error) {
                if (error instanceof Error) {
                    toast.error("Hubo un error al crear el reporte. Intente de nuevo.")
                    console.error(`Ocurrió un error al reportar el accidente: ${error}`)
                } else {
                    console.error(`Ocurrió un error desconocido: ${error}`)
                }
            }
        }
    }

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

                <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <form onSubmit={handleSubmit} className="flex flex-col">

                        <h2 className="text-3xl font-bold mb-4">Crear un nuevo reporte de accidente</h2>
                        <div className="flex gap-x-8">
                            <div className="w-1/2">
                                <div className="mb-4">
                                    <label htmlFor="accidentDate" className="block text-gray-700 font-semibold">Fecha del accidente</label>
                                    <DatePicker
                                        id="accidentDate"
                                        selected={selectedDate}
                                        onChange={(date) => setSelectedDate(date)}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="description" className="block text-gray-700 font-semibold">Descripción</label>
                                    <textarea
                                        id="description"
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={handleChange}
                                        name="description"
                                    ></textarea>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="isActive" className="block text-gray-700 font-semibold">¿Está activo?</label>
                                    <input
                                        type="checkbox"
                                        className="w-6 h-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        id="isActive"
                                        name="isActive"
                                        defaultChecked={true}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="isResolved" className="block text-gray-700 font-semibold">¿Está resuelto?</label>
                                    <input
                                        type="checkbox"
                                        className="w-6 h-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultChecked={false}
                                        onChange={handleChange}
                                        name="isResolved"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-4">
                                    <label htmlFor="severity" className="block text-gray-700 font-semibold">Nivel del accidente</label>
                                    <input id="severity" placeholder="Selecciona un nivel" type="text" list="severityOptions" name="severity" onChange={handleChange} />
                                    <datalist id="severityOptions">
                                        <option value="BASIC">Básico</option>
                                        <option value="UCI">UCI</option>
                                    </datalist>
                                    {errors.severity && <p className="text-red-500">{errors.severity}</p>}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="latitude" className="block text-gray-700 font-semibold">Latitud</label>
                                    <input id="latitude" placeholder="Latitud" type="number" step="any" name="latitude" onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="longitude" className="block text-gray-700 font-semibold">Longitud</label>
                                    <input id="longitude" placeholder="Longitud" type="number" step="any" name="longitude" onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="address" className="block text-gray-700 font-semibold">Dirección del incidente</label>
                                    <input id="address" placeholder="Dirección detallada del incidente" type="text" name="address" onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    {errors.address && <p className="text-red-500">{errors.address}</p>}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Guardar
                        </button>
                    </form>
                </Modal>
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
        </>
    )
}

export default AdminDashboard;