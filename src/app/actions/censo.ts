"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function agregarEmpleado(formData: FormData) {
  const nombreCompleto = formData.get("nombre")?.toString();
  const departamento = formData.get("departamento")?.toString() || "";

  if (!nombreCompleto || nombreCompleto.trim().length < 3) {
    return { error: "El nombre debe tener al menos 3 caracteres." };
  }

  try {
    await prisma.empleado_Candidato.create({
      data: {
        nombreCompleto: nombreCompleto.trim(),
        departamento: departamento.trim(),
      },
    });
    
    revalidatePath("/admin/censo");
    revalidatePath("/dashboard/votar");
    return { success: true };
  } catch (error) {
    return { error: "Error al añadir al compañero." };
  }
}

export async function alternarEstadoEmpleado(id: string, estadoActual: boolean) {
  try {
    await prisma.empleado_Candidato.update({
      where: { id },
      data: { activo: !estadoActual },
    });
    revalidatePath("/admin/censo");
    revalidatePath("/dashboard/votar");
  } catch (error) {
    console.error(error);
  }
}

export async function eliminarEmpleado(id: string) {
  try {
    // Solo elimina si no tiene respuestas (por integridad referencial)
    const empleado = await prisma.empleado_Candidato.findUnique({
      where: { id },
      include: { _count: { select: { respuestasRecibidas: true } } }
    });

    if (empleado?._count.respuestasRecibidas! > 0) {
      // Inactivar en vez de borrar duro si tiene historico
      await prisma.empleado_Candidato.update({
        where: { id },
        data: { activo: false },
      });
      return { warning: "El usuario tiene respuestas históricas, ha sido inactivado." };
    } else {
      await prisma.empleado_Candidato.delete({
        where: { id },
      });
      return { success: true };
    }
  } catch (error) {
    console.error(error);
  } finally {
    revalidatePath("/admin/censo");
    revalidatePath("/");
  }
}

export async function editarEmpleado(id: string, nombreCompleto: string, departamento: string) {
  try {
    if (!nombreCompleto || nombreCompleto.trim().length < 3) return { error: "Nombre muy corto." };
    await prisma.empleado_Candidato.update({
      where: { id },
      data: {
        nombreCompleto: nombreCompleto.trim(),
        departamento: departamento.trim(),
      }
    });
    revalidatePath("/admin/censo");
    revalidatePath("/");
    return { success: true };
  } catch(error) {
    return { error: "Error de edición" };
  }
}
