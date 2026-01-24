import { ReactNode, useState } from 'react'
import { FaHome } from "react-icons/fa"
import { HiDocumentReport } from "react-icons/hi"
import { FaMapMarkedAlt } from "react-icons/fa"
import { MdLocalHospital } from "react-icons/md"
import { FaAmbulance } from "react-icons/fa"
import { MdContactSupport } from "react-icons/md"
import { PiAmbulanceDuotone } from "react-icons/pi"
import { IoMdAddCircle } from "react-icons/io";
import { UserCircle, LogOut } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth"
import SupportModal from "@/components/modals/SupportModal";

const BaseLayout = ({ children }: { children: ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const { clearAuthInfo } = useAuth()

    const openMenu = () => setSidebarOpen(true);
    const closeMenu = () => setSidebarOpen(false);

    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-opacity-40 sm:hidden"
                    onClick={closeMenu}
                />
            )}

            <header className="fixed top-0 left-0 right-0 z-20">
                <nav className="bg-white border-b border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="flex justify-start items-center">
                            <button onClick={openMenu} aria-expanded={sidebarOpen} aria-controls="app-sidebar" className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                                </svg>
                                <span className="sr-only">Toggle sidebar</span>
                            </button>
                            <a href="/" className="flex mr-4 items-center gap-2">
                                <PiAmbulanceDuotone size={32} className="text-blue-600" />
                                <span className="self-center text-2xl font-bold whitespace-nowrap dark:text-white">S.G.A.</span>
                            </a>
                        </div>
                        <div className="relative">
                            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none">
                                <UserCircle className="w-8 h-8 text-gray-600" />
                                <span className="hidden sm:inline font-medium">{useAuth().role}</span>
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <button
                                        onClick={() => {
                                            clearAuthInfo();
                                            setIsUserMenuOpen(false);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            <aside
                id="app-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } sm:translate-x-0`}
                aria-label="Sidenav"
            >
                <div className="overflow-y-auto py-5 px-3 h-full bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <ul className="space-y-2">
                        <li>
                            <a href="/" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <FaHome />
                                <span className="ml-3">Página principal</span>
                            </a>
                        </li>
                        <li>
                            <a href="/create-report" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <IoMdAddCircle />
                                <span className="ml-3">Crear nuevo reporte</span>
                            </a>
                        </li>
                        <li>
                            <a href="/history" className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="dropdown-pages" data-collapse-toggle="dropdown-pages">
                                <HiDocumentReport />
                                <span className="flex-1 ml-3 text-left whitespace-nowrap">Historial de reportes</span>
                            </a>
                        </li>
                        <li>
                            <a href="/map" className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="dropdown-pages" data-collapse-toggle="dropdown-pages">
                                <FaMapMarkedAlt />
                                <span className="flex-1 ml-3 text-left whitespace-nowrap">Mapa</span>
                            </a>
                        </li>
                        <li>
                            <a href="/hospital-list" className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="dropdown-sales" data-collapse-toggle="dropdown-sales">
                                <MdLocalHospital />
                                <span className="flex-1 ml-3 text-left whitespace-nowrap">Lista de hospitales</span>
                            </a>
                        </li>
                        <li>
                            <a href="/ambulance-list" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <FaAmbulance />
                                <span className="flex-1 ml-3 whitespace-nowrap">Lista de ambulancias</span>
                            </a>
                        </li>
                    </ul>
                    <ul className="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
                        <li>
                            <a 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsSupportOpen(true);
                                }}
                                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
                            >
                                <MdContactSupport />
                                <span className="ml-3">Soporte</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>

            <main className='p-4 sm:ml-64 pt-20 min-h-screen'>
                {children}
            </main>

            <footer className="bg-white rounded-lg shadow sm:flex sm:items-center sm:justify-between p-4 sm:p-6 xl:p-8 dark:bg-gray-800 antialiased">
                <p className="mb-4 text-sm text-center text-gray-500 dark:text-gray-400 sm:mb-0">
                    EISC | Universidad del Valle
                </p>
            </footer>

            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
        </>
    )
}

export default BaseLayout