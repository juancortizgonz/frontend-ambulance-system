import BaseLayout from "@/layouts/BaseLayout";
import { useEffect, useState, useMemo } from "react";
import api from "@/api/api";
import { 
    Hospital, 
    Search, 
    MapPin, 
    Phone, 
    Activity, 
    CheckCircle2, 
    XCircle, 
    Bed,
    Filter
} from "lucide-react";

interface HospitalData {
    id: number;
    name: string;
    address: string;
    level: string;
    phone_number: string;
    bed_capacity: number;
    is_available: boolean;
    description: string;
}

const HospitalList = () => {
    const [hospitals, setHospitals] = useState<HospitalData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'available', 'unavailable'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const response = await api.get("/hospitals/");
                setHospitals(response.data);
            } catch (error) {
                console.error("Error fetching hospitals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHospitals();
    }, []);

    const filteredHospitals = useMemo(() => {
        return hospitals.filter(hosp => {
            const matchesSearch = hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  hosp.address.toLowerCase().includes(searchTerm.toLowerCase());
            
            let matchesStatus = true;
            if (statusFilter === 'available') matchesStatus = hosp.is_available;
            if (statusFilter === 'unavailable') matchesStatus = !hosp.is_available;

            return matchesSearch && matchesStatus;
        });
    }, [hospitals, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: hospitals.length,
            available: hospitals.filter(h => h.is_available).length,
            unavailable: hospitals.filter(h => !h.is_available).length,
        };
    }, [hospitals]);

    return (
        <BaseLayout>
             <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Hospital className="h-8 w-8 text-red-600" />
                            Red Hospitalaria
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de centros médicos y capacidad</p>
                    </div>
                    
                    <div className="flex gap-2">
                         {/* Summary Cards */}
                        <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                                <Hospital className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{stats.total}</p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Disponibles</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{stats.available}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar hospital o dirección..." 
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-500 font-medium shrink-0">Estado:</span>
                        <div className="flex gap-2">
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'available', label: 'Disponibles' },
                                { id: 'unavailable', label: 'No Disponibles' }
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setStatusFilter(filter.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                                        statusFilter === filter.id 
                                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        ))}
                    </div>
                ) : filteredHospitals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredHospitals.map((hospital) => (
                            <div 
                                key={hospital.id} 
                                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                            >
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                            <Hospital className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${
                                            hospital.is_available 
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                            : 'bg-gray-100 text-gray-800 border-gray-200'
                                        }`}>
                                            {hospital.is_available ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                            {hospital.is_available ? 'Disponible' : 'No Dispon.'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1" title={hospital.name}>
                                        {hospital.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            Nivel {hospital.level}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                            <span className="line-clamp-2 text-xs">{hospital.address}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-xs">{hospital.phone_number}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <Bed className="h-4 w-4 text-gray-400" />
                                            <span className="text-xs">Capacidad: <span className="font-semibold text-gray-900 dark:text-white">{hospital.bed_capacity}</span> camas</span>
                                        </div>
                                    </div>
                                    
                                    {hospital.description && (
                                        <p className="mt-4 text-xs text-gray-500 line-clamp-2 border-t pt-3 border-gray-100 dark:border-gray-700">
                                            {hospital.description}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                    <button className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Ver detalles <Activity className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No se encontraron hospitales</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                )}
            </div>
        </BaseLayout>
    );
}

export default HospitalList;
