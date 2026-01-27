import BaseLayout from "@/layouts/BaseLayout"
import api from "@/api/api"
import React, { useEffect, useMemo, useState } from "react"
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { useToast } from "@/components/ui/ToastProvider";
import { AlertTriangle, Info, ShieldAlert, Phone, Stethoscope, Car, Building, Landmark, Mountain, ShieldCheck, Siren } from "lucide-react";

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
    const [typePlace, setTypePlace] = useState<string | null>(null);
    const [severity, setSeverity] = useState<string | null>(null);
    const [description, setDescription] = useState<string>("");
    const [additionalNotes, setAdditionalNotes] = useState<string>("");
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [splitRecommendation, setSplitRecommendation] = useState<number>(0);

    interface AmbulanceData {
        id: number;
        plate_number: string;
        ambulance_type: "BASIC" | "UCI";
        status: "available" | "in_use" | "out_of_service";
        capacity: number;
        last_inspection_date: string;
        latitude: number;
        longitude: number;
    }

    const [ambulances, setAmbulances] = useState<AmbulanceData[]>([]);

    useEffect(() => {
        const fetchAmbulances = async () => {
            try {
                const response = await api.get("/ambulances/");
                const availableAmbulances = response.data.filter(
                    (amb: AmbulanceData) => amb.status === 'available'
                );
                setAmbulances(availableAmbulances);
            } catch (error) {
                console.error("Error fetching ambulances:", error);
                pushToast({
                    title: "Error de Red",
                    message: "No se pudieron cargar los datos de las ambulancias.",
                    type: "error",
                });
            }
        };
        fetchAmbulances();
    }, []);

    const { maxCapacity, totalBasicCapacity, totalUciCapacity } = useMemo(() => {
        return ambulances.reduce(
            (acc, amb) => {
                acc.maxCapacity = Math.max(acc.maxCapacity, amb.capacity);
                if (amb.ambulance_type === 'BASIC') {
                    acc.totalBasicCapacity += amb.capacity;
                } else if (amb.ambulance_type === 'UCI') {
                    acc.totalUciCapacity += amb.capacity;
                }
                return acc;
            },
            { maxCapacity: 0, totalBasicCapacity: 0, totalUciCapacity: 0 }
        );
    }, [ambulances]);

    const handleValidateAvailability = () => {
        const peopleInvolvedInput = document.getElementById("peopleinvolved") as HTMLInputElement;
        const peopleInvolved = parseInt(peopleInvolvedInput.value, 10);

        if (isNaN(peopleInvolved) || peopleInvolved <= 0) {
            pushToast({
                title: "Dato Inválido",
                message: "Por favor, ingresa un número válido de personas involucradas.",
                type: "warning",
            });
            return;
        }

        if (!severity) {
            pushToast({
                title: "Selección Requerida",
                message: "Por favor, selecciona primero la gravedad del incidente.",
                type: "warning",
            });
            return;
        }

        if (peopleInvolved > maxCapacity) {
            const numReports = Math.ceil(peopleInvolved / maxCapacity);
            setSplitRecommendation(numReports);
            pushToast({
                title: "Alerta de Capacidad",
                message: `Se recomienda dividir el reporte en ${numReports} partes.`,
                type: "warning",
                duration: 8000,
            });
            return;
        }

        const relevantTotalCapacity = severity === 'UCI' ? totalUciCapacity : totalBasicCapacity;
        if (peopleInvolved > relevantTotalCapacity) {
            pushToast({
                title: "Alerta de Capacidad Total",
                message: `El número de afectados (${peopleInvolved}) supera la capacidad total para emergencias de tipo ${severity} (${relevantTotalCapacity}).`,
                type: "error",
                duration: 8000,
            });
        } else {
            setSplitRecommendation(0);
            pushToast({
                title: "Disponibilidad Confirmada",
                message: `Capacidad suficiente para atender a ${peopleInvolved} personas.`,
                type: "success",
            });
        }
    };

    const handleSplitReport = async () => {
        if (splitRecommendation <= 1) return;

        const formElement = document.querySelector("form") as HTMLFormElement;
        if (!formElement) return;
        
        const formData = new FormData(formElement);
        const originalPeopleInvolved = parseInt(formData.get("peopleinvolved") as string, 10);
        
        let remainingPeople = originalPeopleInvolved;
        const reportsArray = [];

        for (let i = 1; i <= splitRecommendation; i++) {
            const peopleForThisReport = Math.min(remainingPeople, maxCapacity);
            remainingPeople -= peopleForThisReport;

            const reportData = {
                address: formData.get("direction") as string,
                latitude: latitude,
                longitude: longitude,
                caller_phone_number: formData.get("callernumber") as string,
                is_active: isActive,
                is_resolved: isResolved,
                reference_point: formData.get("referencepoint") as string,
                type_place: typePlace,
                severity: severity,
                people_involved: peopleForThisReport,
                description: `(Reporte ${i} de ${splitRecommendation}) ${formData.get("description") as string}`,
                additional_notes: additionalNotes,
            };
            reportsArray.push(reportData);
        }

        try {
            const response = await api.post("/accident-reports-bulk/", JSON.stringify(reportsArray));

            if (response.status === 201) {
                pushToast({
                    title: "Reportes Divididos Creados",
                    message: `${splitRecommendation} reportes han sido creados exitosamente.`,
                    type: "success",
                    duration: 5000,
                });
                resetFields();
                setSplitRecommendation(0);
            } else {
                throw new Error(`Error creating bulk reports: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error al crear reportes divididos:", error);
            pushToast({
                title: "Error al Dividir Reporte",
                message: "Ocurrió un error al crear los reportes divididos.",
                type: "error",
                duration: 5000,
            });
        }
    };


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
        setTypePlace(null)
        setSeverity(null)

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
            type_place: typePlace,
            severity: severity,
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

    const placeOptions = [
        { value: "1", label: "Carretera", icon: <Car className="w-5 h-5 mr-2" /> },
        { value: "2", label: "Edificio", icon: <Building className="w-5 h-5 mr-2" /> },
        { value: "3", label: "Institución", icon: <Landmark className="w-5 h-5 mr-2" /> },
        { value: "4", label: "Zona Rural", icon: <Mountain className="w-5 h-5 mr-2" /> },
    ];

    const severityOptions = [
        { value: "BASIC", label: "Básica", icon: <ShieldCheck className="w-5 h-5 mr-2" /> },
        { value: "UCI", label: "Emergencia", icon: <Siren className="w-5 h-5 mr-2" /> },
    ];

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
                            <div className="w-full relative group">
                                <label htmlFor="latitude" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Latitud</label>
                                <input type="number" name="latitude" id="latitude" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Latitud registrada" disabled />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none z-10 whitespace-nowrap">
                                    Estos campos se autocompletan al ingresar la dirección.
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+4px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-3 h-3 bg-gray-800 rotate-45 pointer-events-none z-10"></div>
                            </div>
                            <div className="w-full relative group">
                                <label htmlFor="longitude" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Longitud</label>
                                <input type="number" name="longitude" id="longitude" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Longitud registrada" disabled />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none z-10 whitespace-nowrap">
                                    Estos campos se autocompletan al ingresar la dirección.
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+4px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-3 h-3 bg-gray-800 rotate-45 pointer-events-none z-10"></div>
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
                                <div className="grid grid-cols-2 gap-2">
                                    {placeOptions.map((option) => (
                                        <button
                                            type="button"
                                            key={option.value}
                                            onClick={() => setTypePlace(option.value)}
                                            className={`flex items-center justify-center p-2.5 text-sm font-medium rounded-lg border ${typePlace === option.value
                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                    : "bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                                }`}
                                        >
                                            {option.icon}
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="severity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Gravedad</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {severityOptions.map((option) => (
                                        <button
                                            type="button"
                                            key={option.value}
                                            onClick={() => setSeverity(option.value)}
                                            className={`flex items-center justify-center p-2.5 text-sm font-medium rounded-lg border ${severity === option.value
                                                    ? "bg-red-600 border-red-600 text-white"
                                                    : "bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                                }`}
                                        >
                                            {option.icon}
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="peopleinvolved" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cantidad de personas involucradas</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" min={1} name="peopleinvolved" id="peopleinvolved" onChange={() => setSplitRecommendation(0)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Ingresa una cantidad" />
                                    <button type="button" onClick={handleValidateAvailability} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold whitespace-nowrap">
                                        Validar Disp.
                                    </button>
                                </div>
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
                        <div className="flex items-center gap-4 mt-4 sm:mt-6">
                            <button type="submit" className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800 bg-red-700">
                                Agregar incidente
                            </button>
                            {splitRecommendation > 1 && (
                                <button
                                    type="button"
                                    onClick={handleSplitReport}
                                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:ring-green-300"
                                >
                                    Generar {splitRecommendation} Reportes Divididos
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </section>
        </BaseLayout>
    )
}

export default CreateReport