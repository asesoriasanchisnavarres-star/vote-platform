"use client";

import { useTransition, useRef } from "react";
import { agregarPregunta, alternarEstadoPregunta, eliminarPregunta, moverPregunta } from "@/app/actions/preguntas";
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaUserTie, FaCommentAlt, FaArrowUp, FaArrowDown, FaGripVertical } from "react-icons/fa";

export default function PreguntasClientForm({ preguntasIniciales }: { preguntasIniciales: any[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      const res = await agregarPregunta(formData);
      if (res?.success) formRef.current?.reset();
      else if (res?.error) alert(res.error);
    });
  }

  return (
    <div className="space-y-8">
      {/* Formulario de Adición Rápida */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Añadir Nueva Pregunta</h2>
        <form ref={formRef} action={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Título / Enunciado de la Pregunta</label>
            <input 
              type="text" 
              name="texto" 
              placeholder="Ej: ¿Quién es el compañero del mes?" 
              required 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Respuesta</label>
            <select 
              name="tipo" 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition font-medium"
            >
              <option value="EMPLEADO">Elegir a un Compañero</option>
              <option value="TEXTO">Campo de Texto Libre</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-8 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 h-[44px]"
          >
            <FaPlus /> {isPending ? "Añadiendo..." : "Crear Pregunta"}
          </button>
        </form>
      </div>

      {/* Lista de Preguntas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">Preguntas de la Encuesta ({preguntasIniciales.length})</h3>
          <span className="text-xs text-gray-500">Usa las flechas para ordenar cómo aparecerán en la portada</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Pregunta</th>
              <th className="p-4 w-44">Tipo</th>
              <th className="p-4 text-center w-28">Visible</th>
              <th className="p-4 text-center w-36">Posición</th>
              <th className="p-4 text-center w-20">Eliminar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {preguntasIniciales.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500">
                  No has creado ninguna pregunta aún. Usa el formulario superior para añadir la primera.
                </td>
              </tr>
            ) : (
              preguntasIniciales.map((p, index) => {
                const isFirst = index === 0;
                const isLast = index === preguntasIniciales.length - 1;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 text-center font-bold text-gray-400 text-sm">
                      {index + 1}
                    </td>
                    <td className="p-4">
                      <p className={`font-medium ${p.activa ? "text-gray-900" : "text-gray-400 line-through"}`}>
                        {p.texto}
                      </p>
                      {!p.activa && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                          Oculta para los compañeros
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        p.tipo === "EMPLEADO" 
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200/50" 
                          : "bg-orange-50 text-orange-700 border border-orange-200/50"
                      }`}>
                        {p.tipo === "EMPLEADO" ? <><FaUserTie /> Compañero</> : <><FaCommentAlt /> Texto Libre</>}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => startTransition(() => alternarEstadoPregunta(p.id, p.activa))}
                        disabled={isPending}
                        className="text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                        title={p.activa ? "Haz clic para ocultar de la portada" : "Haz clic para hacerla visible"}
                      >
                        {p.activa ? <FaToggleOn size={28} className="text-blue-600" /> : <FaToggleOff size={28} />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <button 
                          onClick={() => startTransition(() => moverPregunta(p.id, "up"))}
                          disabled={isPending || isFirst}
                          className={`p-1.5 rounded transition ${
                            isFirst 
                              ? "text-gray-300 cursor-not-allowed" 
                              : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                          }`}
                          title={isFirst ? "Ya está en la primera posición" : "Subir posición"}
                        >
                          <FaArrowUp size={13} />
                        </button>
                        <button 
                          onClick={() => startTransition(() => moverPregunta(p.id, "down"))}
                          disabled={isPending || isLast}
                          className={`p-1.5 rounded transition ${
                            isLast 
                              ? "text-gray-300 cursor-not-allowed" 
                              : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                          }`}
                          title={isLast ? "Ya está en la última posición" : "Bajar posición"}
                        >
                          <FaArrowDown size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => {
                          if (confirm(`¿Eliminar definitivamente la pregunta "${p.texto}"?`)) {
                            startTransition(() => eliminarPregunta(p.id));
                          }
                        }}
                        disabled={isPending}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar permanentemente"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
