import { NavLink } from "react-router";
import { ReactNode } from "react";

import { IoHomeOutline, IoMap } from "react-icons/io5";
import { MdHistory } from "react-icons/md";

const DashboardLayout: React.FC<{ children: ReactNode; role: string }> = ({ children, role }) => {

    return (
        <div className="h-screen flex-1 flex overflow-hidden">
            {role === "Admin" && (
                <nav aria-label="Sidebar" className="py-5 narrow-sidebar hidden lg:block lg:flex-shrink-0 lg:bg-stone-50 lg:overflow-y-auto">
                    <div className="relative w-20 flex space-y-16 flex-col p-3">
                        <NavLink to="" className="flex flex-col items-center text-gray-600 hover:text-red-700">
                            <div className="flex-shrink-0 inline-flex items-center justify-center w-14">
                                <IoHomeOutline />
                            </div>
                            <div className="text-center text-xs font-normal ">Inicio</div>
                        </NavLink>

                        <NavLink to="/map" className="text-gray-600 hover:text-red-500">
                            <div className="flex-shrink-0 inline-flex items-center justify-center w-14">
                                <IoMap />
                            </div>
                            <div className="text-center text-xs font-normal ">Mapa</div>
                        </NavLink>

                        <NavLink to="/history" className="text-gray-600 hover:text-red-700">
                            <div className="flex-shrink-0 inline-flex items-center justify-center w-14">
                                <MdHistory />
                            </div>
                            <div className="text-center text-xs font-normal ">Historial</div>
                        </NavLink>
                    </div>
                </nav>
            )}
        </div>
    );
};

export default DashboardLayout;