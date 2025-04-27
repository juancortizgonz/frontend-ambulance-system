import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import App from './App.jsx'
import './index.css';
import Login from './pages/AuthPages/Login.js';
import FAQ from './pages/FAQ.jsx';
import AccidentReportHistory from "./pages/AccidentReportHistory"

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="login" element={<Login />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="history" element={<AccidentReportHistory />} />
        </Routes>
    </BrowserRouter>,
  );
} else {
  console.error('Root element not found');
}
