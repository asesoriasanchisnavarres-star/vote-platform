import DashboardAdminClient from "./DashboardAdminClient";

export default function AdminIndexPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Resultados</h1>
        <p className="text-gray-600">
          Vista general en tiempo real de las votaciones para "Empleado del Mes" y el buzón anónimo de tu oficina.
        </p>
      </div>

      <DashboardAdminClient />
    </div>
  );
}
