import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Search,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  QrCode,
  Printer,
  X,
  AlertCircle,
  HelpCircle,
  Hash,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ClassSession, BookingRecord, ClientProfile, DayOfWeek } from '../../types';
import { DAYS_OF_WEEK } from '../../data/mockData';
import { studioApi } from '../../services/api';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminKioskTabProps {
  classes: ClassSession[];
  bookings: BookingRecord[];
  clients: ClientProfile[];
  onCheckInSuccess?: (updatedBooking: BookingRecord) => void;
  onAssignBed?: (bookingId: string, bedNumber: number) => void;
}

export const AdminKioskTab: React.FC<AdminKioskTabProps> = ({
  classes,
  bookings,
  clients,
  onCheckInSuccess,
  onAssignBed,
}) => {
  const [isFullscreenKiosk, setIsFullscreenKiosk] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lun');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('lun-1');
  const [selectedBedForAssignment, setSelectedBedForAssignment] = useState<number | null>(null);
  const [selectedBookingToAssign, setSelectedBookingToAssign] = useState<BookingRecord | null>(null);
  const [activeCheckInPass, setActiveCheckInPass] = useState<BookingRecord | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInClientDni, setWalkInClientDni] = useState('');

  // Suscripción en tiempo real a Supabase (WebSockets)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const unsubscribe = supabaseService.subscribeToBookings(({ newRecord }) => {
      if (newRecord) {
        if (onCheckInSuccess) {
          onCheckInSuccess(newRecord);
        }
        if (newRecord.status === 'asistio') {
          setFeedbackMessage(`⚡ Supabase Live: ${newRecord.clientName} marcó check-in en Cama #${newRecord.bedNumber || 'Asignada'}`);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onCheckInSuccess]);

  // Classes for the active day
  const dayClasses = useMemo(() => {
    return classes.filter((c) => c.day === selectedDay);
  }, [classes, selectedDay]);

  // Active class session
  const activeClass = useMemo(() => {
    const found = classes.find((c) => c.id === selectedClassId);
    return found || dayClasses[0] || classes[0];
  }, [classes, selectedClassId, dayClasses]);

  // Bookings belonging to the selected class
  const classBookings = useMemo(() => {
    if (!activeClass) return [];
    return bookings.filter((b) => b.classId === activeClass.id && b.status !== 'cancelada');
  }, [bookings, activeClass]);

  // Search filtered results (by DNI or client name)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return bookings.filter(
      (b) =>
        b.status !== 'cancelada' &&
        ((b.clientName?.toLowerCase() || '').includes(q) ||
          (b.clientDni && b.clientDni.includes(q)) ||
          (b.clientPhone && b.clientPhone.includes(q)))
    );
  }, [bookings, searchQuery]);

  // Map of Bed 1..8 with assigned booking
  const bedMap = useMemo(() => {
    const map: { [bedNum: number]: BookingRecord | undefined } = {};
    for (let i = 1; i <= 8; i++) {
      map[i] = classBookings.find((b) => b.bedNumber === i);
    }
    return map;
  }, [classBookings]);

  // Bookings without a bed yet
  const unassignedBookings = useMemo(() => {
    return classBookings.filter((b) => !b.bedNumber);
  }, [classBookings]);

  const handleSelectBed = (bedNum: number) => {
    const occupant = bedMap[bedNum];
    if (occupant) {
      // If bed is already occupied, select it to view details or check in
      setSelectedBookingToAssign(occupant);
    } else {
      // Bed is free!
      setSelectedBedForAssignment(bedNum);
    }
  };

  const handlePerformCheckIn = async (booking: BookingRecord, bedNumber?: number) => {
    try {
      const chosenBed = bedNumber || booking.bedNumber || (selectedBedForAssignment ?? undefined);
      
      // 1. Sincronizar con Supabase si está disponible
      if (chosenBed) {
        supabaseService.assignBed(booking.id, chosenBed).catch(() => {});
      }

      // 2. Probar backend REST
      try {
        const res = await studioApi.checkInBooking(booking.id, chosenBed);
        if (res.data) {
          booking = res.data;
        }
      } catch {
        // Fallback local update
        booking.status = 'asistio';
        booking.checkInTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        if (chosenBed) {
          booking.bedNumber = chosenBed;
        }
      }

      if (onCheckInSuccess) {
        onCheckInSuccess(booking);
      }

      setActiveCheckInPass(booking);
      setFeedbackMessage(`¡Check-in exitoso para ${booking.clientName}! Cama #${booking.bedNumber || 'Asignada'}.`);
      setSelectedBedForAssignment(null);
      setSelectedBookingToAssign(null);
      setSearchQuery('');
    } catch {
      setFeedbackMessage('Ocurrió un error al registrar el check-in. Intenta nuevamente.');
    }
  };

  const handleAssignBedToBooking = async (bookingId: string, bedNumber: number) => {
    try {
      // 1. Sincronizar con Supabase
      supabaseService.assignBed(bookingId, bedNumber).catch(() => {});

      // 2. Sincronizar con backend REST
      try {
        await studioApi.assignBed(bookingId, bedNumber);
      } catch {
        // local fallback
      }
      if (onAssignBed) {
        onAssignBed(bookingId, bedNumber);
      }
      setFeedbackMessage(`Cama Reformer #${bedNumber} asignada correctamente.`);
      setSelectedBedForAssignment(null);
      setSelectedBookingToAssign(null);
    } catch {
      setFeedbackMessage('No se pudo asignar la cama.');
    }
  };

  const handleWalkInCheckIn = () => {
    if (!activeClass) {
      setFeedbackMessage('No hay ninguna sesión de clase disponible en este horario.');
      return;
    }
    const client = clients.find((c) => c.dni === walkInClientDni.trim());
    if (!client) {
      setFeedbackMessage('No se encontró ninguna alumna con ese DNI en la base del estudio.');
      return;
    }

    // Find first empty bed
    let emptyBed = 1;
    for (let i = 1; i <= 8; i++) {
      if (!bedMap[i]) {
        emptyBed = i;
        break;
      }
    }

    const now = new Date();
    const newBooking: BookingRecord = {
      id: `walkin-${Date.now()}`,
      classId: activeClass.id,
      className: activeClass.name,
      classTime: activeClass.time,
      classDay: activeClass.day,
      instructor: activeClass.instructor,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientDni: client.dni,
      status: 'asistio',
      bookedAt: `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
      bedNumber: emptyBed,
      checkInTime: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      medicalAlert: client.medicalNotes,
    };

    if (onCheckInSuccess) {
      onCheckInSuccess(newBooking);
    }
    setActiveCheckInPass(newBooking);
    setIsWalkInOpen(false);
    setWalkInClientDni('');
    setFeedbackMessage(`Check-in express completado para ${client.name} en Cama #${emptyBed}.`);
  };

  return (
    <div className={`space-y-6 ${isFullscreenKiosk ? 'fixed inset-0 z-50 bg-[#FAF8F5] p-6 overflow-y-auto' : ''}`}>
      {/* Top Banner / Controls */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B5654A]/10 text-[#B5654A] uppercase tracking-wider">
              Punto de Recepción Express
            </span>
            <span className="text-xs text-[#8C8479]">• Sede San Juan de Lurigancho</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Realtime Activo</span>
            </span>
          </div>
          <h2 className="font-fraunces text-2xl font-medium text-[#1A1815]">
            Kiosco de Auto-Check-in & Asignación de Camas
          </h2>
          <p className="text-xs text-[#6B655C] mt-1">
            Validación de ingreso para alumnas por DNI, selección táctil de Reformer Allegro 2 y emisión de pase de sala.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsWalkInOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE9DF] border border-[#DDD5C9] text-xs font-semibold text-[#1A1815] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B5654A]" />
            <span>Walk-in / Asistencia Express</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreenKiosk(!isFullscreenKiosk)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              isFullscreenKiosk
                ? 'bg-[#1A1815] text-[#FAF8F5] hover:bg-black'
                : 'bg-[#B5654A] text-white hover:bg-[#9A5340] shadow-sm'
            }`}
          >
            {isFullscreenKiosk ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreenKiosk ? 'Salir de Modo Kiosco' : 'Abrir Modo Kiosco Tablet'}</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Kiosk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Class Picker (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick DNI / Name Search Box */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B655C] mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#B5654A]" />
              <span>Búsqueda Rápida de Alumna</span>
            </h3>
            <p className="text-[11px] text-[#8C8479] mb-3">
              Ingresa el número de DNI (8 dígitos) o el nombre para check-in inmediato.
            </p>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej. 72849102 o María Fernanda..."
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl text-sm font-medium text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A] placeholder:text-zinc-400"
              />
              <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8479]" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick demo DNI pills for easy testing in reception */}
            <div className="mt-3 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-[#8C8479]">DNIs registrados:</span>
              <button
                type="button"
                onClick={() => setSearchQuery('72849102')}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#ECE5DD] hover:bg-[#DDD5C9] text-[#1A1815] transition-colors cursor-pointer"
              >
                72849102 (María)
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('45912830')}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#ECE5DD] hover:bg-[#DDD5C9] text-[#1A1815] transition-colors cursor-pointer"
              >
                45912830 (Rodrigo)
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('74820193')}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#ECE5DD] hover:bg-[#DDD5C9] text-[#1A1815] transition-colors cursor-pointer"
              >
                74820193 (Camila)
              </button>
            </div>

            {/* Search Dropdown / Instant Results */}
            {searchQuery.trim() && (
              <div className="mt-4 pt-4 border-t border-[#E4DED4] space-y-2">
                <div className="text-[11px] font-semibold text-[#6B655C]">
                  {searchResults.length === 0
                    ? 'No se encontraron reservas con ese criterio'
                    : `Resultados encontrados (${searchResults.length})`}
                </div>

                {searchResults.map((result) => {
                  const isChecked = result.status === 'asistio';
                  return (
                    <div
                      key={result.id}
                      className="p-3 rounded-xl border border-[#E4DED4] bg-[#FAF8F5] hover:border-[#B5654A] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-[#1A1815] truncate">
                            {result.clientName}
                          </span>
                          {result.clientDni && (
                            <span className="text-[10px] font-mono bg-[#EFE9DF] px-1.5 py-0.5 rounded-sm text-[#6B655C]">
                              DNI: {result.clientDni}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#6B655C] mt-0.5 flex items-center gap-2">
                          <span>{result.className}</span>
                          <span>•</span>
                          <span className="font-semibold text-[#1A1815]">{result.classTime}</span>
                          <span>•</span>
                          <span className="text-[#B5654A] font-medium">
                            {result.bedNumber ? `Cama #${result.bedNumber}` : 'Sin cama'}
                          </span>
                        </div>
                        {result.medicalAlert && (
                          <div className="mt-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{result.medicalAlert}</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {isChecked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Presente ({result.checkInTime || 'Ingresó'})</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePerformCheckIn(result)}
                            className="px-3 py-1.5 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Check-In</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Day & Class Session Selector */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B655C] mb-2">
                1. Selecciona el Día de Operación
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = selectedDay === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => {
                        setSelectedDay(d.key);
                        const firstClass = classes.find((c) => c.day === d.key);
                        if (firstClass) setSelectedClassId(firstClass.id);
                      }}
                      className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#B5654A] text-white font-bold shadow-xs'
                          : 'bg-[#ECE5DD] hover:bg-[#DDD5C9] text-[#1A1815] text-xs'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold">{d.shortLabel}</div>
                      <div className="text-[11px] font-semibold mt-0.5">{d.dateLabel.split(' ')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B655C] mb-2">
                2. Selecciona la Clase en Turno
              </label>
              <div className="space-y-2">
                {dayClasses.map((cls) => {
                  const isSelected = activeClass?.id === cls.id;
                  const confirmedCount = bookings.filter((b) => b.classId === cls.id && b.status !== 'cancelada').length;
                  const attendedCount = bookings.filter((b) => b.classId === cls.id && b.status === 'asistio').length;

                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#B5654A] bg-[#FAF8F5] ring-2 ring-[#B5654A]/20 shadow-xs'
                          : 'border-[#E4DED4] bg-[#FAF8F5] hover:border-[#DDD5C9]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#1A1815] bg-[#ECE5DD] px-2 py-0.5 rounded-md">
                            {cls.time}
                          </span>
                          <span className="text-xs font-semibold text-[#1A1815]">{cls.name}</span>
                        </div>
                        <div className="text-[11px] text-[#6B655C] mt-1 flex items-center gap-2">
                          <span>Prof. {cls.instructor}</span>
                          <span>•</span>
                          <span>{cls.classType}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-[#1A1815]">
                          {attendedCount} / {confirmedCount} Presentes
                        </div>
                        <span className="text-[10px] text-[#8C8479]">
                          Capacidad: {cls.totalSpots} camas
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unassigned Students Alert */}
            {unassignedBookings.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{unassignedBookings.length} alumna(s) sin cama seleccionada</span>
                </div>
                <div className="text-[11px] text-amber-800 space-y-1">
                  {unassignedBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between">
                      <span className="font-medium">{b.clientName}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBookingToAssign(b)}
                        className="text-[10px] font-semibold text-[#B5654A] underline hover:text-[#9A5340] cursor-pointer"
                      >
                        Asignar cama ahora
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual 8 Allegro Reformer Bed Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-fraunces text-lg font-medium text-[#1A1815] flex items-center gap-2">
                  <span>Sala Reformer Balanced Body</span>
                  <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-[#1A1815] text-[#FAF8F5] font-semibold">
                    8 Camas Allegro 2
                  </span>
                </h3>
                <p className="text-xs text-[#6B655C]">
                  {activeClass ? (
                    <>
                      {activeClass.name} • {activeClass.time} • Instructora: <strong>{activeClass.instructor}</strong>
                    </>
                  ) : (
                    'Selecciona una clase en turno'
                  )}
                </p>
              </div>

              {/* Status legend */}
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600" />
                  <span className="text-[#6B655C]">Presente</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#B5654A] border border-[#9A5340]" />
                  <span className="text-[#6B655C]">Reservada</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ECE5DD] border border-[#DDD5C9]" />
                  <span className="text-[#6B655C]">Libre</span>
                </div>
              </div>
            </div>

            {/* Instruction banner if selecting bed */}
            {selectedBookingToAssign && (
              <div className="mb-4 p-3 bg-[#B5654A]/10 border border-[#B5654A]/30 rounded-xl flex items-center justify-between">
                <div className="text-xs text-[#1A1815]">
                  Seleccionando cama para: <strong>{selectedBookingToAssign.clientName}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBookingToAssign(null)}
                  className="text-xs text-[#B5654A] hover:underline font-medium"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Visual Studio Layout (Mirroring the 8 reformer machines) */}
            <div className="p-4 bg-[#F1ECE5] rounded-xl border border-[#E4DED4]">
              <div className="text-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8479] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E4DED4]">
                  Frente de Sala • Espejos & Atrio de Instructora
                </span>
              </div>

              {/* The 8 beds in a 2x4 layout */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((bedNum) => {
                  const booking = bedMap[bedNum];
                  const isOccupied = !!booking;
                  const isPresent = booking?.status === 'asistio';
                  const isTargeting = selectedBedForAssignment === bedNum;

                  return (
                    <div
                      key={bedNum}
                      onClick={() => {
                        if (selectedBookingToAssign && !isOccupied) {
                          handleAssignBedToBooking(selectedBookingToAssign.id, bedNum);
                        } else {
                          handleSelectBed(bedNum);
                        }
                      }}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] select-none ${
                        isOccupied
                          ? isPresent
                            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-500/10'
                          : isTargeting
                          ? 'bg-[#FAF8F5] border-[#B5654A] ring-2 ring-[#B5654A] shadow-md'
                          : 'bg-[#FAF8F5] border-[#DDD5C9] hover:border-[#B5654A] hover:bg-white shadow-xs'
                      }`}
                    >
                      {/* Bed header */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#1A1815] bg-[#ECE5DD] px-2 py-0.5 rounded-md">
                          Cama #{bedNum}
                        </span>
                        {isOccupied ? (
                          isPresent ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{booking.checkInTime || 'Ingresó'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              Por llegar
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                            Disponible
                          </span>
                        )}
                      </div>

                      {/* Reformer Machine Stylized Representation */}
                      <div className="my-2 py-1.5 px-2 bg-black/5 rounded-lg text-center">
                        <div className="h-1.5 w-full bg-gradient-to-r from-zinc-400 via-zinc-300 to-zinc-400 rounded-full mb-1" />
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">
                          Allegro 2 Reformer
                        </span>
                      </div>

                      {/* Bed occupant info or prompt */}
                      <div className="mt-auto">
                        {isOccupied ? (
                          <div>
                            <div className="text-xs font-bold text-[#1A1815] leading-tight truncate">
                              {booking.clientName}
                            </div>
                            {booking.medicalAlert && (
                              <div className="mt-1 text-[9px] text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-sm truncate flex items-center gap-1">
                                <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{booking.medicalAlert}</span>
                              </div>
                            )}

                            {!isPresent && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePerformCheckIn(booking);
                                }}
                                className="mt-2 w-full py-1 bg-[#B5654A] hover:bg-[#9A5340] text-white text-[10px] font-bold rounded-md transition-colors shadow-2xs"
                              >
                                Marcar Ingreso
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-1">
                            <span className="text-[11px] font-medium text-[#B5654A] hover:underline">
                              + Asignar a Alumna
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom summary bar */}
            <div className="mt-4 pt-4 border-t border-[#E4DED4] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6B655C] gap-2">
              <div className="flex items-center gap-3">
                <span>
                  Ocupadas: <strong>{classBookings.length} de 8</strong>
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">
                  Asistieron: {classBookings.filter((b) => b.status === 'asistio').length}
                </span>
                <span>•</span>
                <span>
                  Disponibles: <strong>{8 - classBookings.length}</strong>
                </span>
              </div>

              <div className="text-[11px] text-[#8C8479]">
                💡 Toca una cama libre para asignarla a una alumna que llegue a recepción.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL: PASE DIGITAL DE SALA FIRME (CHECK-IN SUCCESS)
          ========================================================= */}
      {activeCheckInPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#B5654A] via-[#D49581] to-[#B5654A]" />

            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Check-in Confirmado</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveCheckInPass(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Boarding Pass Header */}
            <div className="text-center pb-4 border-b border-dashed border-[#DDD5C9]">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#DDD5C9] mb-2 p-1">
                <img
                  src="/firme-studio-logo.svg"
                  alt="FIRME STUDIO"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-fraunces text-xl font-bold text-[#1A1815]">FIRME STUDIO</h3>
              <p className="text-[11px] text-[#6B655C] tracking-wide uppercase font-semibold">
                Pase de Entrada a Sala • SJL Lima
              </p>
            </div>

            {/* Boarding Pass Body */}
            <div className="py-4 space-y-3">
              <div className="text-center">
                <span className="text-[10px] text-[#8C8479] uppercase tracking-wider">Alumna</span>
                <div className="text-lg font-bold text-[#1A1815]">{activeCheckInPass.clientName}</div>
                {activeCheckInPass.clientDni && (
                  <span className="text-xs font-mono text-[#6B655C]">DNI: {activeCheckInPass.clientDni}</span>
                )}
              </div>

              {/* Big Bed Announcement */}
              <div className="bg-[#FAF8F5] border-2 border-[#B5654A] rounded-2xl p-4 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5654A]">
                  Tu Cama Asignada
                </span>
                <div className="font-fraunces text-3xl font-bold text-[#1A1815] my-1">
                  REFORMER #{activeCheckInPass.bedNumber || '1'}
                </div>
                <p className="text-[11px] text-[#6B655C]">Balanced Body Allegro 2 con cabecero regulable</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#F1ECE5] p-3 rounded-xl">
                <div>
                  <span className="text-[#8C8479] block text-[10px] uppercase font-semibold">Clase</span>
                  <span className="font-semibold text-[#1A1815]">{activeCheckInPass.className}</span>
                </div>
                <div>
                  <span className="text-[#8C8479] block text-[10px] uppercase font-semibold">Horario</span>
                  <span className="font-semibold text-[#1A1815]">{activeCheckInPass.classTime}</span>
                </div>
                <div>
                  <span className="text-[#8C8479] block text-[10px] uppercase font-semibold">Instructora</span>
                  <span className="font-semibold text-[#1A1815]">{activeCheckInPass.instructor}</span>
                </div>
                <div>
                  <span className="text-[#8C8479] block text-[10px] uppercase font-semibold">Hora de Ingreso</span>
                  <span className="font-semibold text-emerald-700">
                    {activeCheckInPass.checkInTime || '07:25'}
                  </span>
                </div>
              </div>

              {/* Safety Protocol */}
              <div className="p-3 bg-white/60 rounded-xl border border-[#DDD5C9] text-[11px] text-[#6B655C] space-y-1">
                <div className="font-semibold text-[#1A1815] flex items-center gap-1">
                  <span>Recordatorios de Sala:</span>
                </div>
                <p>• Uso obligatorio de calcetines antideslizantes grip en el reformer.</p>
                <p>• Por favor guardar teléfono celular en los casilleros del vestidor.</p>
              </div>

              {/* Aesthetic QR code */}
              <div className="flex items-center justify-center pt-2">
                <div className="p-2 bg-white rounded-xl border border-[#DDD5C9] text-center shadow-xs">
                  <QrCode className="w-16 h-16 text-[#1A1815] mx-auto" />
                  <span className="text-[9px] font-mono text-[#8C8479] block mt-1">
                    FS-{activeCheckInPass.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#DDD5C9] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-[#DDD5C9] hover:bg-white text-xs font-semibold text-[#1A1815] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#6B655C]" />
                <span>Imprimir Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCheckInPass(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer text-center"
              >
                Listo, Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: WALK-IN / ASISTENCIA EXPRESS
          ========================================================= */}
      {isWalkInOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-fraunces text-lg font-bold text-[#1A1815]">
                Asistencia Express / Walk-in
              </h3>
              <button
                type="button"
                onClick={() => setIsWalkInOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B655C] mb-4">
              Para alumnas registradas con membresía o pack que se presentan sin reserva previa y desean ingresar a la clase activa {activeClass ? (
                <strong>de {activeClass.name} ({activeClass.time})</strong>
              ) : (
                'en turno'
              )}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                  DNI de la Alumna
                </label>
                <input
                  type="text"
                  value={walkInClientDni}
                  onChange={(e) => setWalkInClientDni(e.target.value)}
                  placeholder="Introduce 8 dígitos del DNI..."
                  className="w-full px-3 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-sm font-medium text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                />
              </div>

              {/* Client quick list */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-[#8C8479] uppercase tracking-wider block mb-1">
                  O selecciona una alumna con créditos activos:
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {clients
                    .filter((c) => c.status === 'activo')
                    .slice(0, 5)
                    .map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => setWalkInClientDni(client.dni)}
                        className={`w-full p-2 rounded-lg text-left text-xs border transition-all cursor-pointer flex items-center justify-between ${
                          walkInClientDni === client.dni
                            ? 'bg-[#B5654A]/10 border-[#B5654A] font-semibold text-[#B5654A]'
                            : 'bg-white border-[#DDD5C9] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-[#1A1815]">{client.name}</div>
                          <span className="text-[10px] text-[#6B655C]">DNI: {client.dni} • Plan: {client.currentPlan}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                          {client.creditsLeft} créditos
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#DDD5C9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWalkInOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD5C9] text-xs font-semibold text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleWalkInCheckIn}
                  disabled={!walkInClientDni.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] disabled:opacity-50 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Confirmar Asistencia & Asignar Cama
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
