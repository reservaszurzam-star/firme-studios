import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  Gift,
  CheckCircle2,
  Lock,
  Flame,
  Zap,
  Target,
  Clock,
  ShieldCheck,
  X,
  Layers,
  Activity,
  Crown,
  Sun,
  Users,
} from 'lucide-react';
import { AuthUser } from '../types';

interface StudentLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser | null;
  onGainExp?: (amount: number, reason: string) => void;
}

interface LevelTier {
  level: number;
  romanNumeral: string;
  name: string;
  minExp: number;
  maxExp: number;
  iconComponent: React.ComponentType<{ className?: string }>;
  perks: string[];
  reward: string;
  isUnlocked: boolean;
  isCurrent: boolean;
}

export const StudentLevelModal: React.FC<StudentLevelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onGainExp,
}) => {
  const [activeTab, setActiveTab] = useState<'niveles' | 'misiones' | 'insignias'>('niveles');

  if (!isOpen) return null;

  const currentExp = currentUser?.exp ?? 1350;
  const currentLevel = currentUser?.level ?? 2;

  const LEVEL_TIERS: LevelTier[] = [
    {
      level: 1,
      romanNumeral: 'I',
      name: 'Fundamentos & Alineación',
      minExp: 0,
      maxExp: 499,
      iconComponent: Layers,
      perks: ['Evaluación biomecánica inicial en reformer', 'Acceso a la agenda semanal de 8 cupos'],
      reward: 'Guía digital de salud postural y biomecánica diaria',
      isUnlocked: currentExp >= 0,
      isCurrent: currentLevel === 1,
    },
    {
      level: 2,
      romanNumeral: 'II',
      name: 'Enfoque & Constancia',
      minExp: 500,
      maxExp: 1499,
      iconComponent: Activity,
      perks: ['15% de descuento en Boutique oficial', 'Reserva prioritaria anticipada con 48h'],
      reward: '15% de cortesía en boutique oficial de Jr. Akapana',
      isUnlocked: currentExp >= 500,
      isCurrent: currentLevel === 2,
    },
    {
      level: 3,
      romanNumeral: 'III',
      name: 'Maestría Reformer',
      minExp: 1500,
      maxExp: 2999,
      iconComponent: Award,
      perks: ['Invitación a Masterclass exclusiva mensual', 'Toalla de microfibra esterilizada en cada clase'],
      reward: '1 Par de Calcetines Grip Antideslizantes FIRME en recepción',
      isUnlocked: currentExp >= 1500,
      isCurrent: currentLevel === 3,
    },
    {
      level: 4,
      romanNumeral: 'IV',
      name: 'Élite Contrology',
      minExp: 3000,
      maxExp: 4999,
      iconComponent: ShieldCheck,
      perks: ['Casillero VIP con distinción personalizada', 'Pase de invitado mensual para 1 acompañante'],
      reward: '1 Sesión Privada 1-a-1 personalizada (valor S/. 180)',
      isUnlocked: currentExp >= 3000,
      isCurrent: currentLevel === 4,
    },
    {
      level: 5,
      romanNumeral: 'V',
      name: 'Leyenda FIRME',
      minExp: 5000,
      maxExp: 9999,
      iconComponent: Crown,
      perks: ['15% de descuento vitalicio en renovaciones', 'Acceso a eventos cerrados de aniversario'],
      reward: 'Distinción conmemorativa en estudio + Renovación VIP',
      isUnlocked: currentExp >= 5000,
      isCurrent: currentLevel === 5,
    },
  ];

  const currentTier = LEVEL_TIERS.find((t) => t.level === currentLevel) || LEVEL_TIERS[1];
  const nextTier = LEVEL_TIERS.find((t) => t.level === currentLevel + 1) || LEVEL_TIERS[2];
  const expInCurrentLevel = currentExp - currentTier.minExp;
  const expNeededForNextLevel = nextTier.minExp - currentTier.minExp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((expInCurrentLevel / expNeededForNextLevel) * 100)));
  const expToNextLevel = Math.max(0, nextTier.minExp - currentExp);

  const CurrentIcon = currentTier.iconComponent;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#141311]/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-xl w-full max-h-[90vh] shadow-2xl relative text-[#1A1815] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Level Banner */}
        <div className="bg-[#141311] text-white p-5 sm:p-6 shrink-0 relative overflow-hidden border-b border-[#2D2824]">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-[#B5654A]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#221F1B] border border-[#B5654A]/50 flex items-center justify-center text-[#B5654A] shadow-md">
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-white/10 px-2.5 py-0.5 rounded-md text-amber-300 border border-white/10">
                    Categoría {currentTier.romanNumeral}
                  </span>
                  <span className="text-xs text-white/70">
                    {currentUser?.name || 'Sofía Montaner'}
                  </span>
                </div>
                <h3 className="font-fraunces text-xl sm:text-2xl text-white font-medium mt-0.5">
                  {currentTier.name}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar & Stats */}
          <div className="pt-4 relative z-10 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-white/80 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#B5654A]" />
                Puntos Acumulados: <strong>{currentExp.toLocaleString()} pts</strong>
              </span>
              <span className="text-amber-300 font-bold font-mono">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#B5654A] to-amber-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span>Nivel {currentTier.romanNumeral} ({currentTier.minExp} pts)</span>
              <span className="text-amber-200/90 font-medium">
                {expToNextLevel} puntos para {nextTier.name}
              </span>
              <span>Nivel {nextTier.romanNumeral} ({nextTier.minExp} pts)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-[#E4DED4] bg-[#F1ECE5]/60 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('niveles')}
            className={`py-3 px-2 text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'niveles'
                ? 'border-[#B5654A] text-[#B5654A] bg-[#FAF8F5]'
                : 'border-transparent text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Escala de Rangos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('misiones')}
            className={`py-3 px-2 text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'misiones'
                ? 'border-[#B5654A] text-[#B5654A] bg-[#FAF8F5]'
                : 'border-transparent text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Metas Semanales</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B5654A]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('insignias')}
            className={`py-3 px-2 text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'insignias'
                ? 'border-[#B5654A] text-[#B5654A] bg-[#FAF8F5]'
                : 'border-transparent text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reconocimientos</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          
          {/* TAB 1: ESCALA DE NIVELES */}
          {activeTab === 'niveles' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="text-xs text-[#6B655C] mb-3">
                Cada asistencia acreditada suma <strong>+100 puntos</strong>. Los rangos superiores habilitan beneficios exclusivos en reserva y cortesías en boutique.
              </p>

              {LEVEL_TIERS.map((tier) => {
                const TierIcon = tier.iconComponent;
                return (
                  <div
                    key={tier.level}
                    className={`p-4 rounded-xl border transition-all ${
                      tier.isCurrent
                        ? 'bg-gradient-to-r from-[#FAF8F5] to-[#FAF2E8] border-[#B5654A] shadow-xs ring-1 ring-[#B5654A]/30'
                        : tier.isUnlocked
                        ? 'bg-white border-[#E4DED4]'
                        : 'bg-[#F1ECE5]/40 border-[#E4DED4]/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                          tier.isCurrent
                            ? 'bg-[#B5654A] text-white border-[#B5654A]'
                            : tier.isUnlocked
                            ? 'bg-[#F1ECE5] text-[#B5654A] border-[#E4DED4]'
                            : 'bg-[#E4DED4] text-[#8C8479] border-[#DDD5C9]'
                        }`}>
                          <TierIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1A1815]">
                              Categoría {tier.romanNumeral}: {tier.name}
                            </span>
                            {tier.isCurrent && (
                              <span className="bg-[#B5654A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Rango Actual
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#6B655C] font-mono">
                            {tier.minExp} – {tier.maxExp} pts
                          </span>
                        </div>
                      </div>

                      {tier.isUnlocked ? (
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Habilitado
                        </span>
                      ) : (
                        <span className="text-[#6B655C] bg-[#E4DED4] px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <Lock className="w-3 h-3" />
                          {tier.minExp} pts
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1 text-xs text-[#6B655C] pl-12 mb-2.5">
                      {tier.perks.map((p, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B5654A]" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={`ml-12 p-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      tier.isUnlocked ? 'bg-amber-50/80 text-amber-900 border border-amber-200' : 'bg-white border border-[#E4DED4] text-[#6B655C]'
                    }`}>
                      <Gift className="w-3.5 h-3.5 text-[#B5654A] shrink-0" />
                      <span>Beneficio: <strong>{tier.reward}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: METAS SEMANALES */}
          {activeTab === 'misiones' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-[#FAF2E8] border border-[#ECD1B0] p-3 rounded-xl text-xs text-[#8C5511] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#B5654A]" />
                  <span>Constancia: <strong>3 semanas ininterrumpidas</strong> (+150 pts activo)</span>
                </div>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold">Renueva en 3 días</span>
              </div>

              {/* Quest 1 */}
              <div className="bg-white border border-[#E4DED4] p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1815]">Check-in Digital en Tótem</h4>
                    <p className="text-[11px] text-[#6B655C]">Validar QR en recepción al llegar a sala.</p>
                    <span className="text-[10px] text-emerald-700 font-semibold">Completado · Puntos acreditados</span>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 font-mono">
                  +50 pts ✓
                </span>
              </div>

              {/* Quest 2 */}
              <div className="bg-white border border-[#E4DED4] p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1815]">Constancia Semanal (2 Sesiones)</h4>
                    <p className="text-[11px] text-[#6B655C]">Asistir a dos sesiones guiadas esta semana.</p>
                    <div className="w-32 h-1.5 bg-[#E4DED4] rounded-full overflow-hidden mt-1.5">
                      <div className="w-1/2 h-full bg-[#B5654A]" />
                    </div>
                    <span className="text-[10px] text-[#B5654A] font-semibold mt-0.5 block">1 / 2 completadas</span>
                  </div>
                </div>
                <span className="bg-[#FAF2E8] text-[#8C5511] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#ECD1B0] shrink-0 font-mono">
                  +150 pts
                </span>
              </div>

              {/* Quest 3 */}
              <div className="bg-white border border-[#E4DED4] p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1815]">Sesión Matutina de Enfoque</h4>
                    <p className="text-[11px] text-[#6B655C]">Asistir en horario matutino (06:30 o 07:30 AM).</p>
                    <span className="text-[10px] text-[#6B655C]">0 / 1 clases completadas</span>
                  </div>
                </div>
                <span className="bg-[#F1ECE5] text-[#1A1815] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#E4DED4] shrink-0 font-mono">
                  +100 pts
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: RECONOCIMIENTOS */}
          {activeTab === 'insignias' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="text-xs text-[#6B655C] mb-2">
                Distinciones de mérito otorgadas por constancia, postura y disciplina técnica:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1815]">Primer Salto</h4>
                    <p className="text-[10px] text-[#6B655C]">Primera sesión completada en Reformer.</p>
                    <span className="text-[9px] font-semibold text-emerald-700">Acreditado</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-300 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1815]">Racha de Constancia</h4>
                    <p className="text-[10px] text-[#6B655C]">3 semanas consecutivas sin faltar.</p>
                    <span className="text-[9px] font-semibold text-amber-700">Acreditado</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-blue-300 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1815]">Columna Blindada</h4>
                    <p className="text-[10px] text-[#6B655C]">10 clases con alineación postural neutra.</p>
                    <span className="text-[9px] font-semibold text-blue-700">Acreditado</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F1ECE5]/40 rounded-xl border border-[#E4DED4] opacity-75 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#E4DED4] text-[#8C8479] flex items-center justify-center shrink-0">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1815]">Madrugador FIRME</h4>
                    <p className="text-[10px] text-[#6B655C]">5 clases en horario 06:30 o 07:30 AM.</p>
                    <span className="text-[9px] font-semibold text-[#6B655C]">Progreso: 2 / 5</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F1ECE5]/40 rounded-xl border border-[#E4DED4] opacity-75 flex items-center gap-3 sm:col-span-2">
                  <div className="w-10 h-10 rounded-lg bg-[#E4DED4] text-[#8C8479] flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1815]">Centurión del Reformer</h4>
                    <p className="text-[10px] text-[#6B655C]">Alcanzar 100 clases asistidas en la sede de SJL.</p>
                    <span className="text-[9px] font-semibold text-[#6B655C]">Progreso: 14 / 100 clases</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t border-[#E4DED4] bg-[#FAF8F5] shrink-0 flex items-center justify-between gap-2">
          {onGainExp ? (
            <button
              type="button"
              onClick={() => onGainExp(100, 'Asistencia a Clase Reformer')}
              className="bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#E4DED4] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#B5654A]" />
              <span>Simular +100 pts</span>
            </button>
          ) : (
            <span className="text-xs text-[#6B655C]">Membresía FIRME</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="bg-[#141311] hover:bg-[#B5654A] text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
