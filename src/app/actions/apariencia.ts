"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLogo() {
  const config = await prisma.configuracion_Plataforma.findUnique({
    where: { id: "global" }
  });
  return config?.logoBase64 || null;
}

export async function guardarLogo(formData: FormData) {
  const logoBase64 = formData.get("logoBase64")?.toString();

  if (!logoBase64) {
    // Si no hay logo, lo borramos (dejamos null)
    await prisma.configuracion_Plataforma.upsert({
      where: { id: "global" },
      update: { logoBase64: null },
      create: { id: "global", logoBase64: null }
    });
  } else {
    await prisma.configuracion_Plataforma.upsert({
      where: { id: "global" },
      update: { logoBase64 },
      create: { id: "global", logoBase64 }
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/apariencia");
}
