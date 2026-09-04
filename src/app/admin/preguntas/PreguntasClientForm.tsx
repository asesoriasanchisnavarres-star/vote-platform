"use client";

import { useState, useTransition, useRef } from "react";
import { agregarPregunta, alternarEstadoPregunta, eliminarPregunta, moverPregunta, editarPregunta } from "@/app/actions/preguntas";
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaUserTie, FaCommentAlt, FaArrowUp, FaArrowDown, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function PreguntasClientForm({ preguntasIniciales }: { preguntasIniciales: any[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Estados para la edición en línea
  const [editId, setEditId] = useState<string | null>(null);
  const [editTexto, setEditTexto] = useState<string>("");
  const [editTipo, setEditTipo] = useState<string>("TEXTO");

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      const res = await agregarPregunta(formData);
      if (res?.success) formRef.current?.reset();
      else if (res?.error) alert(res.error);
    });
  }

  function startEdit(p: any) {
    setEditId(p.id);
    setEditTexto(p.texto);
    setEditTipo(p.tipo);
  }

  function cancelEdit() {
    setEditId(null);
    setEditTexto("");
    setEditTipo("TEXTO");
  }

  async function handleSaveEdit(id: string) {
    startTransition(async () => {
      const res = await editarPregunta(id, editTexto, editTipo);
      if (res?.success) {
        cancelEdit();
      } else if (res?.error) {
        alert(res.error);
      }
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
          <span className="text-xs text-gray-500">Puedes editar el texto, tipo u orden de las preguntas</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Pregunta</th>
              <th className="p-4 w-48">Tipo</th>
              <th className="p-4 text-center w-24">Visible</th>
              <th className="p-4 text-center w-28">Posición</th>
              <th className="p-4 text-center w-28">Acciones</th>
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
                const isEditing = editId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 text-center font-bold text-gray-400 text-sm">
                      {index + 1}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editTexto}
                          onChange={(e) => setEditTexto(e.target.value)}
                          className="w-full bg-blue-50/50 border border-blue-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          placeholder="Texto de la pregunta"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <p className={`font-medium ${p.activa ? "text-gray-900" : "text-gray-400 line-through"}`}>
                            {p.texto}
                          </p>
                          {!p.activa && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                              Oculta para los compañeros
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <select
                          value={editTipo}
                          onChange={(e) => setEditTipo(e.target.value)}
                          className="w-full bg-blue-50/50 border border-blue-300 rounded-lg px-2 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="EMPLEADO">Compañero</option>
                          <option value="TEXTO">Texto Libre</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          p.tipo === "EMPLEADO" 
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200/50" 
                            : "bg-orange-50 text-orange-700 border border-orange-200/50"
                        }`}>
                          {p.tipo === "EMPLEADO" ? <><FaUserTie /> Compañero</> : <><FaCommentAlt /> Texto Libre</>}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => startTransition(() => alternarEstadoPregunta(p.id, p.activa))}
                        disabled={isPending || isEditing}
                        className="text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-30"
                        title={p.activa ? "Haz clic para ocultar de la portada" : "Haz clic para hacerla visible"}
                      >
                        {p.activa ? <FaToggleOn size={28} className="text-blue-600" /> : <FaToggleOff size={28} />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <button 
                          onClick={() => startTransition(() => moverPregunta(p.id, "up"))}
                          disabled={isPending || isFirst || isEditing}
                          className={`p-1.5 rounded transition ${
                            (isFirst || isEditing)
                              ? "text-gray-300 cursor-not-allowed" 
                              : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                          }`}
                          title={isFirst ? "Ya está en la primera posición" : "Subir posición"}
                        >
                          <FaArrowUp size={12} />
                        </button>
                        <button 
                          onClick={() => startTransition(() => moverPregunta(p.id, "down"))}
                          disabled={isPending || isLast || isEditing}
                          className={`p-1.5 rounded transition ${
                            (isLast || isEditing)
                              ? "text-gray-300 cursor-not-allowed" 
                              : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                          }`}
                          title={isLast ? "Ya está en la última posición" : "Bajar posición"}
                        >
                          <FaArrowDown size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleSaveEdit(p.id)}
                            disabled={isPending}
                            className="text-green-600 hover:text-green-700 bg-green-50 p-2 rounded-lg transition"
                            title="Guardar cambios"
                          >
                            <FaSave size={15} />
                          </button>
                          <button 
                            onClick={cancelEdit}
                            disabled={isPending}
                            className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-lg transition"
                            title="Cancelar"
                          >
                            <FaTimes size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => startEdit(p)}
                            disabled={isPending}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                            title="Editar pregunta"
                          >
                            <FaEdit size={15} />
                          </button>
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
                        </div>
                      )}
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
