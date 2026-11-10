import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../ui';

export default function NotFoundView({ onGoHome }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-950/60 border border-brand-500/30 text-brand-400 flex items-center justify-center mb-5 shadow-lg">
        <Compass size={32} />
      </div>
      <h2 className="text-xl font-bold text-gray-100">
        404 — Módulo no encontrado
      </h2>
      <p className="text-xs text-dark-muted max-w-md mt-2 leading-relaxed">
        La sección que estás intentando consultar no existe o fue reubicada en el sistema.
      </p>
      <div className="mt-6">
        <Button
          variant="primary"
          onClick={onGoHome}
          leftIcon={<ArrowLeft size={16} />}
        >
          Volver al Catálogo de Servicios
        </Button>
      </div>
    </div>
  );
}
