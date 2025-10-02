import React from "react";
import { Link } from "react-router";

export default function AuthLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
                {children}
                <div className="items-center hidden w-full h-full lg:w-1/2 bg-red-600 dark:bg-white/5 lg:grid">
                    <div className="relative flex items-center justify-center z-1">
                        <div className="flex flex-col items-center max-w-xs">
                            <Link to="/" className="block mb-4">
                                <h1 className="text-2xl font-bold text-white">
                                    Sistema inteligente de asignación de ambulancias
                                </h1>
                            </Link>
                            <p className="text-center text-gray-100 dark:text-white/60">
                                Gestión integral de recursos prehospitalarios
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}