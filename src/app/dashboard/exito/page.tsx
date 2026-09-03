import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

export default function ExitoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div className="glass-card max-w-lg w-full p-10 text-center relative overflow-hidden">
        
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl shadow-green-500/10 animate-bounce">
          <FaCheckCircle />
        </div>

        <h1 className="text-3xl font-semibold mb-4 text-[var(--brand-navy)]">¡Registro Completado!</h1>
        <p className="text-[var(--text-secondary)] mb-8 text-lg leading-relaxed">
          Tu participación ha sido registrada con éxito en nuestros servidores de forma anónima. <br/> Tus datos están protegidos.
        </p>

        <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
          El código que usaste para acceder ha sido inhabilitado para futuras participaciones y tu sesión ha sido cerrada automáticamente por seguridad.
        </p>

        <Link 
          href="/" 
          className="inline-block w-full py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-colors"
        >
          Volver a la Portada
        </Link>
      </div>
    </main>
  );
}
