"use server";

import prisma from "@/lib/prisma";

export async function obtenerResumenDashboard(mesFiltro: string) {
  try {
    const preguntas = await prisma.pregunta_Dinamica.findMany({
      orderBy: { orden: 'asc' },
      include: {
        respuestas: {
          where: { mesVotado: mesFiltro },
          include: { candidato: true }
        }
      }
    });

    const resumen = preguntas.map(pregunta => {
      if (pregunta.tipo === "EMPLEADO") {
        // Agrupar votos
        const conteo = pregunta.respuestas.reduce((acc: any, r) => {
          if (!r.candidato) return acc;
          const key = r.candidato.nombreCompleto;
          if (!acc[key]) acc[key] = { votos: 0, departamento: r.candidato.departamento };
          acc[key].votos += 1;
          return acc;
        }, {});

        // Convertir a array ordenado
        const ranking = Object.keys(conteo).map(k => ({
          empleado: k,
          votos: conteo[k].votos,
          departamento: conteo[k].departamento
        })).sort((a, b) => b.votos - a.votos);

        return { id: pregunta.id, texto: pregunta.texto, tipo: pregunta.tipo, data: ranking };
      } 
      else {
        // Respuestas de texto bruto
        const textos = pregunta.respuestas
          .filter(r => r.respuestaTexto)
          .sort((a, b) => b.fechaRegistro.getTime() - a.fechaRegistro.getTime())
          .map(r => ({
            fecha: r.fechaRegistro.toISOString(),
            texto: r.respuestaTexto
          }));
        
        return { id: pregunta.id, texto: pregunta.texto, tipo: pregunta.tipo, data: textos };
      }
    });

    return { success: true, resumen };
  } catch (error) {
    return { error: "Error al cargar los resultados del servidor." };
  }
}

export async function exportarDatosCSV(mesFiltro: string) {
  try {
    const preguntas = await prisma.pregunta_Dinamica.findMany({
      include: {
        respuestas: {
          where: { mesVotado: mesFiltro },
          include: { candidato: true }
        }
      }
    });

    // Formatear todo en un solo CSV consolidado
    let csvData = "Fecha,Pregunta Tipo,Pregunta Texto,Respuesta (Candidato / Texto)\n";

    preguntas.forEach(p => {
      p.respuestas.forEach(r => {
        const fecha = r.fechaRegistro.toISOString().split("T")[0];
        const tipo = p.tipo;
        const textoPregunta = `"${p.texto.replace(/"/g, '""')}"`;
        
        let respuestaStr = "";
        if (tipo === "EMPLEADO" && r.candidato) {
          respuestaStr = `"${r.candidato.nombreCompleto} (${r.candidato.departamento || '-'})"`;
        } else if (tipo === "TEXTO" && r.respuestaTexto) {
          respuestaStr = `"${r.respuestaTexto.replace(/"/g, '""')}"`;
        }

        csvData += `${fecha},${tipo},${textoPregunta},${respuestaStr}\n`;
      });
    });

    return { 
      success: true, 
      descarga: { 
        consolidado: csvData 
      } 
    };

  } catch (error) {
    return { error: "Fallo la construcción del CSV." };
  }
}

export async function exportarDatosCSVIndividual(mesFiltro: string, preguntaId: string) {
  try {
    const pregunta = await prisma.pregunta_Dinamica.findUnique({
      where: { id: preguntaId },
      include: {
        respuestas: {
          where: { mesVotado: mesFiltro },
          include: { candidato: true }
        }
      }
    });

    if (!pregunta) return { error: "Pregunta no encontrada." };

    let csvData = `Fecha,Pregunta,"${pregunta.texto.replace(/"/g, '""')}"\n`;

    pregunta.respuestas.forEach(r => {
      const fecha = r.fechaRegistro.toISOString().split("T")[0];
      let respuestaStr = "";
      
      if (pregunta.tipo === "EMPLEADO" && r.candidato) {
        respuestaStr = `"${r.candidato.nombreCompleto} (${r.candidato.departamento || '-'})"`;
      } else if (pregunta.tipo === "TEXTO" && r.respuestaTexto) {
        respuestaStr = `"${r.respuestaTexto.replace(/"/g, '""')}"`;
      }

      csvData += `${fecha},${pregunta.tipo},${respuestaStr}\n`;
    });

    return { 
      success: true, 
      csvData
    };
  } catch (error) {
    return { error: "Fallo la construcción del CSV de la encuesta." };
  }
}

export async function purgarResultadosPrueba() {
  try {
    // Borrado definitivo de TODA la tabla de respuestas (reset total de votos/sugerencias)
    const result = await prisma.respuesta_Anonima.deleteMany({});
    
    return { 
      success: true, 
      mensaje: `Se han eliminado permanentemente ${result.count} respuestas de la base de datos.` 
    };
  } catch (error) {
    return { error: "Ocurrió un error al intentar vaciar la base de datos de respuestas." };
  }
}
