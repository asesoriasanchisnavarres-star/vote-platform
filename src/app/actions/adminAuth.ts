"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Definimos una contraseña maestra "fuerte" desde entorno o directamente (para la preview)
const CONTRASEÑA_MAESTRA = process.env.ADMIN_PASSWORD || "AdminSuperSeguro2026";

export async function loginAdmin(prevState: any, formData: FormData) {
  const pwd = formData.get("password")?.toString();

  if (pwd !== CONTRASEÑA_MAESTRA) {
    return { error: "Contraseña incorrecta." };
  }

  // Estableciendo sesión admin (para no hacer complejos JWTs configuramos un token rígido bastando middleware simple)
  cookies().set("admin_session", "ACCESO_AUTORIZADO_ADMIN", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas de sesión admin
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  cookies().delete("admin_session");
  redirect("/");
}
