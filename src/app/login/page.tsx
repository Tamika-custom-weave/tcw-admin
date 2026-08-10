"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    
    setError("");
    setIsSubmitting(true);
    
    try {
      await login(pin);
    } catch (error) { const err = error as Error;
      setError(err.message || "Invalid PIN");
      setPin("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <Image
            src="/tamikas-logo.png"
            alt="Tamika's Custom Weave"
            width={260}
            height={76}
            className="object-contain h-20 w-auto mx-auto mb-6"
            priority
          />
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-400">Admin Portal</p>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="flex flex-col items-center">
              <label htmlFor="pin" className="sr-only">Enter Access PIN</label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength={6}
                autoFocus
                className="w-full text-center text-4xl tracking-[0.5em] font-serif border-b-2 border-gray-100 focus:border-[#86733B] pb-4 bg-transparent outline-none transition-colors placeholder:text-gray-200 text-gray-900"
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-red-500 text-sm font-medium mt-4 animate-in slide-in-from-top-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !pin}
              className="w-full bg-[#86733B] hover:bg-[#726232] text-white py-4 rounded-xl font-medium tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-14"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Unlock Dashboard"
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-8 font-medium">
          Protected by TCW Security
        </p>
      </div>
    </div>
  );
}
