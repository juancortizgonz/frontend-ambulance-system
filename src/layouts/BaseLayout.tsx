import { ReactNode, useState } from 'react'
import { FaHome } from "react-icons/fa"
import { HiDocumentReport } from "react-icons/hi"
import { FaMapMarkedAlt } from "react-icons/fa"
import { MdLocalHospital } from "react-icons/md"
import { FaAmbulance } from "react-icons/fa"
import { MdContactSupport } from "react-icons/md"
import { PiAmbulanceDuotone } from "react-icons/pi"
import { IoMdAddCircle } from "react-icons/io";
import { useAuth } from "@/hooks/useAuth"

const BaseLayout = ({ children }: { children: ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

            <header className="antialiased sm:ml-64 px-4 py-6">
                <nav className="flex justify-between bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="flex justify-start items-center">
                            <button onClick={openMenu} aria-expanded="true" aria-controls="sidebar" className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                <svg className="w-[18px] h-[18px]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" /></svg>
                                <span className="sr-only">Toggle sidebar</span>
                            </button>
                            <a href="/" className="flex mr-4 items-center gap-2">
                                <PiAmbulanceDuotone />
                                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">S.G.A.</span>
                            </a>
                        </div>
                    </div>
                    <button className='bg-red-500 py-2 px-3 text-white rounded-sm font-semibold hover:bg-red-700 transition-all' onClick={clearAuthInfo}>Cerrar sesión</button>
                </nav>
            </header>

            <aside
                id="default-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                            <a href="#" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                                <MdContactSupport />
                                <span className="ml-3">Soporte</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>

            <main className='sm:ml-64 px-4 py-6 min-h-screen'>
                {children}
            </main>

            <footer className="bg-white rounded-lg shadow sm:flex sm:items-center sm:justify-between p-4 sm:p-6 xl:p-8 dark:bg-gray-800 antialiased">
                <p className="mb-4 text-sm text-center text-gray-500 dark:text-gray-400 sm:mb-0">
                    EISC | Universidad del Valle
                </p>
            </footer>
        </>
    )
}

export default BaseLayout