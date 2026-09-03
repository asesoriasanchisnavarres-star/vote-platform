"use client";

import { useState, useTransition, useRef } from "react";
import { agregarEmpleado, alternarEstadoEmpleado, eliminarEmpleado, editarEmpleado } from "@/app/actions/censo";
import { FaUserPlus, FaTrash, FaToggleOn, FaToggleOff, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function CensoClientForm({ empleadosIniciales }: { empleadosIniciales: any[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState<string>("");
  const [editDept, setEditDept] = useState<string>("");

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      const res = await agregarEmpleado(formData);
      if (res?.success) {
        formRef.current?.reset();
      } else if (res?.error) {
        alert(res.error);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Formulario de Adición Rápida */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Añadir Nuevo Compañero</h2>
        <form ref={formRef} action={handleAdd} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            name="nombre" 
            placeholder="Nombre Completo" 
            required 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            type="text" 
            name="departamento" 
            placeholder="Departamento (Opcional)" 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaUserPlus /> Añadir
          </button>
        </form>
      </div>

      {/* Lista / Tabla de Empleados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm uppercase text-gray-500 font-semibold tracking-wider">
              <th className="p-4">Nombre Completo</th>
              <th className="p-4">Departamento</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {empleadosIniciales.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No hay compañeros registrados en el censo.
                </td>
              </tr>
            ) : (
              empleadosIniciales.map((e) => {
                const isEditing = editId === e.id;

                return (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editNombre} 
                          onChange={(ev) => setEditNombre(ev.target.value)}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1"
                        />
                      ) : e.nombreCompleto}
                    </td>
                    <td className="p-4 text-gray-600">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editDept} 
                          onChange={(ev) => setEditDept(ev.target.value)}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (e.departamento || "-")}
                    </td>
                    <td className="p-4">
                      {!isEditing && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${e.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {e.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-center gap-3">
                      {isEditing ? (
                        <>
                          <button 
                            onClick={() => startTransition(async () => {
                              await editarEmpleado(e.id, editNombre, editDept);
                              setEditId(null);
                            })}
                            className="text-green-600 hover:text-green-700 transition" title="Guardar"
                          ><FaSave size={18} /></button>
                          <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600 transition" title="Cancelar"><FaTimes size={18} /></button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => startTransition(() => alternarEstadoEmpleado(e.id, e.activo))}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            title={e.activo ? "Desactivar" : "Activar"}
                          >
                            {e.activo ? <FaToggleOn size={22} className="text-blue-600" /> : <FaToggleOff size={22} />}
                          </button>
                          
                          <button 
                            onClick={() => {
                              setEditNombre(e.nombreCompleto);
                              setEditDept(e.departamento || "");
                              setEditId(e.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors" title="Editar"
                          ><FaEdit size={18} /></button>

                          <button 
                            onClick={async () => {
                              if (confirm(`¿Eliminar definitivamente a ${e.nombreCompleto}?`)) {
                                startTransition(async () => {
                                  const res = await eliminarEmpleado(e.id);
                                  if (res?.warning) alert(res.warning);
                                });
                              }
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </>
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
