import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Users,
  Play,
  Pause,
  RotateCcw,
  Plus,
  HelpCircle,
  Activity,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  Thermometer,
  ShieldCheck,
} from 'lucide-react';
import { ClassSession, BookingRecord, ClientProfile, DayOfWeek } from '../../types';
import { DAYS_OF_WEEK } from '../../data/mockData';
import { studioApi } from '../../services/api';

interface AdminInstructorTabProps {
  classes: ClassSession[];
  bookings: BookingRecord[];
  clients: ClientProfile[];
  onUpdateBookingStatus?: (bookingId: string, status: BookingRecord['status']) => void;
  onAssignBed?: (bookingId: string, bedNumber: number) => void;
}

export const AdminInstructorTab: React.FC<AdminInstructorTabProps> = ({
  classes,
  bookings,
  clients,
  onUpdateBookingStatus,
  onAssignBed,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lun');
  const [selectedClassId, setSelectedClassId] = useState<string>('lun-1');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeBedModal, setActiveBedModal] = useState<{ bedNum: number; booking?: BookingRecord } | null>(null);

  // Timer state for 50 min class
  const [timerSeconds, setTimerSeconds] = useState(50 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Quick Biomechanics Advisor state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiConditionQuery, setAiConditionQuery] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSec: number) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Day classes
  const dayClasses = useMemo(() => {
    return classes.filter((c) => c.day === selectedDay);
  }, [classes, selectedDay]);

  // Current active class
  const activeClass = useMemo(() => {
    const found = classes.find((c) => c.id === selectedClassId);
    return found || dayClasses[0] || classes[0];
  }, [classes, selectedClassId, dayClasses]);

  // Bookings for this class
  const classBookings = useMemo(() => {
    if (!activeClass) return [];
    return bookings.filter((b) => b.classId === activeClass.id && b.status !== 'cancelada');
  }, [bookings, activeClass]);

  // Map of Bed 1..8
  const bedMap = useMemo(() => {
    const map: { [bedNum: number]: BookingRecord | undefined } = {};
    for (let i = 1; i <= 8; i++) {
      map[i] = classBookings.find((b) => b.bedNumber === i);
    }
    return map;
  }, [classBookings]);

  // Attended count
  const attendedCount = useMemo(() => {
    return classBookings.filter((b) => b.status === 'asistio').length;
  }, [classBookings]);

  const toggleAttendance = async (booking: BookingRecord) => {
    const newStatus: BookingRecord['status'] = booking.status === 'asistio' ? 'confirmada' : 'asistio';
    try {
      if (newStatus === 'asistio') {
        await studioApi.checkInBooking(booking.id, booking.bedNumber);
      } else {
        await studioApi.updateBookingStatus(booking.id, newStatus);
      }
    } catch {
      // local fallback handled below
    }

    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(booking.id, newStatus);
    }
  };

  const handleConsultAi = async (conditionText: string) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await studioApi.getBiomechanicsAdvice({
        clientCondition: conditionText,
        classFocus: activeClass?.focus || 'Reformer Clásico',
        exerciseName: 'Secuencia Reformer Footwork & Abdominal Series',
      });
      setAiResult(res.adaptation);
    } catch (err: any) {
      setAiResult({
        condition: conditionText,
        recommendedSprings: '1 Rojo + 1 Azul (Moderado)',
        headrestPosition: 'Posición media (2do tope) para alineación neutra',
        contraindications: ['Evitar flexión forzada', 'Evitar impactos'],
        suggestedModifications:
          'Mantener columna neutra, activar suelo pélvico antes del empuje. Reducir rango en el carruaje.',
        instructorCue: 'Exhala en la resistencia y alinea la coronilla con el sacro.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#1A1815] text-[#FAF8F5] p-6 overflow-y-auto' : ''}`}>
      {/* Top Banner for Instructor */}
      <div
        className={`rounded-2xl p-6 shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isFullscreen
            ? 'bg-[#24201C] border-[#3A332C] text-[#FAF8F5]'
            : 'bg-[#FAF8F5] border-[#E4DED4] text-[#1A1815]'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#B5654A] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B5654A]/20 text-[#B5654A] uppercase tracking-wider">
                Modo Tablet en Sala
              </span>
              <span className="text-xs text-[#8C8479]">
                • Instructora: <strong>{activeClass?.instructor || 'Por asignar'}</strong>
              </span>
            </div>
            <h2 className="font-fraunces text-2xl font-medium mt-0.5">
              Control de Sala Reformer: {activeClass?.name || 'Sesión en turno'}
            </h2>
            <p className="text-xs text-[#8C8479]">
              Visualizador de 8 camas, historial de patologías/lesiones y asistencia en tiempo real.
            </p>
          </div>
        </div>

        {/* Stopwatch & Action Bar */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Class Timer widget */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono ${
              isFullscreen
                ? 'bg-[#1A1815] border-[#3A332C] text-emerald-400'
                : 'bg-[#FAF8F5] border-[#DDD5C9] text-emerald-700'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-lg font-bold tracking-wider">{formatTimer(timerSeconds)}</span>
            <div className="flex items-center gap-1 ml-1 border-l border-zinc-300 dark:border-zinc-700 pl-2">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 hover:text-emerald-500 cursor-pointer"
                title={isTimerRunning ? 'Pausar' : 'Iniciar'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(50 * 60);
                }}
                className="p-1 hover:text-zinc-500 cursor-pointer"
                title="Reiniciar 50 min"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTimerSeconds((p) => p + 300)}
                className="text-[10px] font-sans px-1.5 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
                title="+5 minutos"
              >
                +5m
              </button>
            </div>
          </div>

          {/* Quick AI Advisor trigger */}
          <button
            type="button"
            onClick={() => {
              setAiConditionQuery('Hernia lumbar L5-S1');
              setAiModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consultar IA Biomecánica</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
              isFullscreen
                ? 'border-[#3A332C] hover:bg-[#3A332C] text-white'
                : 'border-[#DDD5C9] hover:bg-white text-[#1A1815]'
            }`}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa para atril'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Class Switcher & Room Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Class selector */}
        <div
          className={`p-4 rounded-2xl border md:col-span-2 ${
            isFullscreen ? 'bg-[#24201C] border-[#3A332C]' : 'bg-[#FAF8F5] border-[#E4DED4]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8479]">
              Turnos del Día ({selectedDay.toUpperCase()})
            </span>
            <div className="flex gap-1">
              {DAYS_OF_WEEK.slice(0, 5).map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase transition-colors cursor-pointer ${
                    selectedDay === d.key
                      ? 'bg-[#B5654A] text-white'
                      : isFullscreen
                      ? 'bg-[#1A1815] text-[#8C8479] hover:text-white'
                      : 'bg-[#ECE5DD] text-[#6B655C] hover:text-black'
                  }`}
                >
                  {d.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {dayClasses.map((cls) => {
              const isSelected = activeClass ? cls.id === activeClass.id : false;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`px-3 py-2 rounded-xl text-left shrink-0 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#B5654A] bg-[#B5654A]/10 ring-1 ring-[#B5654A]'
                      : isFullscreen
                      ? 'border-[#3A332C] bg-[#1A1815] hover:border-zinc-600'
                      : 'border-[#E4DED4] bg-white hover:border-[#DDD5C9]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{cls.time}</div>
                  <div className="text-[11px] font-semibold truncate max-w-[130px]">{cls.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Headcount Stat */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isFullscreen ? 'bg-[#24201C] border-[#3A332C]' : 'bg-[#FAF8F5] border-[#E4DED4]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#8C8479]">
            <span className="font-bold uppercase tracking-wider">Asistencia en Sala</span>
            <Users className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="my-1">
            <div className="text-2xl font-bold font-fraunces text-emerald-600">
              {attendedCount} / {classBookings.length}
            </div>
            <span className="text-[11px] text-[#8C8479]">
              {8 - classBookings.length} camas disponibles en esta sesión
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(attendedCount / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Studio Room Guidance */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isFullscreen ? 'bg-[#24201C] border-[#3A332C]' : 'bg-[#FAF8F5] border-[#E4DED4]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#8C8479]">
            <span className="font-bold uppercase tracking-wider">Ambiente en Sala</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="space-y-1 text-xs mt-1">
            <div className="flex items-center justify-between">
              <span className="text-[#8C8479]">Temperatura:</span>
              <span className="font-semibold text-emerald-600">21°C Óptima</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8C8479]">Música:</span>
              <span className="font-semibold truncate max-w-[110px]">Deep House Zen</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8C8479]">Foco de Clase:</span>
              <span className="font-semibold text-[#B5654A] truncate max-w-[110px]">
                {activeClass?.focus ? activeClass.focus.split(',')[0] : 'Reformer General'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          THE 8 ALLEGRO 2 REFORMERS STAGE (2x4 GRID)
          ========================================================= */}
      <div
        className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
          isFullscreen ? 'bg-[#24201C] border-[#3A332C]' : 'bg-[#FAF8F5] border-[#E4DED4]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-fraunces text-lg font-medium">Disposición de las 8 Camas</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
              Allegro 2 Studio
            </span>
          </div>
          <span className="text-xs text-[#8C8479]">
            Toca "Marcar Presente" para registrar ingreso de cada alumna.
          </span>
        </div>

        {/* 8 Reformer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((bedNum) => {
            const booking = bedMap[bedNum];
            const isOccupied = !!booking;
            const isPresent = booking?.status === 'asistio';
            const hasAlert = !!booking?.medicalAlert;

            return (
              <div
                key={bedNum}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[220px] ${
                  isOccupied
                    ? isPresent
                      ? isFullscreen
                        ? 'bg-emerald-950/20 border-emerald-700/50'
                        : 'bg-emerald-50/70 border-emerald-300'
                      : isFullscreen
                      ? 'bg-[#1A1815] border-[#3A332C]'
                      : 'bg-white border-[#E4DED4]'
                    : isFullscreen
                    ? 'bg-[#1A1815]/50 border-dashed border-[#3A332C]'
                    : 'bg-[#F1ECE5]/60 border-dashed border-[#DDD5C9]'
                }`}
              >
                {/* Bed Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#ECE5DD] text-[#1A1815]">
                      REFORMER #{bedNum}
                    </span>

                    {isOccupied ? (
                      <button
                        type="button"
                        onClick={() => toggleAttendance(booking)}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          isPresent
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-amber-100 text-amber-800 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isPresent ? `Presente (${booking.checkInTime || '✓'})` : 'Por llegar'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#8C8479] font-medium">Libre</span>
                    )}
                  </div>

                  {/* Bed Content */}
                  {isOccupied ? (
                    <div className="space-y-2 mt-2">
                      <div>
                        <h4 className="text-sm font-bold truncate leading-tight">
                          {booking.clientName}
                        </h4>
                        <div className="text-[11px] text-[#8C8479] mt-0.5 flex items-center gap-1.5">
                          <span>{booking.clientPhone}</span>
                          {booking.clientDni && <span>• DNI: {booking.clientDni}</span>}
                        </div>
                      </div>

                      {/* CRITICAL MEDICAL ALERT BADGE IN RED/AMBER */}
                      {hasAlert ? (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                          <div className="flex items-center gap-1 font-bold mb-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="uppercase text-[10px] tracking-wider">Alerta Biomecánica:</span>
                          </div>
                          <p className="text-[11px] leading-snug">{booking.medicalAlert}</p>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] text-[#8C8479]">
                          <span>Sin lesiones registradas. Rango completo seguro.</span>
                        </div>
                      )}

                      {/* Recommended Springs configuration */}
                      <div className="text-[10px] text-[#8C8479] flex items-center justify-between pt-1">
                        <span>Resortes recomendados:</span>
                        <span className="font-semibold text-[#B5654A]">
                          {hasAlert ? '1 Rojo + 1 Azul (Seguro)' : '2 Rojos + 1 Azul'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-[#8C8479]">
                      <p>Esta cama no tiene alumna reservada en este turno.</p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                {isOccupied && (
                  <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAiConditionQuery(booking.medicalAlert || `Postura general para ${booking.clientName}`);
                        setAiModalOpen(true);
                      }}
                      className="text-[11px] text-[#B5654A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Consultar IA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveBedModal({ bedNum, booking })}
                      className="text-[11px] text-[#8C8479] hover:text-black dark:hover:text-white font-medium cursor-pointer"
                    >
                      Ver Ficha
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          MODAL: CONSULTA RÁPIDA IA BIOMECÁNICA EN SALA
          ========================================================= */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#B5654A]/10 text-[#B5654A]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg font-bold text-[#1A1815]">
                    Asistente Biomecánico en Sala
                  </h3>
                  <p className="text-[11px] text-[#6B655C]">
                    Recomendaciones instantáneas de resortes y contraindicaciones para Pilates Reformer
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick condition chips */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                  Condición, Lesión o Diagnóstico de la Alumna:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiConditionQuery}
                    onChange={(e) => setAiConditionQuery(e.target.value)}
                    placeholder="Ej. Hernia discal L4-L5, Menisco, Embarazo 2do T..."
                    className="flex-1 px-3.5 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-xs font-medium text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                  />
                  <button
                    type="button"
                    onClick={() => handleConsultAi(aiConditionQuery)}
                    disabled={aiLoading || !aiConditionQuery.trim()}
                    className="px-4 py-2.5 bg-[#B5654A] hover:bg-[#9A5340] disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer shrink-0 shadow-xs"
                  >
                    {aiLoading ? 'Analizando...' : 'Consultar'}
                  </button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Hernia L4-L5',
                  'Cirugía de Menisco',
                  'Gestación semana 18',
                  'Tensión cervical',
                  'Hiperlordosis',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setAiConditionQuery(chip);
                      handleConsultAi(chip);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-md bg-[#ECE5DD] hover:bg-[#DDD5C9] text-[#1A1815] transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* AI Result Card */}
              {aiResult && (
                <div className="p-4 rounded-2xl bg-white border border-[#E4DED4] shadow-xs space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                    <span className="text-xs font-bold text-[#B5654A]">
                      Adaptación para: {aiResult.condition}
                    </span>
                    <span className="text-[10px] font-mono text-[#8C8479]">FIRME Biomechanics Engine</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                      <span className="text-[10px] font-bold text-amber-900 block uppercase">
                        Configuración de Resortes
                      </span>
                      <span className="font-semibold text-[#1A1815]">{aiResult.recommendedSprings}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/60">
                      <span className="text-[10px] font-bold text-blue-900 block uppercase">
                        Posición del Cabecero
                      </span>
                      <span className="font-semibold text-[#1A1815]">{aiResult.headrestPosition}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                      Contraindicaciones en Sala:
                    </span>
                    <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                      {aiResult.contraindications?.map((c: string, idx: number) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  {aiResult.instructorCue && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">
                        Instrucción Verbal Sugerida a la Alumna:
                      </span>
                      <p className="italic text-emerald-900">"{aiResult.instructorCue}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#DDD5C9] text-right">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A1815] text-[#FAF8F5] text-xs font-semibold hover:bg-black cursor-pointer"
              >
                Cerrar Consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: DETALLES DE CAMA Y ALUMNA
          ========================================================= */}
      {activeBedModal && activeBedModal.booking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-fraunces text-lg font-bold text-[#1A1815]">
                Ficha de Cama #{activeBedModal.bedNum}
              </h3>
              <button
                type="button"
                onClick={() => setActiveBedModal(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#E4DED4]">
                <div className="text-sm font-bold text-[#1A1815]">{activeBedModal.booking.clientName}</div>
                <div className="text-[#6B655C] mt-0.5">
                  Tel: {activeBedModal.booking.clientPhone} • {activeBedModal.booking.clientEmail}
                </div>
                {activeBedModal.booking.clientDni && (
                  <div className="font-mono text-[11px] text-[#8C8479]">DNI: {activeBedModal.booking.clientDni}</div>
                )}
              </div>

              {activeBedModal.booking.medicalAlert && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  <div className="font-bold flex items-center gap-1 mb-1 text-rose-900">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Observación Clínica:</span>
                  </div>
                  <p>{activeBedModal.booking.medicalAlert}</p>
                </div>
              )}

              <div className="p-3 bg-[#F1ECE5] rounded-xl text-[#1A1815] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#8C8479]">Clase:</span>
                  <span className="font-semibold">{activeBedModal.booking.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C8479]">Hora:</span>
                  <span className="font-semibold">{activeBedModal.booking.classTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C8479]">Estado:</span>
                  <span className="font-semibold text-emerald-700 uppercase">
                    {activeBedModal.booking.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#DDD5C9] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveBedModal(null)}
                className="px-4 py-2 rounded-xl bg-[#B5654A] text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
