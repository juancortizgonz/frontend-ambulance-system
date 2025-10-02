import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { BASE_URL } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";
import { ToastContainer, toast } from "react-toastify";

export default function LoginForm() {
    const { setAuthInfo } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            const response = await fetch(`${BASE_URL}/auth/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (!response.ok) {
                toast.warn('Las credenciales no son válidas.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    });
                throw new Error("Las credenciales son incorrectas. Por favor, verifica tu usuario y contraseña.");
            }

            const result = await response.json();

            setAuthInfo(result.token, result.groups[0], result.user_id);
            navigate("/");
        } catch (error) {
            console.error("Ocurrió un error al iniciar sesión: ", error);
        }
    }

    return (
        <div className="flex flex-col flex-1">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="w-full max-w-md pt-10 mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12l14 0" /><path d="M5 12l4 4" /><path d="M5 12l4 -4" /></svg>
                    Volver al inicio
                </Link>
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Iniciar sesión
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ingresa con tu usuario y contraseña asignados.
                        </p>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <Label>
                                        Correo electrónico <span className="text-error-500">*</span>{" "}
                                    </Label>
                                    <Input
                                        placeholder="Ingresa tu usuario asignado"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Contraseña <span className="text-error-500">*</span>{" "}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Ingresa tu contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        >
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox checked={isChecked} onChange={setIsChecked} />
                                        <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                                            Mantener la sesión iniciada
                                        </span>
                                    </div>
                                    <Link
                                        to="/reset-password"
                                        className="text-sm text-red-500 hover:text-red-600 dark:text-red-400"
                                    >
                                        Olvidé mi contraseña
                                    </Link>
                                </div>
                                <div>
                                    <Button className="w-full" size="sm">
                                        Ingresar
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}