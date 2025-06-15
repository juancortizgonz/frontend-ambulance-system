import AdminDashboard from "./app/dashboard/AdminDashboard";
import HospitalDashboard from "./app/dashboard/HospitalDashboard";
import AmbulanceDashboard from "./app/dashboard/AmbulanceDashboard";
import Footer from "@/components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";

import { useAuth } from "./hooks/useAuth";

const App = () => {
  const { role } = useAuth();
  console.log(`El rol es: ${role}`);

  const handleLoginClick = () => {
    window.location.href = "/login";
  };

  const handleFaqClick = () => {
    window.location.href = "/faq";
  };

  if (role === "Admin") return <AdminDashboard />;
  if (role === "Hospital") return <HospitalDashboard />;
  if (role === "Ambulance") return <AmbulanceDashboard />;

  // Si no hay rol definido, renderizar Navbar y h2
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-100 text-center p-6">
        <h1 className="text-4xl font-bold text-red-700 mb-4">Sistema de Gestión de Ambulancias</h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Optimiza la administración de recursos, mejora la eficiencia operativa y brinda una mejor atención en emergencias.
        </p>
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleLoginClick}
            className="bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-red-400 transition w-48"
          >
            Acceso Administradores
          </button>
          <button
            onClick={handleFaqClick}
            className="bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-red-400 transition w-48"
          >
            FAQ
          </button>
        </div>
        <div className="mt-12 flex space-x-8">
          <div className="bg-white p-6 rounded-lg shadow-md w-64">
            <h3 className="text-xl font-semibold text-red-700">Gestión en Tiempo Real</h3>
            <p className="text-gray-600 mt-2">Monitorea y asigna ambulancias de manera eficiente.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md w-64">
            <h3 className="text-xl font-semibold text-red-700">Reportes y Estadísticas</h3>
            <p className="text-gray-600 mt-2">Obtén análisis detallados de los servicios de ambulancia.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
