import Modal from "@/components/Modal"
import React, { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { reportAccident } from "@/services/services"
import { AccidentReport } from "@/types/interfaces";


const AdminDashboard: React.FC = () => {
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
    const [errors, setErrors] =useState<{ [key: string]: string }>({})

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    // ToDo: "Datetime has wrong format. Use one of these formats instead: YYYY-MM-DDThh:mm[:ss[.uuuuuu]][+HH:MM|-HH:MM|Z]."
    // When trying to make the POST to the DB

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

    const toSnakeCase = (obj: Record<string, any>): AccidentReport => {
        const newObject: any = {}
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = key.replace(/([A-Z])/g,"_$1").toLowerCase()
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
                accidentTime: selectedDate?.toISOString(),
            }

            const snakeCaseData = toSnakeCase(data)

            try {
                console.log(`Data para el POST: ${JSON.stringify(snakeCaseData, null, 2)}`)
                await reportAccident(snakeCaseData)
                closeModal()
            } catch (error) {
                if (error instanceof Error) {
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
            <div className="p-4">
                <div
                    onClick={openModal}
                    className="cursor-pointer p-4 bg-gray-200 rounded shadow hover:bg-gray-300"
                >
                    Reportar un nuevo accidente
                </div>
                <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Fecha del accidente</label>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                showTimeSelect
                                dateFormat="Pp"
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Descripción</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded"
                                onChange={handleChange}
                                name="description"
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">¿Está activo?</label>
                            <input
                                type="checkbox"
                                className="w-full px-3 py-2 border rounded"
                                id="isActive"
                                name="isActive"
                                defaultChecked={true}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">¿Está resuelto?</label>
                            <input
                                type="checkbox"
                                className="w-full px-3 py-2 border rounded"
                                defaultChecked={false}
                                onChange={handleChange}
                                name="isResolved"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Nivel del accidente</label>
                            <input placeholder="Selecciona un nivel" type="text" list="severity" name="severity" onChange={handleChange} />
                            <datalist id="severity">
                                <option value="Básico">Básico</option>
                                <option value="UCI">UCI - Requieren atención de emergencia</option>
                            </datalist>
                            {errors.severity && <p className="text-red-500">{errors.severity}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700">Dirección del incidente</label>
                            <input placeholder="Dirección detallada del incidente" type="text" name="address" onChange={handleChange} />
                            {errors.address && <p className="text-red-500">{errors.address}</p>}
                        </div>
                        <button
                            type="submit"
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Guardar
                        </button>
                    </form>
                </Modal>
            </div>
        </>
    )
}

export default AdminDashboard;