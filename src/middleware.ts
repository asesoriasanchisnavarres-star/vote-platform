import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Evitar accesos a rutas admin sin la cookie de la "contraseña maestra"
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    const adminToken = request.cookies.get("admin_session")?.value;
    
    // Si no tiene la sesión activa, rebotar al login de administrador
    if (!adminToken || adminToken !== "ACCESO_AUTORIZADO_ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
