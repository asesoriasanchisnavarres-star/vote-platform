"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAdmin } from "@/app/actions/adminAuth";
import { FaLock, FaExclamationTriangle } from "react-icons/fa";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full btn-primary text-lg flex items-center justify-center gap-2 ${pending ? "opacity-70 cursor-wait" : ""}`}
    >
      <FaLock />
      {pending ? "Autenticando..." : "Acceder al Panel Máster"}
    </button>
  );
}

export default function AdminLogin() {
  const [state, formAction] = useFormState(loginAdmin, { error: "" });

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
      <div className="max-w-md w-full p-8 md:p-12 text-center relative overflow-hidden bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg">
          <FaLock />
        </div>

        <h1 className="text-2xl font-semibold mb-2">Acceso Restringido</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Área exclusiva para el administrador del sistema.
        </p>

        <form action={formAction} className="space-y-6">
          <div className="relative">
            <input 
              type="password" 
              name="password"
              placeholder="Contraseña Maestra" 
              required
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-5 py-4 text-center text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {state?.error && (
            <div className="p-3 bg-red-900/40 text-red-400 border border-red-800 rounded-lg text-sm flex items-center justify-center gap-2">
              <FaExclamationTriangle />
              {state.error}
            </div>
          )}

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
