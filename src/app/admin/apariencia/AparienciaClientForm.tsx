"use client";

import { useState } from "react";
import { guardarLogo } from "@/app/actions/apariencia";
import { FiUpload, FiTrash2 } from "react-icons/fi";

export default function AparienciaClientForm({ logoActual }: { logoActual: string | null }) {
  const [preview, setPreview] = useState<string | null>(logoActual);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const formData = new FormData();
    if (preview) {
      formData.append("logoBase64", preview);
    }
    await guardarLogo(formData);
    setLoading(false);
    alert("Apariencia guardada correctamente");
  };

  const handleDelete = () => {
    setPreview(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-2xl">
      <h2 className="text-xl font-semibold text-[#202e56] mb-6">Logotipo de la Empresa</h2>
      
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 mb-6">
        {preview ? (
          <div className="relative group">
            <img src={preview} alt="Logo preview" className="max-h-32 object-contain" />
            <button 
              onClick={handleDelete}
              className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Eliminar logo"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Sin logotipo configurado</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
          <FiUpload />
          Subir Imagen
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/svg+xml, image/webp" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </label>
        
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 bg-[#202e56] hover:bg-[#1a2546] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">Recomendado: Formato PNG transparente, SVG o JPG. Máximo 2MB.</p>
    </div>
  );
}
