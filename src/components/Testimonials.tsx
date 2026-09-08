import React from 'react';
import { Star, ShieldCheck, CheckCircle2, Sparkles, Quote, Target } from 'lucide-react';

interface EnhancedTestimonial {
  id: string;
  name: string;
  duration: string;
  classesCount: number;
  goal: string;
  quote: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS_DATA: EnhancedTestimonial[] = [
  {
    id: 'test-1',
    name: 'Elena Serrano M.',
    duration: 'Alumna desde Mayo 2024',
    classesCount: 48,
    goal: 'Recuperación de hernia lumbar L4-L5',
    quote: 'Trabajo 9 horas frente a la computadora y vivía con contracturas constantes. En FIRME no me tratan como un número: Valeria me adaptó la tensión de los resortes y hoy puedo levantar peso y caminar sin una pizca de dolor.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Javier Bermejo P.',
    duration: 'Alumno desde Noviembre 2023',
    classesCount: 62,
    goal: 'Movilidad articular y rendimiento en running',
    quote: 'Pensaba que Pilates en reformer era suave o solo para estirar. La clase de Mateo me demostró una exigencia biomecánica que mejoró mis tiempos en la media maratón de Lima y blindó mis rodillas.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'Sofía Montaner R.',
    duration: 'Alumna desde Agosto 2024',
    classesCount: 35,
    goal: 'Tonificación profunda y reducción de estrés',
    quote: 'El ambiente del estudio en San Juan de Lurigancho es único: luces cálidas, música suave y aromaterapia deliciosa. Salir de mi sesión de las 7:30 AM me deja con energía y la espalda totalmente erguida.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section
      id="testimonios"
      className="w-full bg-[#F1ECE5]/60 py-16 sm:py-20 lg:py-24 border-b border-[#E4DED4]/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E4DED4] px-3.5 py-1.5 rounded-full mb-3 shadow-2xs">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-[#1A1815]">4.98 / 5.0</span>
            <span className="text-[11px] text-[#6B655C]">· +320 reseñas verificadas</span>
          </div>

          <h2 className="font-fraunces text-2xl sm:text-3xl md:text-4xl text-[#1A1815] tracking-tight">
            Historias que inspiran constancia
          </h2>
          <p className="mt-3 text-[#6B655C] text-sm sm:text-base leading-relaxed">
            Nuestros alumnos comparten cómo el método Reformer transformó su postura, fuerza central y bienestar diario.
          </p>
        </div>

        {/* Testimonials Container (Horizontal snap on mobile, 3-col grid on desktop) */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-none md:grid md:grid-cols-3 md:gap-6 lg:gap-8 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              className="w-[85vw] max-w-sm shrink-0 snap-center md:w-auto bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#B5654A]/40 relative group"
            >
              {/* Quote badge & Stars */}
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] bg-[#EDF5F0] text-[#245E39] font-bold px-2 py-0.5 rounded-full border border-[#C5DEC9] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {t.classesCount} clases
                  </span>
                </div>

                {/* Target objective pill */}
                <div className="mb-2.5 sm:mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#B5654A] bg-[#B5654A]/10 px-2.5 py-1 rounded-md">
                    <Target className="w-3 h-3 shrink-0" />
                    {t.goal}
                  </span>
                </div>

                {/* Quote text */}
                <p className="text-xs sm:text-sm text-[#1A1815] leading-relaxed mb-5 sm:mb-6 font-normal italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Student Footer Card */}
              <div className="flex items-center space-x-3.5 pt-3.5 sm:pt-4 border-t border-[#E4DED4]/80">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-[#E4DED4] shadow-xs shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-fraunces text-sm font-medium text-[#1A1815] truncate">
                      {t.name}
                    </h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B5654A] shrink-0" title="Perfil verificado" />
                  </div>
                  <span className="text-[11px] text-[#6B655C] block truncate">
                    {t.duration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-1.5 pt-1 text-[11px] text-[#6B655C]">
          <span>Desliza para leer más historias</span>
          <span className="text-[#B5654A] font-bold">→</span>
        </div>

        {/* Studio Guarantee Banner */}
        <div className="mt-12 text-center text-xs text-[#6B655C] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#B5654A]" />
          <span>Todas las reseñas provienen de alumnos reales con asistencia confirmada en sala reformer.</span>
        </div>

      </div>
    </section>
  );
};
