"use client";

import { useState, useEffect, useTransition } from "react";
import { obtenerResumenDashboard, exportarDatosCSV, exportarDatosCSVIndividual, purgarResultadosPrueba } from "@/app/actions/dashboardData";
import { FaFileCsv, FaSync, FaTrophy, FaLightbulb, FaTrash, FaExclamationTriangle, FaUsers, FaComments, FaChartPie, FaMedal, FaCopy, FaCheck } from "react-icons/fa";

export default function DashboardAdminClient() {
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const [datos, setDatos] = useState<any[] | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const cargarDatos = () => {
    startTransition(async () => {
      const res = await obtenerResumenDashboard(mes);
      if (res.success) {
        setDatos(res.resumen);
        setStats(res.estadisticas);
      }
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
      const blob = new Blob(["\uFEFF" + res.descarga.consolidado], { type: "text/csv;charset=utf-8;" });
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
      const blob = new Blob(["\uFEFF" + res.csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Resultados_${textoPregunta.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}_${mes}.csv`);
      document.body.appendChild(link);
      link.click();
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
          alert("✅ " + res.mensaje);
          cargarDatos();
        }
      });
    }
  };

  // Obtener el podio de nominados a través de preguntas de tipo EMPLEADO
  const preguntasEmpleado = datos?.filter((d) => d.tipo === "EMPLEADO") || [];
  const primerLider = preguntasEmpleado.length > 0 && preguntasEmpleado[0].data.length > 0 ? preguntasEmpleado[0].data[0] : null;
  const topTres = preguntasEmpleado.length > 0 ? preguntasEmpleado[0].data.slice(0, 3) : [];
  const totalVotosLider = preguntasEmpleado.length > 0 
    ? preguntasEmpleado[0].data.reduce((acc: number, curr: any) => acc + curr.votos, 0)
    : 0;

  const copiarResumenEjecutivo = () => {
    if (!stats) return;
    const mesFormateado = new Date(mes + "-01").toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    
    let texto = `📊 RESUMEN EJECUTIVO DE VOTACIONES - SANCHIS ASESORES\n`;
    texto += `📅 Periodo: ${mesFormateado.toUpperCase()}\n`;
    texto += `👥 Participación estimada: ${stats.participacionesEstimadas} de ${stats.totalEmpleadosCenso} empleados (${stats.porcentajeParticipacion}%)\n`;
    texto += `💬 Comentarios y propuestas recibidas: ${stats.totalComentariosTexto}\n\n`;

    if (topTres.length > 0) {
      texto += `🏆 RANKING "EMPLEADO DEL MES":\n`;
      topTres.forEach((c: any, i: number) => {
        const medalla = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
        texto += `${medalla} ${i + 1}º: ${c.empleado} (${c.departamento || "Oficina"}) - ${c.votos} votos\n`;
      });
    }

    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-10">
      
      {/* Barra de Filtro y Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-full md:w-72">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Mes de Votación:</label>
          <input 
            type="month" 
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={cargarDatos}
            disabled={isPending}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FaSync className={isPending ? "animate-spin" : ""} /> {isPending ? "Actualizando..." : "Actualizar"}
          </button>
          
          <button 
            onClick={descargarCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm shadow-green-600/20 flex items-center justify-center gap-2"
          >
            <FaFileCsv size={18} /> Exportar CSV Completo
          </button>
          
          <button 
            onClick={handlePurgarResultados}
            disabled={isPending}
            className="bg-red-50 hover:bg-red-100 text-red-700 font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-200/50"
            title="Borrar todas las respuestas de prueba"
          >
            <FaTrash size={14} /> Purgar Datos
          </button>
        </div>
      </div>

      {/* Resultados Detallados de Cada Pregunta */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>Respuestas Detalladas de la Encuesta</span>
        </h2>

        {datos === null ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Cargando resultados de la base de datos...</p>
          </div>
        ) : datos.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500">
            No hay preguntas activas ni respuestas registradas para este periodo.
          </div>
        ) : (
          datos.map((item, index) => (
            <div key={item.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{item.texto}</h3>
                    <span className="text-xs text-gray-400 font-medium">
                      {item.tipo === "EMPLEADO" ? "Votación de Compañero" : "Aportaciones de Texto"} • {item.totalRespuestas} respuestas
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => descargarCSVIndividual(item.id, item.texto)}
                  className="self-start md:self-auto text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 transition flex items-center gap-1.5 font-medium"
                >
                  <FaFileCsv /> Descargar esta pregunta
                </button>
              </div>

              {item.tipo === "EMPLEADO" ? (
                item.data.length === 0 ? (
                  <p className="text-gray-400 text-sm italic py-4">Aún no se han recibido votos en esta pregunta.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.data.map((c: any, i: number) => {
                      const totalPregunta = item.data.reduce((acc: number, curr: any) => acc + curr.votos, 0);
                      const porcentaje = totalPregunta > 0 ? Math.round((c.votos / totalPregunta) * 100) : 0;

                      return (
                        <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-bold text-gray-900">{c.empleado}</span>
                              {c.departamento && (
                                <span className="text-xs text-gray-500 ml-2">({c.departamento})</span>
                              )}
                            </div>
                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                              {c.votos} {c.votos === 1 ? "voto" : "votos"} ({porcentaje}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                item.data.length === 0 ? (
                  <p className="text-gray-400 text-sm italic py-4">No se han registrado sugerencias ni comentarios en este apartado.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {item.data.map((t: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/70">
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{t.texto}</p>
                        <span className="text-xs text-gray-400 mt-2 block font-medium">
                          Registrado el {new Date(t.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          ))
        )}
      </div>

      {/* ======================================================== */}
      {/* RESUMEN EJECUTIVO GLOBAL AL FINAL DEL DASHBOARD */}
      {/* ======================================================== */}
      {stats && (
        <div className="bg-gradient-to-br from-slate-900 via-[#1a2544] to-[#202e56] text-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-700/50 space-y-8 mt-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
                <FaChartPie /> Informe General
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Resumen Ejecutivo de Votaciones
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                Estado consolidado de la participación y nominaciones hasta la fecha para este periodo.
              </p>
            </div>

            <button
              onClick={copiarResumenEjecutivo}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition border border-white/15 flex items-center gap-2"
            >
              {copied ? <><FaCheck className="text-green-400" /> Copiado al portapapeles</> : <><FaCopy /> Copiar Resumen</>}
            </button>
          </div>

          {/* Tarjetas de Métricas Clave (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Participación</span>
                <FaUsers className="text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats.participacionesEstimadas}</p>
              <p className="text-xs text-slate-400 mt-1">de {stats.totalEmpleadosCenso} empleados en censo</p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-3 overflow-hidden">
                <div 
                  className="bg-blue-400 h-1.5 rounded-full" 
                  style={{ width: `${stats.porcentajeParticipacion}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Tasa de Voto</span>
                <FaChartPie className="text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-400">{stats.porcentajeParticipacion}%</p>
              <p className="text-xs text-slate-400 mt-1">del equipo de la oficina</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Líder Nominado</span>
                <FaTrophy className="text-amber-400" />
              </div>
              <p className="text-xl font-bold text-white truncate">
                {primerLider ? primerLider.empleado : "Sin votos aún"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {primerLider ? `${primerLider.votos} votos (${primerLider.departamento || "Oficina"})` : "Pendiente de inicio"}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Propuestas / Texto</span>
                <FaComments className="text-purple-400" />
              </div>
              <p className="text-3xl font-extrabold text-purple-300">{stats.totalComentariosTexto}</p>
              <p className="text-xs text-slate-400 mt-1">aportaciones registradas</p>
            </div>

          </div>

          {/* Podio Destacado del Empleado del Mes */}
          {topTres.length > 0 && (
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FaMedal className="text-amber-400" /> Podio de Nominaciones del Mes
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topTres.map((c: any, index: number) => {
                  const esPrimero = index === 0;
                  const medallaColor = index === 0 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : index === 1 ? "bg-slate-300/20 text-slate-200 border-slate-400/30" : "bg-amber-700/20 text-amber-400 border-amber-700/30";
                  const icono = index === 0 ? "🥇 1º Lugar" : index === 1 ? "🥈 2º Lugar" : "🥉 3º Lugar";
                  const pct = totalVotosLider > 0 ? Math.round((c.votos / totalVotosLider) * 100) : 0;

                  return (
                    <div 
                      key={index} 
                      className={`p-5 rounded-2xl border transition ${esPrimero ? "bg-white/10 border-amber-400/40 shadow-lg shadow-amber-500/10" : "bg-white/5 border-white/10"}`}
                    >
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mb-3 ${medallaColor}`}>
                        {icono}
                      </span>
                      <h4 className="text-lg font-bold text-white">{c.empleado}</h4>
                      <p className="text-xs text-slate-400">{c.departamento || "Departamento General"}</p>
                      
                      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-sm">
                        <span className="text-slate-300 font-medium">{c.votos} {c.votos === 1 ? "voto" : "votos"}</span>
                        <span className="font-bold text-blue-300">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
