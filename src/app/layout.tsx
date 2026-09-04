import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const workSans = Work_Sans({ 
  subsets: ["latin"],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "Plataforma Interna | Encuestas y Votaciones",
  description: "Buzón y Sistema de Votación para el equipo de Sanchis Asesores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${workSans.variable} font-sans min-h-screen flex flex-col`}>
        <div className="flex-1 w-full relative">
          {children}
        </div>
        
        {/* Footer simple global */}
        <footer className="py-6 text-center text-sm text-[var(--text-secondary)]">
          <p>Plataforma interna del equipo de Sanchis Asesores.</p>
          <p className="mt-1">
            <Link href="/admin/login" className="cursor-default select-none group" title="Acceso Exclusivo">
              <span className="group-hover:text-[var(--brand-accent)] transition-colors">©</span>
            </Link> {new Date().getFullYear()} Todos los derechos reservados.
          </p>
        </footer>
      </body>
    </html>
  );
}
