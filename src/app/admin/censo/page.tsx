import prisma from "@/lib/prisma";
import CensoClientForm from "./CensoClientForm";

export default async function CensoAdminPage() {
  const empleados = await prisma.empleado_Candidato.findMany({
    orderBy: { nombreCompleto: "asc" }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestor de Compañeros (Censo)</h1>
      <p className="text-gray-600 mb-8">
        Añade o inactiva a los empleados. Solo los compañeros marcados como "Activos" aparecerán como opción en el formulario de votación.
      </p>

      {/* Componente de Cliente Interactivo con Optimistic UI */}
      <CensoClientForm empleadosIniciales={empleados} />
    </div>
  );
}
