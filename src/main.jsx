import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import App from './App.jsx'
import Login from './pages/Login.jsx';
import FAQ from './pages/FAQ.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="login" element={<Login />} />
      <Route path="faq" element={<FAQ />} />
    </Routes>
  </BrowserRouter>,
)
