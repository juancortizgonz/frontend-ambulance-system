import Navbar from "./components/Navbar"
import AdminDashboard from "./app/dashboard/AdminDashboard"
import HospitalDashboard from "./app/dashboard/HospitalDashboard"
import AmbulanceDashboard from "./app/dashboard/AmbulanceDashboard"

const App = () => {
  const role = localStorage.getItem("role")

  return (
    <>
      <Navbar />
      <h2 className="font-bold underline">Home</h2>
      {role === "Admin" && <AdminDashboard />}
      {role === "Hospital" && <HospitalDashboard />}
      {role === "Ambulance" && <AmbulanceDashboard />}
    </>
  )
}

export default App;
