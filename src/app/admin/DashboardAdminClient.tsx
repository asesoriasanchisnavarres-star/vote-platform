"use client";

import { useState, useEffect, useTransition } from "react";
import { obtenerResumenDashboard, exportarDatosCSV, exportarDatosCSVIndividual, purgarResultadosPrueba } from "@/app/actions/dashboardData";
import { FaFileCsv, FaSync, FaTrophy, FaLightbulb, FaTrash, FaExclamationTriangle } from "react-icons/fa";

export default function DashboardAdminClient() {
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const [datos, setDatos] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const cargarDatos = () => {
    startTransition(async () => {
      const res = await obtenerResumenDashboard(mes);
      if (res.success) setDatos(res.resumen);
    });
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes]);

  const descargarCSV = async () => {
    const res = await exportarDatosCSV(mes);
    if (res.error) return alert(res.error);
    
    if (res.descarga) {
      const blob = new Blob(["\uFEFF" + res.descarga.consolidado], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Resultados_Encuestas_${mes}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const descargarCSVIndividual = async (preguntaId: string, textoPregunta: string) => {
    const res = await exportarDatosCSVIndividual(mes, preguntaId);
    if (res.error) return alert(res.error);
    
    if (res.csvData) {
      const blob = new Blob(["\uFEFF" + res.csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Resultados_${textoPregunta.substring(0,20).replace(/[^a-z0-9]/gi, '_')}_${mes}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      document.body.removeChild(link);
    }
  };

  const handlePurgarResultados = () => {
    if (confirm("⚠️ ADVERTENCIA CRÍTICA ⚠️\n\n¿Estás absolutamente seguro de querer vaciar TODAS las respuestas de todas las encuestas y meses?\n\nEsta acción dejará la tabla en blanco y no se puede deshacer. Tus preguntas y empleados activos permanecerán intactos.")) {
      startTransition(async () => {
        const res = await purgarResultadosPrueba();
        if (res.error) {
          alert(res.error);
        } else {
          alert('✅ ' + res.mensaje);
          cargarDatos(); // Refrescar vista
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Barra de Filtro y Acción */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-2">Resultados del Mes:</label>
          <input 
            type="month" 
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={cargarDatos}
            disabled={isPending}
            className="flex-1 md:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FaSync className={isPending ? "animate-spin" : ""} /> {isPending ? "Actualizando" : "Actualizar"}
          </button>
          
          <button 
            onClick={descargarCSV}
            className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-sm shadow-green-600/20 flex items-center justify-center gap-2"
          >
            <FaFileCsv size={20} /> Exportar Reporte CSV
          </button>
          
          <button 
            onClick={handlePurgarResultados}
            disabled={isPending}
            className="flex-1 md:flex-none bg-red-100 hover:bg-red-200 text-red-700 font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            title="Borrar todas las respuestas de prueba"
          >
            <FaExclamationTriangle size={16} /> Reinicio
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Cargando resultados de encuestas...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {datos?.length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center p-10 bg-white rounded-2xl border border-gray-100 text-gray-500">
              No hay encuestas ni resultados para mostrar este mes.
            </div>
          )}

          {datos?.map((encuesta: any) => (
            <div key={encuesta.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
              <div className={`px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3 ${encuesta.tipo === 'EMPLEADO' ? 'bg-blue-50/50' : 'bg-orange-50/50'}`}>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">{encuesta.texto}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {encuesta.tipo === 'EMPLEADO' ? <FaTrophy className="text-blue-500 text-sm" /> : <FaLightbulb className="text-orange-500 text-sm" />}
                    <span className="text-xs text-gray-500 uppercase font-semibold">{encuesta.tipo === 'EMPLEADO' ? 'Elegir Compañero' : 'Sugerencia'}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => descargarCSVIndividual(encuesta.id, encuesta.texto)}
                  className="flex-shrink-0 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 p-2 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                  title="Descargar solo esta encuesta"
                >
                  <FaFileCsv size={18} className="text-gray-500" />
                </button>
              </div>
              
              <div className={`p-0 overflow-y-auto flex-1 ${encuesta.tipo === 'TEXTO' ? 'p-6 bg-gray-50 space-y-4' : ''}`}>
                
                {encuesta.data.length === 0 ? (
                  <div className="text-center p-12 text-gray-400">Nadie ha respondido esta encuesta aún.</div>
                ) : (
                  encuesta.tipo === "EMPLEADO" ? (
                    // RENDER RANKING
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
                          <th className="px-6 py-3">Nominado</th>
                          <th className="px-6 py-3 text-right">Votos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {encuesta.data.map((r: any, i: number) => (
                          <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-900 flex items-center gap-2">
                                {i === 0 && <span className="text-yellow-500"><FaTrophy size={14} /></span>}
                                {r.empleado}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{r.departamento}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                {r.votos}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    // RENDER BUZON DE TEXTO
                    encuesta.data.map((r: any, i: number) => (
                      <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400 font-mono">
                            {new Date(r.fecha).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                          "{r.texto}"
                        </p>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
