import BaseLayout from "@/layouts/BaseLayout";
import { useEffect, useState, useMemo } from "react";
import api from "@/api/api";
import { 
    Ambulance, 
    Search, 
    MapPin, 
    Users, 
    Calendar, 
    Activity, 
    CheckCircle2, 
    AlertCircle, 
    Clock,
    Filter
} from "lucide-react";

interface AmbulanceData {
    id: number;
    plate_number: string;
    ambulance_type: string;
    status: 'available' | 'in_use' | 'out_of_service';
    capacity: number;
    last_inspection_date: string;
    latitude: number;
    longitude: number;
}

const AmbulanceList = () => {
    const [ambulances, setAmbulances] = useState<AmbulanceData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAmbulances = async () => {
            try {
                const response = await api.get("/ambulances/");
                setAmbulances(response.data);
            } catch (error) {
                console.error("Error fetching ambulances:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAmbulances();
    }, []);

    const filteredAmbulances = useMemo(() => {
        return ambulances.filter(amb => {
            const matchesSearch = amb.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  amb.ambulance_type.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || amb.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [ambulances, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: ambulances.length,
            available: ambulances.filter(a => a.status === 'available').length,
            busy: ambulances.filter(a => a.status === 'in_use').length,
            maintenance: ambulances.filter(a => a.status === 'out_of_service').length,
        };
    }, [ambulances]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'available':
                return { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2, label: 'Disponible' };
            case 'in_use':
                return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, label: 'En Servicio' };
            case 'out_of_service':
                return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle, label: 'Fuera de Servicio' };
            default:
                return { color: 'bg-gray-100 text-gray-800', icon: Activity, label: status };
        }
    };

    return (
        <BaseLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Ambulance className="h-8 w-8 text-blue-600" />
                            Flota de Ambulancias
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión y monitoreo de unidades en tiempo real</p>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* Summary Cards */}
                        <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                                <Ambulance className="h-4 w-4" />
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
                                <p className="text-xs text-gray-500 font-medium">Libres</p>
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
                            placeholder="Buscar por placa o tipo..." 
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-500 font-medium shrink-0">Estado:</span>
                        <div className="flex gap-2">
                            {[
                                { id: 'all', label: 'Todas' },
                                { id: 'available', label: 'Disponibles' },
                                { id: 'in_use', label: 'En Uso' },
                                { id: 'out_of_service', label: 'Mantenimiento' }
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
                ) : filteredAmbulances.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAmbulances.map((ambulance) => {
                            const statusConfig = getStatusConfig(ambulance.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div 
                                    key={ambulance.id} 
                                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                                >
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                                <Ambulance className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${statusConfig.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                            {ambulance.plate_number}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium uppercase tracking-wide text-xs">
                                            {ambulance.ambulance_type}
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span>Capacidad: <span className="font-semibold text-gray-900 dark:text-white">{ambulance.capacity}</span></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="truncate">Insp: {ambulance.last_inspection_date}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span className="truncate text-xs font-mono bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded">
                                                    {Number(ambulance.latitude || 0).toFixed(4)}, {Number(ambulance.longitude || 0).toFixed(4)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Ver detalles <Activity className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No se encontraron ambulancias</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                )}
            </div>
        </BaseLayout>
    );
}

export default AmbulanceList;
