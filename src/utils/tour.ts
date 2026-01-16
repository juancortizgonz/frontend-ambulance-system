import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startDashboardTour = (force = false) => {
  if (!force) {
    const hasSeen = localStorage.getItem('dashboardTourSeen');
    if (hasSeen) return;
  }

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    doneBtnText: 'Hecho',
    closeBtnText: 'Cerrar',
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    steps: [
      { 
        element: '#app-sidebar', 
        popover: { 
          title: 'Menú de Navegación', 
          description: 'Aquí encontrarás acceso rápido a todas las funcionalidades del sistema, como el historial, mapas y listas de recursos.',
          side: "right",
          align: 'start'
        } 
      },
      { 
        element: '#btn-create-report', 
        popover: { 
          title: 'Generar Nuevo Reporte', 
          description: 'Haz clic aquí para registrar un nuevo accidente en el sistema de forma inmediata.',
          side: "bottom", 
          align: 'start'
        } 
      },
      { 
        element: '#btn-view-history', 
        popover: { 
          title: 'Historial de Accidentes', 
          description: 'Consulta el registro histórico de todos los accidentes reportados y su estado.',
          side: "bottom", 
          align: 'start'
        } 
      },
    ],
    onDestroyed: () => {
      if (!force) {
          localStorage.setItem('dashboardTourSeen', 'true');
      }
    }
  });

  driverObj.drive();
};