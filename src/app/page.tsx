import prisma from "@/lib/prisma";
import FormularioPublico from "./FormularioPublico";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const mesActual = new Date().toISOString().slice(0, 7); // Ej: "2026-09"
  
  // 1. Verificar si el usuario ya votó este mes bloqueando por cookie
  const cookieName = `voto_${mesActual}`;
  const yaVotoThisMonth = cookies().get(cookieName)?.value === "registrado";

  // 2. Obtener data de BD para el formulario
  const preguntasActivas = await prisma.pregunta_Dinamica.findMany({
    where: { activa: true },
    orderBy: { orden: "asc" }
  });

  const candidatos = await prisma.empleado_Candidato.findMany({
    where: { activo: true },
    orderBy: { nombreCompleto: "asc" }
  });

  // 3. Obtener configuración visual de marca (Logo)
  const configuracion = await prisma.configuracion_Plataforma.findUnique({
    where: { id: "global" }
  });
  const logoUrl = configuracion?.logoBase64 || null;

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] p-6 md:p-12 font-sans flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        <div className="text-center mb-10 flex flex-col items-center">
          {logoUrl && (
            <img src={logoUrl} alt="Logo de Empresa" className="max-h-24 mb-6 object-contain" />
          )}
          <h1 className="text-4xl font-bold tracking-tight text-[var(--brand-navy)]">
            Empleado del Mes
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 max-w-lg mx-auto text-lg leading-relaxed">
            Completa esta encuesta anónima para dejar constancia de tus sugerencias o nominaciones de este mes.
          </p>
        </div>

        {yaVotoThisMonth ? (
          <div className="glass-card p-10 text-center relative overflow-hidden">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-6">
              🎉
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              ¡Gracias por tu participación!
            </h2>
            <p className="text-[var(--text-secondary)]">
              Ya hemos registrado tus respuestas de forma anónima para este mes en curso. Vuelve el mes siguiente para una nueva encuesta.
            </p>
          </div>
        ) : (
          <div className="glass-card p-6 md:p-10">
            {preguntasActivas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay encuestas activas en este momento. Vuelve más tarde.
              </div>
            ) : (
              <FormularioPublico preguntas={preguntasActivas} candidatos={candidatos} mesVotado={mesActual} />
            )}
          </div>
        )}

      </div>
    </main>
  );
}
