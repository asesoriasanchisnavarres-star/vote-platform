import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { FaAward, FaRegLightbulb, FaSignOutAlt } from "react-icons/fa";

export default function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("voter_token");

  // Pequeña protección de ruta
  if (!token?.value) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 md:p-12 font-sans relative">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-16">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--brand-navy)]">Portal de Empleados</h1>
          <p className="text-[var(--text-secondary)] mt-1">Tu opinión cuenta, y es 100% anónima.</p>
        </div>
        <form action={async () => {
          "use server";
          cookies().delete("voter_token");
          redirect("/");
        }}>
          <button type="submit" className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10">
            <FaSignOutAlt /> Salir
          </button>
        </form>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Tarjeta Votación */}
        <Link href="/dashboard/votar" className="group">
          <div className="glass-card p-8 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <FaAward />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Votar Empleado del Mes</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Reconoce el esfuerzo de tus compañeros. Selecciona al candidato que crees que ha destacado este mes y cuéntanos por qué.
            </p>
          </div>
        </Link>

        {/* Tarjeta Sugerencias */}
        <Link href="/dashboard/sugerencias" className="group">
          <div className="glass-card p-8 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <FaRegLightbulb />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Buzón de Sugerencias</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              ¿Tienes una idea para mejorar la oficina o hay algún problema que reportar? Envíalo de forma totalmente anónima.
            </p>
          </div>
        </Link>

      </main>
    </div>
  );
}
