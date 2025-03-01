import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from './context/AuthContext.js'
import App from './App.jsx'
import './index.css';
import Login from './pages/Login.jsx';
import FAQ from './pages/FAQ.jsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="login" element={<Login />} />
          <Route path="faq" element={<FAQ />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>,
  );
} else {
  console.error('Root element not found');
}
