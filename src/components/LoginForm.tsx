import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { useToast } from "./ui/ToastProvider";

export function LoginForm({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"form">>) {
  const { setAuthInfo } = useAuth();
  const { pushToast } = useToast();

  let navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = { username, password };

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          "Error en la solicitud. Es posible que el email o la contraseña sean incorrectos."
        );
      }

      const result = await response.json();
      setAuthInfo(result.token, result.groups[0], result.user_id, result.email);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className="flex flex-col gap-6" {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Ingresa al sistema</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Usa el usuario y contraseña asignados por el administrador
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            placeholder="miusuario123"
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <label htmlFor="password">Contraseña</label>
          </div>
          <input
            id="password"
            type="password"
            placeholder="*******"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <a
            href="#"
            className="ml-auto text-sm underline-offset-4 hover:underline text-red-600"
            onClick={(e) => {
              e.preventDefault();
              pushToast({
                title: "Restablecer contraseña (no funcional)",
                message: "Instrucciones para restablecer la contraseña enviadas a tu correo electrónico.",
                type: "info",
                duration: 5000,
              });
            }}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 py-3 flex justify-center text-white font-bold hover:bg-red-400 rounded-md"
        >
          Ingresar
        </button>
      </div>
    </form>
  );
}
