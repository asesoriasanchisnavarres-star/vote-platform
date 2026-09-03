import { getLogo } from "@/app/actions/apariencia";
import AparienciaClientForm from "./AparienciaClientForm";
import { FiLayout } from "react-icons/fi";

export default async function AparienciaAdminPage() {
  const logoActual = await getLogo();

  return (
    <div>
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-semibold text-[#202e56] flex items-center gap-3">
          <FiLayout className="text-[#202e56]" />
          Apariencia
        </h1>
        <p className="text-gray-500 mt-2 text-sm">Organiza los colores y el logotipo visible para los empleados.</p>
      </div>

      <AparienciaClientForm logoActual={logoActual} />
    </div>
  );
}
