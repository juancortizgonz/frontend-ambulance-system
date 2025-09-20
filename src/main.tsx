import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import App from './App.jsx'
import './index.css';
import Login from './pages/AuthPages/Login.js';
import FAQ from './pages/FAQ.jsx';
import AccidentReportHistory from "./pages/AccidentReportHistory"
import { AuthProvider } from './context/AuthContext.js';
import CreateReport from './pages/create/CreateReport.js';
import HospitalList from './components/dashboard/admin/HospitalList.js';
import AmbulanceList from './components/dashboard/admin/AmbulanceList.js';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="login" element={<Login />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="history" element={<AccidentReportHistory />} />
            <Route path="create-report" element={<CreateReport />} />
            <Route path="hospital-list" element={<HospitalList />} />
            <Route path="ambulance-list" element={<AmbulanceList />} />
          </Routes>
        </AuthProvider>
    </BrowserRouter>,
  );
} else {
  console.error('Root element not found');
}
