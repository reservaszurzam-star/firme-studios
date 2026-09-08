import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Activity,
  Heart,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MessageCircle,
  Award,
  Target,
  Layers,
  Compass,
  Zap,
  Gift,
  AlertCircle,
} from 'lucide-react';

interface BiomechanicsQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSchedule?: () => void;
}

interface QuizAnswers {
  goal: string;
  injury: string;
  experience: string;
  schedule: string;
  name: string;
  phone: string;
}

export const BiomechanicsQuizModal: React.FC<BiomechanicsQuizModalProps> = ({
  isOpen,
  onClose,
  onSelectSchedule,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    goal: 'Aliviar dolores de espalda / cuello (Home office o postura)',
    injury: 'Dolor lumbar / Molestia al estar sentada',
    experience: 'Primera vez en máquinas Reformer',
    schedule: 'Tardes / Noches (06:00 PM - 08:30 PM)',
    name: '',
    phone: '',
  });

  if (!isOpen) return null;

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(5, prev + 1) as any);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as any);
  };

  const getProfileDiagnosis = () => {
    if (answers.injury.includes('lumbar') || answers.injury.includes('hernia') || answers.goal.includes('espalda')) {
      return {
        title: 'Descompresión Lumbar & Estabilización Pélvica',
        recommendedClass: 'Reformer Foundations & Core Suave',
        instructor: 'Valeria Castro (Especialista en Biomecánica Postural)',
        springSetting: 'Resortes suaves de descompresión (1 Azul + 1 Amarillo)',
        why: 'El trabajo horizontal en carro deslizante elimina la carga axial de la gravedad sobre tus discos lumbares L4-S1, fortaleciendo el transverso abdominal sin dolor.',
      };
    } else if (answers.goal.includes('Tonificar') || answers.experience.includes('intermedio')) {
      return {
        title: 'Tonificación Funcional & Contrology Avanzado',
        recommendedClass: 'Reformer Core & Form / Mat Sculpt',
        instructor: 'Mateo Silva (Certificación PMA)',
        springSetting: 'Resortes medios-pesados (2 Rojos + 1 Azul)',
        why: 'Enfoque de alta tensión excéntrica para alargar y definir musculatura profunda de abdomen, glúteos y tren superior con máxima fluidez.',
      };
    } else {
      return {
        title: 'Reeducación Postural Global & Movilidad',
        recommendedClass: 'Reformer Foundations / Breath & Flow',
        instructor: 'Clara Domínguez (Salud Articular)',
        springSetting: 'Resortes calibrados para propiocepción progresiva',
        why: 'Mejora de la alineación articular, respiración diafragmática intercostal y apertura torácica para recuperar energía diaria.',
      };
    }
  };

  const diagnosis = getProfileDiagnosis();

  const handleWhatsAppBooking = () => {
    const text = encodeURIComponent(
      `¡Hola FIRME STUDIO! Realicé el Test Biomecánico web. Mi diagnóstico es: *${diagnosis.title}*. Quisiera canjear mi código promocional *FIRME-TEST20* para mi clase de prueba en Jr. Akapana 1261 (SJL). Mi nombre es ${answers.name || 'Alumna'}.`
    );
    window.open(`https://wa.me/51984123456?text=${text}`, '_blank');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-3xl border border-[#E4DED4] p-6 sm:p-8 max-w-xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors"
          aria-label="Cerrar test biomecánico"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stepper Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5654A] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Test Biomecánico & Diagnóstico Postural
            </span>
            <span className="text-xs font-semibold text-[#6B655C]">
              {currentStep < 5 ? `Paso ${currentStep} de 4` : 'Diagnóstico Listo ✓'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#E4DED4] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#B5654A] to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-5">
          {/* STEP 1: OBJETIVO */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] mb-1">
                  1. ¿Cuál es tu objetivo principal en el Reformer?
                </h3>
                <p className="text-xs text-[#6B655C]">
                  Adaptamos la tensión de los resortes y la dinámica de las clases a tu meta.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    title: 'Aliviar dolores de espalda / cuello',
                    desc: 'Paso muchas horas sentada frente a la computadora o siento rigidez lumbar.',
                    icon: Activity,
                  },
                  {
                    title: 'Tonificar abdomen, glúteos y definir core',
                    desc: 'Quiero estilizar mi figura, fortalecer musculatura profunda y ganar resistencia.',
                    icon: Target,
                  },
                  {
                    title: 'Ganar flexibilidad y reducir estrés diario',
                    desc: 'Busco desconectar la mente, mejorar mi respiración diafragmática y postura.',
                    icon: Sparkles,
                  },
                  {
                    title: 'Rehabilitación guiada o post-parto',
                    desc: 'Necesito recuperar fuerza pélvica con bajo impacto y asesoría clínica.',
                    icon: ShieldCheck,
                  },
                ].map((opt) => {
                  const OptIcon = opt.icon;
                  return (
                    <button
                      key={opt.title}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, goal: opt.title }))}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        answers.goal === opt.title
                          ? 'bg-[#B5654A]/10 border-[#B5654A] shadow-xs'
                          : 'bg-white border-[#E4DED4] hover:bg-[#F1ECE5]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] border border-[#E4DED4] flex items-center justify-center text-[#B5654A] shrink-0 mt-0.5">
                        <OptIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1A1815]">{opt.title}</h4>
                        <p className="text-[11px] text-[#6B655C] mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: MOLESTIAS / ANTECEDENTES */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] mb-1">
                  2. ¿Presentas alguna molestia o lesión articular?
                </h3>
                <p className="text-xs text-[#6B655C]">
                  En FIRME STUDIO cuidamos tu columna con graduación precisa de resortes.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    title: 'Dolor lumbar / Molestia al estar sentada',
                    desc: 'Molestias en la espalda baja o sensación de tensión al final del día.',
                    icon: Activity,
                  },
                  {
                    title: 'Tensión cervical y hombros cargados',
                    desc: 'Sobrecarga en el cuello, trapecios o dolores de cabeza tensionales.',
                    icon: Heart,
                  },
                  {
                    title: 'Escoliosis, protrusión o hernia discal',
                    desc: 'Diagnóstico médico que requiere supervisión y movimientos sin impacto.',
                    icon: ShieldCheck,
                  },
                  {
                    title: 'Ninguna molestia (Apto 100%)',
                    desc: 'No tengo lesiones actuales y puedo entrenar a intensidad normal.',
                    icon: CheckCircle2,
                  },
                ].map((opt) => {
                  const OptIcon = opt.icon;
                  return (
                    <button
                      key={opt.title}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, injury: opt.title }))}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        answers.injury === opt.title
                          ? 'bg-[#B5654A]/10 border-[#B5654A] shadow-xs'
                          : 'bg-white border-[#E4DED4] hover:bg-[#F1ECE5]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] border border-[#E4DED4] flex items-center justify-center text-[#B5654A] shrink-0 mt-0.5">
                        <OptIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1A1815]">{opt.title}</h4>
                        <p className="text-[11px] text-[#6B655C] mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: EXPERIENCIA PREVIA */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] mb-1">
                  3. ¿Cuál es tu experiencia con el Reformer?
                </h3>
                <p className="text-xs text-[#6B655C]">
                  El 70% de nuestras socias comenzaron desde cero en nuestra sede de Jr. Akapana.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    title: 'Primera vez en máquinas Reformer',
                    desc: 'Nunca he practicado en camilla con resortes, deseo aprender paso a paso.',
                    icon: Layers,
                  },
                  {
                    title: 'He practicado Pilates Mat (Suelo)',
                    desc: 'Conozco los principios básicos pero no el manejo del carro y la barra de pies.',
                    icon: Compass,
                  },
                  {
                    title: 'Nivel Intermedio o Avanzado',
                    desc: 'Ya domino las posiciones del Reformer y busco retos de fuerza y equilibrio.',
                    icon: Award,
                  },
                ].map((opt) => {
                  const OptIcon = opt.icon;
                  return (
                    <button
                      key={opt.title}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, experience: opt.title }))}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        answers.experience === opt.title
                          ? 'bg-[#B5654A]/10 border-[#B5654A] shadow-xs'
                          : 'bg-white border-[#E4DED4] hover:bg-[#F1ECE5]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] border border-[#E4DED4] flex items-center justify-center text-[#B5654A] shrink-0 mt-0.5">
                        <OptIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1A1815]">{opt.title}</h4>
                        <p className="text-[11px] text-[#6B655C] mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: HORARIOS & DATOS */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] mb-1">
                  4. ¿Qué turno prefieres para tu práctica?
                </h3>
                <p className="text-xs text-[#6B655C]">
                  Sede: Jr. Akapana 1261, Lima - San Juan de Lurigancho.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  'Mañanas (07:00 AM - 09:30 AM)',
                  'Mediodía (12:00 PM - 02:00 PM)',
                  'Tardes / Noches (06:00 PM - 08:30 PM)',
                  'Sábados y Domingos',
                ].map((sched) => (
                  <button
                    key={sched}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, schedule: sched }))}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      answers.schedule === sched
                        ? 'bg-[#B5654A] text-white border-[#B5654A] shadow-xs'
                        : 'bg-white border-[#E4DED4] text-[#1A1815] hover:bg-[#F1ECE5]'
                    }`}
                  >
                    {sched}
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E4DED4]">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                    Tu Nombre o Apellido (Opcional)
                  </label>
                  <input
                    type="text"
                    value={answers.name}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej. Sofía Montaner"
                    className="w-full bg-white border border-[#E4DED4] rounded-xl px-3.5 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DIAGNÓSTICO FINAL */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in zoom-in-95 duration-300">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B5654A]">
                  Diagnóstico Personalizado Listo
                </span>
                <h3 className="font-fraunces text-2xl text-[#1A1815] mt-0.5">
                  {diagnosis.title}
                </h3>
              </div>

              {/* Clinical Card */}
              <div className="bg-gradient-to-br from-[#1A1815] to-[#2D2622] rounded-2xl p-5 text-white shadow-md space-y-3">
                <div>
                  <span className="text-[10px] text-[#B5654A] uppercase font-bold tracking-wider block">
                    Clase Sugerida para tu Perfil
                  </span>
                  <p className="font-fraunces text-lg font-medium text-white">{diagnosis.recommendedClass}</p>
                  <span className="text-xs text-white/70 block">Instructor Guía: {diagnosis.instructor}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Calibración de Resortes Sugerida:</span>
                  </div>
                  <p className="text-white/90 text-xs">{diagnosis.springSetting}</p>
                </div>

                <p className="text-xs text-white/80 leading-relaxed pt-1 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                  <span>{diagnosis.why}</span>
                </p>
              </div>

              {/* Coupon Box */}
              <div className="bg-[#FAF2E8] border-2 border-dashed border-[#B5654A] rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8C5511] flex items-center justify-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#B5654A]" />
                  <span>Beneficio Exclusivo por completar el Test</span>
                </span>
                <div className="font-mono text-lg font-bold text-[#B5654A] tracking-wider">
                  FIRME-TEST20
                </div>
                <p className="text-xs text-[#8C5511]">
                  20% de descuento en tu clase introductoria o pack inicial en Jr. Akapana 1261.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleWhatsAppBooking}
                  className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reclamar 20% y Agendar por WhatsApp</span>
                </button>

                {onSelectSchedule && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectSchedule();
                    }}
                    className="w-full bg-[#FAF8F5] border border-[#E4DED4] hover:bg-[#F1ECE5] text-[#1A1815] py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Ver Horarios Disponibles en la Web
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons (Steps 1 to 4) */}
        {currentStep < 5 && (
          <div className="pt-4 mt-4 border-t border-[#E4DED4] flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-semibold text-[#6B655C] hover:text-[#1A1815] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{currentStep === 4 ? 'Ver Mi Diagnóstico' : 'Siguiente'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
