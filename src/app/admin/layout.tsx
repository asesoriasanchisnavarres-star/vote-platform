import Link from "next/link";
import { logoutAdmin } from "@/app/actions/adminAuth";
import { FaSignOutAlt, FaChartBar, FaUsers, FaCommentDots, FaPaintBrush } from "react-icons/fa";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar de Navegación */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col md:min-h-screen">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold tracking-tight text-[var(--brand-navy)] dark:text-gray-100">Panel Control</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Modo Administrador</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-700/50 transition-colors font-medium">
            <FaChartBar className="text-lg" /> Resumen y Datos
          </Link>
          <Link href="/admin/censo" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-700/50 transition-colors font-medium">
            <FaUsers className="text-lg" /> Censo Compañeros
          </Link>
          <Link href="/admin/preguntas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-700/50 transition-colors font-medium">
            <FaCommentDots className="text-lg" /> Editor Encuestas
          </Link>
          <Link href="/admin/apariencia" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-700/50 transition-colors font-medium">
            <FaPaintBrush className="text-lg" /> Apariencia y Marca
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form action={logoutAdmin}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
              <FaSignOutAlt /> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        {children}
      </main>

    </div>
  );
}
