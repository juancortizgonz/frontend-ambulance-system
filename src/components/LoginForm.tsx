import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router";

export function LoginForm({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"form">>) {

  const { setAuthInfo } = useAuth();

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
        throw new Error("Error en la solicitud. Es posible que el email o la contraseña sean incorrectos.");
      }

      const result = await response.json();
      setAuthInfo(result.token, result.groups[0], result.user_id, result.email)
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }

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
          <input id="username" type="text" placeholder="miusuario123" onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <label htmlFor="password">Contraseña</label>
            <button
              type="button"
              className="ml-auto text-sm underline-offset-4 hover:underline text-blue-600"
              onClick={() => alert('Password reset functionality not implemented yet')}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <input id="password" type="password" onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-blue-400 py-3 flex justify-center text-white font-bold rounded-md">
          Ingresar
        </button>
      </div>
    </form>
  )
}
