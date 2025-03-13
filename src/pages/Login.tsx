import { LoginForm } from "@/components/LoginForm";
import Footer from "@/components/Footer";

const Login = () => {
  const handleBackClick = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="grid flex-grow lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBackClick}
              className="self-start mb-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition"
            >
              ← Regresar
            </button>
            <span className="font-medium">
              Sistema inteligente de gestión de ambulancias
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <img
            src="src/assets/login-bg.jpg"
            alt="Background of login page"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
