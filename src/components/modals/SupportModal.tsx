import React, { useState, useEffect } from "react";
import { 
  X, 
  ArrowLeft, 
  FilePlus, 
  Ambulance, 
  Map, 
  LifeBuoy, 
  ChevronRight 
} from "lucide-react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TopicKey = 'report' | 'resources' | 'map';

interface TopicContent {
  id: TopicKey;
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
  content: React.ReactNode;
}

const TOPICS: TopicContent[] = [
  {
    id: 'report',
    title: "Creación de Reportes",
    icon: FilePlus,
    color: "text-orange-500",
    description: "Aprende a registrar incidentes y utilizar la IA para clasificar la gravedad.",
    content: (
      <div className="space-y-4 text-gray-600 dark:text-gray-300">
        <p>
          El módulo de <strong>Creación de Reportes</strong> permite registrar incidentes en tiempo real. 
          Cuenta con asistencia de Inteligencia Artificial para facilitar la toma de decisiones.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Formulario Inteligente:</strong> Ingresa una descripción en lenguaje natural y haz clic en 
            "Analizar" para que el sistema sugiera automáticamente la gravedad (Básica o UCI) y brinde recomendaciones.
          </li>
          <li>
            <strong>Geolocalización:</strong> Al ingresar una dirección, el sistema calcula automáticamente 
            las coordenadas (latitud y longitud). También puedes ajustar la ubicación manualmente en el mapa.
          </li>
          <li>
            <strong>Estado del Reporte:</strong> Puedes marcar el incidente como "Activo" o "Resuelto" desde el momento de su creación.
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'resources',
    title: "Recursos APH",
    icon: Ambulance,
    color: "text-blue-500",
    description: "Consulta y gestiona la flota de ambulancias y la red hospitalaria disponible.",
    content: (
      <div className="space-y-4 text-gray-600 dark:text-gray-300">
        <p>
          El módulo de <strong>Recursos de Atención Prehospitalaria (APH)</strong> centraliza la información 
          vital para la gestión de emergencias.
        </p>
        <div className="grid grid-cols-1 gap-4 mt-2">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Ambulance className="h-4 w-4" /> Ambulancias
            </h4>
            <p className="text-sm">
              Visualiza el estado de cada unidad (Disponible, En uso, Mantenimiento), su capacidad y última inspección. 
              Usa los filtros para encontrar rápidamente unidades libres.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <span className="text-red-500 font-bold text-lg">+</span> Hospitales
            </h4>
            <p className="text-sm">
              Accede al directorio de hospitales, verificando su nivel de complejidad, disponibilidad de camas y datos de contacto.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'map',
    title: "Mapa Interactivo",
    icon: Map,
    color: "text-green-500",
    description: "Monitoreo geoespacial de incidentes y ubicación de recursos en tiempo real.",
    content: (
      <div className="space-y-4 text-gray-600 dark:text-gray-300">
        <p>
          El <strong>Mapa Interactivo</strong> es el centro de control visual del sistema. Permite una 
          comprensión espacial inmediata de la situación operativa.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Marcadores en Tiempo Real:</strong> Visualiza iconos diferenciados para Accidentes (con código de color por gravedad), 
            Ambulancias en movimiento y Hospitales.
          </li>
          <li>
            <strong>Detalles Rápidos:</strong> Haz clic en cualquier marcador para desplegar una tarjeta con información resumen 
            (Placa, Dirección, Estado) sin salir del mapa.
          </li>
          <li>
            <strong>Navegación:</strong> Utiliza los controles de zoom y desplazamiento para enfocar áreas específicas de la ciudad.
          </li>
        </ul>
      </div>
    )
  }
];

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicKey | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setSelectedTopic(null), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTopic = selectedTopic ? TOPICS.find(t => t.id === selectedTopic) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            {selectedTopic ? (
              <button 
                onClick={() => setSelectedTopic(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            ) : (
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <LifeBuoy className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedTopic && currentTopic ? currentTopic.title : "Centro de Soporte"}
              </h2>
              {!selectedTopic && (
                <p className="text-xs text-gray-500 dark:text-gray-400">¿En qué podemos ayudarte hoy?</p>
              )}
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {selectedTopic && currentTopic ? (
            // Detail View
            <div className="animate-in slide-in-from-right-8 duration-300">
              <div className={`inline-flex p-3 rounded-xl mb-6 ${currentTopic.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-20`}>
                <currentTopic.icon className={`h-8 w-8 ${currentTopic.color}`} />
              </div>
              {currentTopic.content}
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-left-4 duration-300">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`
                    group relative p-6 rounded-xl border border-gray-200 dark:border-gray-700 
                    hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md 
                    transition-all duration-200 text-left bg-white dark:bg-gray-800
                    flex flex-col gap-4
                  `}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className={`p-3 rounded-lg bg-opacity-10 ${topic.color.replace('text-', 'bg-')} dark:bg-opacity-20`}>
                      <topic.icon className={`h-6 w-6 ${topic.color}`} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {topic.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer (Optional) */}
        {!selectedTopic && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
            <p className="text-xs text-gray-500">
              Versión del sistema 1.0.0 | Universidad del Valle - EISC
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportModal;
