import BaseLayout from "@/layouts/BaseLayout"
import api from "@/api/api"
import React, { useEffect, useState } from "react"
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { useToast } from "@/components/ui/ToastProvider";
import { AlertTriangle, Info, ShieldAlert, Phone, Stethoscope } from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";
import { analyzeWithGemini, AIAnalysisResult } from "@/api/gemini";
import Map from "@/components/dashboard/admin/Map";

const CreateReport = () => {
    const geocodingClientKey = import.meta.env.VITE_MAPBOX_GEOCODING;

    const { pushToast } = useToast();

    const [isActive, setIsActive] = useState<boolean>(true)
    const [isResolved, setIsResolved] = useState<boolean>(false)
    const [direction, setDirection] = useState<string>("")
    const [latitude, setLatitude] = useState<number>(0)
    const [longitude, setLongitude] = useState<number>(0)
    const [description, setDescription] = useState<string>("");
    const [additionalNotes, setAdditionalNotes] = useState<string>("");
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);

    useEffect(() => {
        if (aiAnalysis?.paramedic_recommendations) {
            const recommendationsText = aiAnalysis.paramedic_recommendations.join("\n- ");
            const fullText = `**Recomendaciones para Paramédicos (generado por IA):**\n- ${recommendationsText}`;
            setAdditionalNotes(prev => prev ? `${prev}\n\n${fullText}` : fullText);
        }
    }, [aiAnalysis]);


    const resetFields = () => {
        setIsActive(true)
        setIsResolved(false)
        setDirection("")
        setLatitude(0)
        setLongitude(0)
        setAdditionalNotes("")

        const form = document.querySelector("form") as HTMLFormElement
        if (form) {
            form.reset()
        }

        const latitudeInput = document.getElementById("latitude") as HTMLInputElement
        const longitudeInput = document.getElementById("longitude") as HTMLInputElement
        if (latitudeInput && longitudeInput) {
            latitudeInput.value = "0"
            longitudeInput.value = "0"
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const data = {
            address: formData.get("direction") as string,
            latitude: latitude,
            longitude: longitude,
            caller_phone_number: formData.get("callernumber") as string,
            is_active: isActive,
            is_resolved: isResolved,
            reference_point: formData.get("referencepoint") as string,
            type_place: formData.get("typeplace"),
            severity: formData.get("severity") as string,
            people_involved: parseInt(formData.get("peopleinvolved") as string, 10),
            description: formData.get("description") as string,
            additional_notes: additionalNotes,
        }

        try {
            const response = await api.post("/accident-reports/", JSON.stringify(data))

            if (response.status !== 201) {
                throw new Error("Error al crear el reporte")
            }

            pushToast({
                title: "Reporte de accidente/incidente creado",
                message: "Reporte creado exitosamente en el sistema",
                type: "success",
                duration: 5000,
            });

            resetFields()
        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            pushToast({
                title: "Error al crear el reporte",
                message: "Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo más tarde.",
                type: "error",
                duration: 5000,
            });
        }
    }

    const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsActive(event.target.checked)
    }

    const handleResolvedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsResolved(event.target.checked)
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setDirection(e.target.value)
    };

    const geocodingClient = mbxGeocoding({
        accessToken:
            geocodingClientKey,
    })

    interface Coordinates {
        latitude: number
        longitude: number
    }

    const getCoordinatesFromAddress = async (address: string): Promise<Coordinates | null> => {
        const response = await geocodingClient
            .forwardGeocode({
                query: address,
                limit: 1,
            })
            .send()

        const match = response.body.features[0]
        const latitude = match?.center[1]
        const longitude = match?.center[0]
        setLatitude(latitude)
        setLongitude(longitude)

        if (match) {
            return {
                latitude: match.center[1],
                longitude: match.center[0],
            }
        }
        return null
    }

    return (
        <BaseLayout>
            <section className="bg-white dark:bg-gray-900">
                <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
                    <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Registro de nuevo incidente</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                            <div className="sm:col-span-2">
                                <label htmlFor="direction" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Dirección</label>
                                <input
                                    onChange={async (e) => {
                                        handleChange(e);
                                        const coords = await getCoordinatesFromAddress(
                                            e.target.value
                                        )
                                        if (coords) {
                                            const latitudeInput = document.getElementById("latitude") as HTMLInputElement
                                            const longitudeInput = document.getElementById("longitude") as HTMLInputElement
                                            latitudeInput.value = coords.latitude.toString()
                                            longitudeInput.value = coords.longitude.toString()
                                        }
                                    }}
                                    type="text"
                                    name="direction"
                                    id="direction"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Ingresa la dirección del incidente"
                                    required
                                />
                            </div>
                            <div className="w-full">
                                <label htmlFor="latitude" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Latitud</label>
                                <input type="number" name="latitude" id="latitude" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Latitud registrada" disabled />
                            </div>
                            <div className="w-full">
                                <label htmlFor="longitude" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Longitud</label>
                                <input type="number" name="longitude" id="longitude" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Longitud registrada" disabled />
                            </div>
                            <div className="w-full">
                                <label htmlFor="callernumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Teléfono de quién informa</label>
                                <input type="tel" name="callernumber" id="callernumber" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Ingrese un punto de referencia (si aplica)" />
                            </div>
                            <div className="w-full">
                                <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Estado del incidente</label>
                                <div className="flex justify-center">
                                    <div className="flex items-center me-4">
                                        <input onChange={handleActiveChange} defaultChecked name="isActive" id="isActive" type="checkbox" value="true" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="isActive" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">¿Está activo?</label>
                                    </div>
                                    <div className="flex items-center me-4">
                                        <input onChange={handleResolvedChange} name="isResolved" id="isResolved" type="checkbox" value="true" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label htmlFor="isResolved" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">¿Está resuelto?</label>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full">
                                <label htmlFor="referencepoint" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Punto de referencia</label>
                                <input type="text" name="referencepoint" id="referencepoint" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Ingrese un punto de referencia (si aplica)" />
                            </div>
                            <div className="w-full">
                                <label htmlFor="typeplace" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de lugar</label>
                                <select name="typeplace" id="typeplace" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                    <option>Seleccione un tipo de lugar</option>
                                    <option value={1}>Carretera pública</option>
                                    <option value={2}>Edificio</option>
                                    <option value={3}>Institución pública</option>
                                    <option value={4}>Zona rural</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="severity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Gravedad</label>
                                <select name="severity" id="severity" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                    <option>Seleccione la gravedad del incidente</option>
                                    <option value="BASIC">Gravedad baja/moderada</option>
                                    <option value="UCI">Gravedad alta/Emergencia</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="peopleinvolved" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cantidad de personas involucradas</label>
                                <input type="number" min={1} name="peopleinvolved" id="peopleinvolved" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Ingresa una cantidad de personas involucradas" />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descripción del incidente</label>
                                <textarea
                                    name="description"
                                    id="description"
                                    rows={8}
                                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Ingresa los detalles importantes del incidente"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                                <button
                                    type="button"
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    disabled={!description || loadingAI}
                                    onClick={async () => {
                                        setLoadingAI(true);
                                        const analysis = await analyzeWithGemini(description);
                                        setAiAnalysis(analysis);
                                        setLoadingAI(false);
                                    }}
                                >
                                    {loadingAI ? "Analizando..." : "Analizar descripción"}
                                </button>


                                {aiAnalysis && (
                                    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Severity Card */}
                                        <div className={`p-4 rounded-lg border-l-4 flex items-start gap-3 shadow-sm ${
                                            aiAnalysis.severity === 'UCI' 
                                            ? 'bg-red-50 border-red-500 text-red-800' 
                                            : 'bg-yellow-50 border-yellow-500 text-yellow-800'
                                        }`}>
                                            {aiAnalysis.severity === 'UCI' ? (
                                                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600" />
                                            ) : (
                                                <Info className="h-6 w-6 flex-shrink-0 text-yellow-600" />
                                            )}
                                            <div>
                                                <h4 className="font-bold text-lg flex items-center">
                                                    {aiAnalysis.severity === 'UCI' ? 'Alta Gravedad / Emergencia' : 'Gravedad Moderada / Básica'}
                                                </h4>
                                                <p className="text-sm mt-1 opacity-90 font-medium">{aiAnalysis.severity_reason}</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {/* Recommendations */}
                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                                <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                                    <ShieldAlert className="h-4 w-4 text-blue-500" />
                                                    Recomendaciones de Seguridad
                                                </h5>
                                                <ul className="space-y-2">
                                                    {aiAnalysis.recommendations.map((rec, idx) => (
                                                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                                            <span className="text-blue-400 mt-0.5">•</span>
                                                            {rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Operator Instructions */}
                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                                <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                                    <Phone className="h-4 w-4 text-green-500" />
                                                    Guía para el Operador
                                                </h5>
                                                <ol className="space-y-2">
                                                    {aiAnalysis.operator_instructions.map((inst, idx) => (
                                                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                                                {idx + 1}
                                                            </span>
                                                            {inst}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        </div>
                                         {/* Paramedic Recommendations */}
                                         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                            <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                                                <Stethoscope className="h-4 w-4 text-purple-500" />
                                                Recomendaciones para Paramédicos
                                            </h5>
                                            <ul className="space-y-2">
                                                {aiAnalysis.paramedic_recommendations.map((rec, idx) => (
                                                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                                        <span className="text-purple-400 mt-0.5">•</span>
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}



                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notas adicionales</label>
                                <textarea 
                                    name="notes" 
                                    id="notes" 
                                    rows={8} 
                                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                    placeholder="Ingresa los detalles adicionales que pueden ser útiles"
                                    value={additionalNotes}
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="w-full mt-8">
                                <Map
                                    latitude={latitude || 3.4516}
                                    longitude={longitude || -76.5320}
                                    onLocationChange={(lat, lng) => {
                                        setLatitude(lat);
                                        setLongitude(lng);

                                        const latitudeInput = document.getElementById("latitude") as HTMLInputElement;
                                        const longitudeInput = document.getElementById("longitude") as HTMLInputElement;
                                        if (latitudeInput && longitudeInput) {
                                            latitudeInput.value = lat.toString();
                                            longitudeInput.value = lng.toString();
                                        }
                                    }}
                                />

                            </div>
                        <button type="submit" className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800 bg-red-700">
                            Agregar incidente
                        </button>
                    </form>
                </div>
            </section>
        </BaseLayout>
    )
}

export default CreateReport