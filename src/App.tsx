import Navbar from "./components/Navbar";
import AdminDashboard from "./app/dashboard/AdminDashboard";
import HospitalDashboard from "./app/dashboard/HospitalDashboard";
import AmbulanceDashboard from "./app/dashboard/AmbulanceDashboard";

import { useAuth } from "./hooks/useAuth"

const App = () => {
  const { role } = useAuth();
  console.log(`El rol es: ${role}`);

  if (role === "Admin") return <AdminDashboard />;
  if (role === "Hospital") return <HospitalDashboard />;
  if (role === "Ambulance") return <AmbulanceDashboard />;

  // Si no hay rol definido, renderizar Navbar y h2
  return (
    <>
      <Navbar />
      <h2 className="font-bold underline">Home</h2>
    </>
  );
};

export default App;
