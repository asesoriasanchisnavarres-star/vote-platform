"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function agregarPregunta(formData: FormData) {
  const texto = formData.get("texto")?.toString();
  const tipo = formData.get("tipo")?.toString() || "TEXTO"; // EMPLEADO o TEXTO

  if (!texto || texto.trim().length < 3) {
    return { error: "La pregunta debe tener al menos 3 caracteres." };
  }

  try {
    const total = await prisma.pregunta_Dinamica.count();
    
    await prisma.pregunta_Dinamica.create({
      data: {
        texto: texto.trim(),
        tipo: tipo,
        orden: total,
        activa: true
      },
    });
    
    revalidatePath("/admin/preguntas");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Error al añadir la pregunta." };
  }
}

export async function editarPregunta(id: string, texto: string, tipo: string) {
  try {
    if (!texto || texto.trim().length < 3) {
      return { error: "El texto de la pregunta debe tener al menos 3 caracteres." };
    }

    await prisma.pregunta_Dinamica.update({
      where: { id },
      data: {
        texto: texto.trim(),
        tipo: tipo,
      },
    });

    revalidatePath("/admin/preguntas");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al actualizar la pregunta." };
  }
}

export async function alternarEstadoPregunta(id: string, estadoActual: boolean) {
  try {
    await prisma.pregunta_Dinamica.update({
      where: { id },
      data: { activa: !estadoActual },
    });
    revalidatePath("/admin/preguntas");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "No se pudo cambiar el estado." };
  }
}

export async function eliminarPregunta(id: string) {
  try {
    await prisma.pregunta_Dinamica.delete({
      where: { id },
    });
    
    // Renumerar orden restante
    const restantes = await prisma.pregunta_Dinamica.findMany({
      orderBy: { orden: "asc" }
    });
    for (let i = 0; i < restantes.length; i++) {
      await prisma.pregunta_Dinamica.update({
        where: { id: restantes[i].id },
        data: { orden: i }
      });
    }

    revalidatePath("/admin/preguntas");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al eliminar la pregunta." };
  }
}

export async function moverPregunta(id: string, direccion: "up" | "down") {
  try {
    const all = await prisma.pregunta_Dinamica.findMany({
      orderBy: { orden: "asc" }
    });
    
    const currentIndex = all.findIndex((p) => p.id === id);
    if (currentIndex === -1) return { error: "Pregunta no encontrada." };

    let targetIndex = currentIndex;
    if (direccion === "up" && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direccion === "down" && currentIndex < all.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      return { success: true }; // Ya está en el límite
    }

    // Reordenar array
    const item = all.splice(currentIndex, 1)[0];
    all.splice(targetIndex, 0, item);

    // Guardar los nuevos órdenes normalizados
    for (let i = 0; i < all.length; i++) {
      await prisma.pregunta_Dinamica.update({
        where: { id: all[i].id },
        data: { orden: i }
      });
    }

    revalidatePath("/admin/preguntas");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al mover la posición de la pregunta." };
  }
}
