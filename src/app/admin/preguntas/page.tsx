import prisma from "@/lib/prisma";
import PreguntasClientForm from "./PreguntasClientForm";

export const dynamic = "force-dynamic";

export default async function PreguntasAdminPage() {
  const preguntas = await prisma.pregunta_Dinamica.findMany({
    orderBy: { orden: "asc" }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Editor de Encuestas</h1>
      <p className="text-gray-600 mb-8">
        Añade las preguntas que quieres que los empleados respondan. Puedes pedirles que seleccionen a un <b>compañero</b> (para el empleado del mes) o que dejen <b>texto libre</b> (ej. para sugerencias). Solo las marcadas como "Activas" serán visibles.
      </p>

      <PreguntasClientForm preguntasIniciales={preguntas} />
    </div>
  );
}
