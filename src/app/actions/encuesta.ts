"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function registrarEncuesta(prevState: any, formData: FormData) {
  const mesVotado = formData.get("mes-encuesta")?.toString();
  
  if (!mesVotado) return { error: "Falla interna: Mes no definido." };

  // Validar soft-lock por seguridad doble
  if (cookies().get(`voto_${mesVotado}`)) {
    return { error: "Ya has enviado tu participación para este mes." };
  }

  // Recopilar respuestas del FormData
  // El FormData vendra con keys "pregunta_{id}" para relacionarlas
  const respuestasData: { preguntaId: string; candidatoId?: string; respuestaTexto?: string }[] = [];
  
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("pregunta_")) {
      const preguntaId = key.replace("pregunta_", "");
      const pregunta = await prisma.pregunta_Dinamica.findUnique({ where: { id: preguntaId } });
      
      if (!pregunta) continue;

      if (pregunta.tipo === "EMPLEADO") {
        respuestasData.push({ preguntaId, candidatoId: value.toString() });
      } else if (pregunta.tipo === "TEXTO") {
        respuestasData.push({ preguntaId, respuestaTexto: value.toString().trim() });
      }
    }
  }

  if (respuestasData.length === 0) {
    return { error: "Debes responder al menos a una pregunta." };
  }

  try {
    // Insertamos todas las respuestas de bloque
    const inserts = respuestasData.map(r => ({
      ...r,
      mesVotado: mesVotado
    }));

    await prisma.respuesta_Anonima.createMany({
      data: inserts
    });

  } catch (error) {
    return { error: "Error de servidor al guardar el formulario anónimo." };
  }

  // Plantamos la Cookie de Soft-Lock Anti-Trampas (Expiración: ~ 1 mes y medio para cubrir)
  cookies().set({
    name: `voto_${mesVotado}`,
    value: "registrado",
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 40, // 40 días
  });

  revalidatePath("/");
  return { success: true };
}
