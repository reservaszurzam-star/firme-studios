import React, { useState } from 'react';
import { Compass, Sparkles, ArrowUpRight, CheckCircle2, X } from 'lucide-react';

export const NewHereSection: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'pilates' | 'studio' | null>(null);

  return (
    <section
      id="pilates"
      className="w-full bg-[#FAF8F5] py-16 sm:py-20 border-b border-[#E4DED4]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 sm:mb-14 max-w-2xl">
          <span className="text-xs font-medium tracking-widest uppercase text-[#B5654A] block mb-2">
            Primeros pasos
          </span>
          <h2 className="font-fraunces text-2xl sm:text-3xl md:text-4xl text-[#1A1815] tracking-tight">
            ¿Es tu primera vez con nosotros?
          </h2>
          <p className="mt-3 text-[#6B655C] text-sm sm:text-base leading-relaxed">
            Hemos diseñado una experiencia de bienvenida personalizada para que te sientas
            seguro, comprendas tu biomecánica y avances sin prisas ni presiones.
          </p>
        </div>

        {/* 2 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Card 1: Nuevo en Pilates */}
          <div
            id="card-nuevo-en-pilates"
            className="bg-[#F1ECE5] border border-[#E4DED4] rounded-lg p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xs group"
          >
            <div>
              {/* Photo Header */}
              <div className="w-full h-48 sm:h-56 rounded-md overflow-hidden mb-5 relative border border-[#E4DED4]/80 group-hover:shadow-xs transition-shadow">
                <img
                  src="/assets/nuevo-en-pilates.jpg"
                  alt="Aprende Pilates Reformer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 left-3 w-10 h-10 rounded-md bg-[#FAF8F5]/90 backdrop-blur-xs border border-[#E4DED4] flex items-center justify-center text-[#B5654A] shadow-xs">
                  <Compass className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-[#1A1815]/75 backdrop-blur-xs text-[#FAF8F5] text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded">
                  Fundamentos Reformer
                </div>
              </div>

              <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] mb-2 font-medium">
                Nuevo en Pilates
              </h3>
              <p className="text-[#6B655C] text-sm leading-relaxed mb-6">
                Aprende la respiración intercostal, el control del centro y la mecánica
                del Reformer desde cero con instructores especializados en alineación postural y adaptación anatómica.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setActiveModal('pilates')}
                className="inline-flex items-center text-sm font-medium text-[#B5654A] hover:text-[#9A5340] group/link underline underline-offset-4 decoration-[#B5654A]/40 hover:decoration-[#9A5340] transition-colors"
              >
                <span>Saber más sobre clases introductorias</span>
                <ArrowUpRight className="ml-1.5 w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Nuevo en el estudio */}
          <div
            id="card-nuevo-en-estudio"
            className="bg-[#F1ECE5] border border-[#E4DED4] rounded-lg p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xs group"
          >
            <div>
              {/* Photo Header */}
              <div className="w-full h-48 sm:h-56 rounded-md overflow-hidden mb-5 relative border border-[#E4DED4]/80 group-hover:shadow-xs transition-shadow">
                <img
                  src="/assets/nuevo-en-estudio.jpg"
                  alt="Instalaciones y bienvenida en FIRME STUDIO"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 left-3 w-10 h-10 rounded-md bg-[#FAF8F5]/90 backdrop-blur-xs border border-[#E4DED4] flex items-center justify-center text-[#B5654A] shadow-xs">
                  <Sparkles className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-[#1A1815]/75 backdrop-blur-xs text-[#FAF8F5] text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded">
                  Experiencia en Sala
                </div>
              </div>

              <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] mb-2 font-medium">
                Nuevo en el estudio
              </h3>
              <p className="text-[#6B655C] text-sm leading-relaxed mb-6">
                Conoce nuestras normas de convivencia, cómo reservar tus sesiones semanales,
                la política de cancelación de doce horas y las comodidades disponibles en vestuarios.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setActiveModal('studio')}
                className="inline-flex items-center text-sm font-medium text-[#B5654A] hover:text-[#9A5340] group/link underline underline-offset-4 decoration-[#B5654A]/40 hover:decoration-[#9A5340] transition-colors"
              >
                <span>Saber más sobre la experiencia en sala</span>
                <ArrowUpRight className="ml-1.5 w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Informative Modal when clicking "Saber más" */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-[#FAF8F5] rounded-lg border border-[#E4DED4] p-6 sm:p-8 max-w-lg w-full shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'pilates' ? (
              <div>
                <span className="text-xs font-medium tracking-widest uppercase text-[#B5654A] block mb-1">
                  Guía de iniciación
                </span>
                <h3 className="font-fraunces text-2xl text-[#1A1815] mb-4">
                  Tu primera sesión en Reformer
                </h3>
                <div className="space-y-3 text-sm text-[#6B655C]">
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Clase de Fundamentos:</strong> Te recomendamos comenzar por nuestras sesiones nivel 'Fundamentos' para familiarizarte con los muelles y la barra de pies.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Ropa recomendada:</strong> Ropa cómoda y flexible. Es obligatorio el uso de calcetines antideslizantes por higiene y agarre.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Llegada temprana:</strong> Te esperamos 10 minutos antes de tu primera clase para presentarte al instructor y calibrar el aparato.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs font-medium tracking-widest uppercase text-[#B5654A] block mb-1">
                  Protocolo del estudio
                </span>
                <h3 className="font-fraunces text-2xl text-[#1A1815] mb-4">
                  Convivencia y reservas
                </h3>
                <div className="space-y-3 text-sm text-[#6B655C]">
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Cancelaciones:</strong> Cancelación sin cargo hasta 12 horas antes del inicio de la sesión.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Silencio y calma:</strong> Los móviles deben permanecer en silencio en las taquillas para preservar la concentración en sala.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Vestuarios:</strong> Disponemos de duchas privadas, toallas limpias y secadores a tu completa disposición.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#E4DED4] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-5 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
