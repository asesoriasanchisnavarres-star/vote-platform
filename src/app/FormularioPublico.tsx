"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registrarEncuesta } from "@/app/actions/encuesta";
import { FaExclamationCircle } from "react-icons/fa";

function SubmitButton({ isReady }: { isReady: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
      <button 
        type="submit" 
        disabled={pending || !isReady}
        className={`w-full btn-primary text-xl py-5 shadow-2xl shadow-blue-600/20 ${(pending || !isReady) ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {pending ? "Enviando..." : "Enviar Formulario"}
      </button>
      <p className="text-center text-xs text-gray-400 mt-4">Al enviar, tu participación quedará cerrada para el mes en curso.</p>
    </div>
  );
}

export default function FormularioPublico({ preguntas, candidatos, mesVotado }: { preguntas: any[], candidatos: any[], mesVotado: string }) {
  const [state, formAction] = useFormState(registrarEncuesta, { error: "", success: false });

  if (state?.success) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Registrando tu participación...</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-10">
      <input type="hidden" name="mes-encuesta" value={mesVotado} />

      {preguntas.map((pregunta, index) => (
        <div key={pregunta.id} className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-900 group focus-within:border-blue-500 transition-colors">
          <span className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center border-4 border-white dark:border-gray-900 text-sm">
            {index + 1}
          </span>
          <label className="block font-semibold mb-3 text-xl text-gray-800 dark:text-gray-100">
            {pregunta.texto}
          </label>

          {pregunta.tipo === "EMPLEADO" ? (
            candidatos.length === 0 ? (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                Aún no hay compañeros en el censo.
              </div>
            ) : (
              <div className="relative">
                <select 
                  name={`pregunta_${pregunta.id}`} 
                  required
                  defaultValue=""
                  className="w-full appearance-none bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer font-medium"
                >
                  <option value="" disabled>-- Selecciona un compañero --</option>
                  {candidatos.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.nombreCompleto} {c.departamento ? `(${c.departamento})` : ""}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            )
          ) : (
            <textarea 
              name={`pregunta_${pregunta.id}`}
              rows={4}
              required
              placeholder="Escribe tu respuesta sincera y constructiva aquí..."
              className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-y"
            ></textarea>
          )}
        </div>
      ))}

      {state?.error && (
        <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl flex items-center gap-3">
          <FaExclamationCircle className="flex-shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      {/* Solo permitir envío si hay opciones disponibles para votar */}
      <SubmitButton isReady={preguntas.length > 0} />
    </form>
  );
}
