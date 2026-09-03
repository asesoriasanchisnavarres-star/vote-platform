/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Omite los errores de ESLint durante la compilación de Vercel/Producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Omite los errores de TypeScript durante el build
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
