import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Check,
  X,
  Plus,
  Lock,
  Unlock,
  Trash2,
  Phone,
  MessageCircle,
  Sparkles,
  AlertCircle,
  Layers,
  UserCheck,
  ChevronRight,
  Filter,
  Pencil,
} from 'lucide-react';
import {
  ClassSession,
  BookingRecord,
  DayOfWeek,
  ClientProfile,
} from '../../types';

interface AdminAgendaTabProps {
  classes: ClassSession[];
  bookings: BookingRecord[];
  clients: ClientProfile[];
  onAddClass: (newClass: Omit<ClassSession, 'id'>) => void;
  onUpdateClass: (updatedClass: ClassSession) => void;
  onDeleteClass: (classId: string) => void;
  onUpdateSpots: (classId: string, delta: number) => void;
  onAddManualBooking: (booking: Omit<BookingRecord, 'id' | 'bookedAt'>) => void;
  onUpdateBookingStatus: (bookingId: string, status: 'confirmada' | 'asistio' | 'cancelada') => void;
}

const DAY_LABELS: Record<DayOfWeek, { short: string; full: string }> = {
  lun: { short: 'Lun', full: 'Lunes' },
  mar: { short: 'Mar', full: 'Martes' },
  mie: { short: 'Mié', full: 'Miércoles' },
  jue: { short: 'Jue', full: 'Jueves' },
  vie: { short: 'Vie', full: 'Viernes' },
  sab: { short: 'Sáb', full: 'Sábado' },
  dom: { short: 'Dom', full: 'Domingo' },
};

const DAY_KEYS: DayOfWeek[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

export const AdminAgendaTab: React.FC<AdminAgendaTabProps> = ({
  classes,
  bookings,
  clients,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onUpdateSpots,
  onAddManualBooking,
  onUpdateBookingStatus,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lun');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Modals state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);

  // Edit Class Form State
  const [editClassForm, setEditClassForm] = useState<{
    name: string;
    classType: 'Reformer' | 'Mat' | 'Suspensión';
    day: DayOfWeek;
    time: string;
    duration: string;
    instructor: string;
    level: 'Multinivel' | 'Principiante' | 'Intermedio / Avanzado';
    totalSpots: number;
    description: string;
  }>({
    name: '',
    classType: 'Reformer',
    day: 'lun',
    time: '07:00',
    duration: '50 min',
    instructor: '',
    level: 'Multinivel',
    totalSpots: 8,
    description: '',
  });

  const handleStartEditClass = (cls: ClassSession) => {
    setEditingClass(cls);
    setEditClassForm({
      name: cls.name,
      classType: cls.classType,
      day: cls.day,
      time: cls.time,
      duration: cls.duration,
      instructor: cls.instructor,
      level: cls.level as any,
      totalSpots: cls.totalSpots,
      description: cls.description || '',
    });
  };

  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassForm.name.trim()) return;

    onUpdateClass({
      ...editingClass,
      name: editClassForm.name.trim(),
      classType: editClassForm.classType,
      day: editClassForm.day,
      time: editClassForm.time,
      duration: editClassForm.duration,
      instructor: editClassForm.instructor.trim() || 'Instructor Certificado',
      level: editClassForm.level,
      totalSpots: Number(editClassForm.totalSpots) || 8,
      description: editClassForm.description.trim(),
    });

    setEditingClass(null);
  };

  // New Class Form State
  const [newClassForm, setNewClassForm] = useState({
    name: 'Reformer Flow & Alignment',
    classType: 'Reformer' as 'Reformer' | 'Mat' | 'Suspensión',
    day: 'lun' as DayOfWeek,
    time: '07:00',
    duration: '50 min',
    instructor: 'Camila Valdivia',
    level: 'Multinivel' as 'Multinivel' | 'Principiante' | 'Intermedio / Avanzado',
    totalSpots: 8,
    description: 'Secuencia dinámica y controlada en Reformer Allegro 2 para tonificación y postura.',
  });

  // Manual Enrollment Form State
  const [enrollForm, setEnrollForm] = useState({
    selectedClientId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    bedNumber: 1,
    markAttended: false,
  });

  // Filter classes for selected day and type
  const dayClasses = classes.filter((c) => {
    const matchesDay = c.day === selectedDay;
    const matchesType = typeFilter === 'todos' || c.classType === typeFilter;
    return matchesDay && matchesType;
  });

  // Currently selected class object (default to first of day if none selected)
  const currentClass =
    classes.find((c) => c.id === selectedClassId) || dayClasses[0] || null;

  // Bookings specifically for the currently focused class
  const classBookings = currentClass
    ? bookings.filter((b) => b.classId === currentClass.id && b.status !== 'cancelada')
    : [];

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassForm.name.trim()) return;

    onAddClass({
      name: newClassForm.name.trim(),
      classType: newClassForm.classType,
      day: newClassForm.day,
      time: newClassForm.time,
      duration: newClassForm.duration,
      instructor: newClassForm.instructor,
      level: newClassForm.level,
      totalSpots: Number(newClassForm.totalSpots) || 8,
      occupiedSpots: 0,
      description: newClassForm.description.trim(),
      isLocked: false,
    });

    setSelectedDay(newClassForm.day);
    setShowAddClassModal(false);
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass) return;

    let finalName = enrollForm.clientName.trim();
    let finalPhone = enrollForm.clientPhone.trim() || '+51 999 000 111';
    let finalEmail = enrollForm.clientEmail.trim() || 'presencial@firmestudio.pe';

    if (enrollForm.selectedClientId) {
      const existing = clients.find((c) => c.id === enrollForm.selectedClientId);
      if (existing) {
        finalName = existing.name;
        finalPhone = existing.phone;
        finalEmail = existing.email;
      }
    }

    if (!finalName) return;

    onAddManualBooking({
      classId: currentClass.id,
      className: currentClass.name,
      classTime: currentClass.time,
      classDay: currentClass.day,
      instructor: currentClass.instructor,
      clientName: finalName,
      clientEmail: finalEmail,
      clientPhone: finalPhone,
      status: enrollForm.markAttended ? 'asistio' : 'confirmada',
      bedNumber: Number(enrollForm.bedNumber) || Math.min(8, classBookings.length + 1),
    });

    onUpdateSpots(currentClass.id, 1);

    setEnrollForm({
      selectedClientId: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      bedNumber: 1,
      markAttended: false,
    });
    setShowEnrollModal(false);
  };

  const handleToggleLockClass = (cls: ClassSession) => {
    onUpdateClass({
      ...cls,
      isLocked: !cls.isLocked,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B5654A] bg-[#B5654A]/10 px-2.5 py-0.5 rounded-full">
              Sede SJL · Allegro 2
            </span>
            <span className="text-xs text-[#6B655C]">Capacidad: 8 camas</span>
          </div>
          <h2 className="font-fraunces text-xl sm:text-2xl font-semibold text-[#1A1815] mt-1">
            Agenda & Control de Sesiones
          </h2>
          <p className="text-xs text-[#6B655C] mt-0.5">
            Gestiona la programación diaria, asignación de camas y registro de asistencia en recepción.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setShowAddClassModal(true)}
            className="bg-[#B5654A] hover:bg-[#9A5340] text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Programar Nueva Clase</span>
          </button>
        </div>
      </div>

      {/* Days of week selector tabs */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] p-2 rounded-2xl shadow-xs flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {(['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] as DayOfWeek[]).map((d) => {
            const countForDay = classes.filter((c) => c.day === d).length;
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setSelectedDay(d);
                  setSelectedClassId(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#1A1815] text-[#FAF8F5] shadow-sm'
                    : 'bg-[#F1ECE5] text-[#6B655C] hover:text-[#1A1815] hover:bg-[#E4DED4]'
                }`}
              >
                <span>{DAY_LABELS[d].full}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-[#B5654A] text-white' : 'bg-[#E4DED4] text-[#6B655C]'
                  }`}
                >
                  {countForDay}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter by type */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2 border-l border-[#E4DED4]">
          <Filter className="w-3.5 h-3.5 text-[#6B655C]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#FAF8F5] border border-[#E4DED4] rounded-lg text-xs px-2.5 py-1.5 text-[#1A1815] focus:outline-hidden focus:ring-1 focus:ring-[#B5654A]"
          >
            <option value="todos">Todas las disciplinas</option>
            <option value="Reformer">Reformer Allegro 2</option>
            <option value="Mat">Mat Pilates</option>
            <option value="Suspensión">Suspensión TRX</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left Timeline list, Right Session Detail & Bed Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column (5 cols): Sessions of the Day */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B655C]">
              Sesiones del {DAY_LABELS[selectedDay].full} ({dayClasses.length})
            </span>
            <span className="text-[11px] text-[#B5654A] font-medium">
              Click para ver camas
            </span>
          </div>

          {dayClasses.length === 0 ? (
            <div className="bg-[#FAF8F5] border border-dashed border-[#E4DED4] rounded-2xl p-8 text-center text-xs text-[#6B655C] space-y-3">
              <Calendar className="w-8 h-8 text-[#B5654A]/40 mx-auto" />
              <p>No hay sesiones programadas para este día con los filtros activos.</p>
              <button
                type="button"
                onClick={() => {
                  setNewClassForm({ ...newClassForm, day: selectedDay });
                  setShowAddClassModal(true);
                }}
                className="px-3.5 py-1.5 bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#B5654A]" />
                <span>Agregar clase para {DAY_LABELS[selectedDay].short}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayClasses.map((cls) => {
                const isSelected = currentClass?.id === cls.id;
                const isFull = cls.occupiedSpots >= cls.totalSpots;
                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                      isSelected
                        ? 'bg-[#F6F2EC] border-[#B5654A] shadow-md ring-2 ring-[#B5654A]/30'
                        : 'bg-[#FAF8F5] border-[#E4DED4] hover:bg-[#F6F2EC]/60 hover:border-[#DDD5C9]'
                    } ${cls.isLocked ? 'opacity-75 bg-zinc-50' : ''}`}
                  >
                    {/* Left vertical accent on selected */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B5654A]" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-[#1A1815] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E4DED4]">
                          {cls.time} h
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E4DED4] text-[#6B655C]">
                          {cls.classType}
                        </span>
                        {cls.isLocked && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Bloqueada
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isFull
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : cls.occupiedSpots === 0
                            ? 'bg-zinc-100 text-zinc-600'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {cls.occupiedSpots} / {cls.totalSpots} cupos
                      </span>
                    </div>

                    <h4 className="font-fraunces font-medium text-sm text-[#1A1815] mt-2 group-hover:text-[#B5654A] transition-colors">
                      {cls.name}
                    </h4>
                    
                    <div className="flex items-center justify-between text-[11px] text-[#6B655C] mt-1">
                      <span>Prof. {cls.instructor} · {cls.level}</span>
                      <span>{cls.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column (7 cols): Selected Class Details & Bed Allocation Layout */}
        <div className="lg:col-span-7">
          {currentClass ? (
            <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
              
              {/* Header of focused class */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4DED4]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#B5654A] bg-[#B5654A]/10 px-2.5 py-0.5 rounded-full">
                      {DAY_LABELS[currentClass.day].full} · {currentClass.time} h
                    </span>
                    <span className="text-xs text-[#6B655C] font-mono">({currentClass.duration})</span>
                  </div>
                  <h3 className="font-fraunces text-xl sm:text-2xl font-medium text-[#1A1815] mt-1">
                    {currentClass.name}
                  </h3>
                  <p className="text-xs text-[#6B655C] mt-0.5">
                    Instructor: <strong className="text-[#1A1815]">{currentClass.instructor}</strong> · Nivel: {currentClass.level}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEditClass(currentClass)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F1ECE5] text-[#1A1815] border border-[#DDD5C9] hover:bg-[#E4DED4] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Editar detalles de la sesión"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#B5654A]" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleLockClass(currentClass)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                      currentClass.isLocked
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        : 'bg-[#F1ECE5] text-[#1A1815] border-[#DDD5C9] hover:bg-[#E4DED4]'
                    }`}
                  >
                    {currentClass.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{currentClass.isLocked ? 'Desbloquear' : 'Bloquear'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar definitivamente la sesión de las ${currentClass.time} h?`)) {
                        onDeleteClass(currentClass.id);
                        setSelectedClassId(null);
                      }
                    }}
                    className="p-2 rounded-xl text-xs text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Eliminar sesión"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Reformer Bed Allocation Visual Map (Allegro 2 Beds 1 to 8) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#B5654A]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1815]">
                      Mapa de Camas en Sala (Allegro 2)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#6B655C]">
                    Ocupación: {classBookings.length} de {currentClass.totalSpots} camas
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: currentClass.totalSpots }).map((_, idx) => {
                    const bedNum = idx + 1;
                    const bookingForBed = classBookings[idx];
                    const isOccupied = !!bookingForBed;
                    const hasAttended = bookingForBed?.status === 'asistio';

                    return (
                      <div
                        key={bedNum}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between min-h-[95px] ${
                          hasAttended
                            ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                            : isOccupied
                            ? 'bg-[#FAF8F5] border-[#B5654A] shadow-xs'
                            : 'bg-[#F1ECE5]/40 border-dashed border-[#DDD5C9]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
                            Cama #{bedNum}
                          </span>
                          {hasAttended ? (
                            <span className="p-0.5 rounded-md bg-emerald-600 text-white" title="Asistió">
                              <Check className="w-3 h-3" />
                            </span>
                          ) : isOccupied ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#B5654A]" title="Reservado" />
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono">Libre</span>
                          )}
                        </div>

                        <div className="mt-2">
                          {isOccupied ? (
                            <div>
                              <span className="text-xs font-semibold text-[#1A1815] block truncate">
                                {bookingForBed.clientName}
                              </span>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-[#6B655C]">
                                  {hasAttended ? 'Check-in ✓' : 'Esperando'}
                                </span>
                                {!hasAttended && (
                                  <button
                                    type="button"
                                    onClick={() => onUpdateBookingStatus(bookingForBed.id, 'asistio')}
                                    className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                  >
                                    Marcar
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEnrollForm({
                                  ...enrollForm,
                                  bedNumber: bedNum,
                                });
                                setShowEnrollModal(true);
                              }}
                              className="text-[11px] text-[#B5654A] hover:underline font-medium text-left block"
                            >
                              + Asignar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attendee Roster Table */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#B5654A]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1815]">
                      Lista de Asistencia ({classBookings.length})
                    </h4>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(true)}
                    className="bg-[#B5654A] hover:bg-[#9A5340] text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inscribir en Mostrador</span>
                  </button>
                </div>

                {classBookings.length === 0 ? (
                  <div className="p-8 bg-[#F1ECE5]/30 rounded-2xl border border-[#E4DED4] text-center text-xs text-[#6B655C] space-y-1">
                    <p className="font-medium text-[#1A1815]">No hay alumnos inscritos en esta clase aún.</p>
                    <p className="text-[11px]">Puedes inscribir alumnos manualmente o esperar reservas desde la web pública.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {classBookings.map((b, idx) => (
                      <div
                        key={b.id}
                        className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E4DED4] flex items-center justify-between gap-3 text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-[#1A1815] text-[#FAF8F5] font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                            #{b.bedNumber || idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-[#1A1815] block text-xs">{b.clientName}</span>
                            <div className="flex items-center gap-2 text-[11px] text-[#6B655C]">
                              <span>{b.clientPhone || 'Sin teléfono'}</span>
                              {b.clientPhone && (
                                <a
                                  href={`https://wa.me/${(String(b.clientPhone)).replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `¡Hola ${b.clientName || 'Alumna'}! Te recordamos tu clase de Pilates ${currentClass?.classType || 'Reformer'} hoy a las ${currentClass?.time || ''} h en FIRME STUDIO SJL.`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                                  title="Enviar recordatorio por WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {b.status === 'asistio' ? (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-300 inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-700" /> Check-in listo
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onUpdateBookingStatus(b.id, 'asistio')}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>Marcar Asistencia</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Liberar el cupo de ${b.clientName}?`)) {
                                onUpdateBookingStatus(b.id, 'cancelada');
                                onUpdateSpots(currentClass.id, -1);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Liberar cupo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-12 text-center text-xs text-[#6B655C]">
              Selecciona una clase del horario para ver sus camas y lista de asistencia.
            </div>
          )}
        </div>

      </div>

      {/* =========================================================
          MODAL 1: PROGRAMAR NUEVA CLASE
          ========================================================= */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E4DED4] pb-3">
              <div>
                <h3 className="font-fraunces text-xl font-semibold text-[#1A1815]">
                  Programar Nueva Clase
                </h3>
                <p className="text-xs text-[#6B655C]">
                  Añade un nuevo horario al calendario de la sede San Juan de Lurigancho.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddClassModal(false)}
                className="p-1 text-[#6B655C] hover:text-[#1A1815] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#6B655C] mb-1">Nombre de la Clase *</label>
                  <input
                    type="text"
                    required
                    value={newClassForm.name}
                    onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B655C] mb-1">Disciplina *</label>
                  <select
                    value={newClassForm.classType}
                    onChange={(e) => {
                      const ct = e.target.value as 'Reformer' | 'Mat' | 'Suspensión';
                      setNewClassForm({
                        ...newClassForm,
                        classType: ct,
                        totalSpots: ct === 'Reformer' ? 8 : ct === 'Mat' ? 12 : 8,
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                  >
                    <option value="Reformer">Reformer Allegro 2 (8 camas)</option>
                    <option value="Mat">Mat Pilates (12 lugares)</option>
                    <option value="Suspensión">Suspensión TRX & Core (8 cupos)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B655C] mb-1">Día de la Semana *</label>
                  <select
                    value={newClassForm.day}
                    onChange={(e) => setNewClassForm({ ...newClassForm, day: e.target.value as DayOfWeek })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                  >
                    <option value="lun">Lunes</option>
                    <option value="mar">Martes</option>
                    <option value="mie">Miércoles</option>
                    <option value="jue">Jueves</option>
                    <option value="vie">Viernes</option>
                    <option value="sab">Sábado</option>
                    <option value="dom">Domingo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B655C] mb-1">Horario de Inicio *</label>
                  <input
                    type="time"
                    required
                    value={newClassForm.time}
                    onChange={(e) => setNewClassForm({ ...newClassForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B655C] mb-1">Profesor / Instructor *</label>
                  <select
                    value={newClassForm.instructor}
                    onChange={(e) => setNewClassForm({ ...newClassForm, instructor: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                  >
                    <option value="Camila Valdivia">Camila Valdivia</option>
                    <option value="Mariana Paz">Mariana Paz</option>
                    <option value="Lucía Morales">Lucía Morales</option>
                    <option value="Diego Ramos">Diego Ramos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B655C] mb-1">Nivel</label>
                  <select
                    value={newClassForm.level}
                    onChange={(e) => setNewClassForm({ ...newClassForm, level: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                  >
                    <option value="Multinivel">Multinivel</option>
                    <option value="Principiante">Principiante (Bases & Postura)</option>
                    <option value="Intermedio / Avanzado">Intermedio / Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B655C] mb-1">Duración</label>
                  <input
                    type="text"
                    value={newClassForm.duration}
                    onChange={(e) => setNewClassForm({ ...newClassForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B655C] mb-1">Cupos / Camas Máximas</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newClassForm.totalSpots}
                    onChange={(e) => setNewClassForm({ ...newClassForm, totalSpots: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B655C] mb-1">Descripción del Enfoque</label>
                <textarea
                  rows={2}
                  value={newClassForm.description}
                  onChange={(e) => setNewClassForm({ ...newClassForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-xs text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E4DED4]">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 text-xs text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar y Publicar Horario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: INSCRIBIR EN MOSTRADOR
          ========================================================= */}
      {showEnrollModal && currentClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E4DED4] pb-3">
              <div>
                <h3 className="font-fraunces text-xl font-semibold text-[#1A1815]">
                  Inscribir Alumno en Sala
                </h3>
                <p className="text-xs text-[#6B655C]">
                  {currentClass.name} · {DAY_LABELS[currentClass.day].full} a las {currentClass.time} h
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="p-1 text-[#6B655C] hover:text-[#1A1815] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3 text-xs">
              {/* Option to select existing client */}
              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Seleccionar Alumno Registrado (CRM)</label>
                <select
                  value={enrollForm.selectedClientId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const client = clients.find((c) => c.id === id);
                    if (client) {
                      setEnrollForm({
                        ...enrollForm,
                        selectedClientId: id,
                        clientName: client.name,
                        clientPhone: client.phone,
                        clientEmail: client.email,
                      });
                    } else {
                      setEnrollForm({
                        ...enrollForm,
                        selectedClientId: '',
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                >
                  <option value="">-- O escribir alumno nuevo abajo --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.creditsLeft} créditos restantes - {c.currentPlan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={enrollForm.clientName}
                  onChange={(e) => setEnrollForm({ ...enrollForm, clientName: e.target.value })}
                  placeholder="Ej. Valeria Mendoza..."
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-[#6B655C] mb-1">WhatsApp / Celular</label>
                  <input
                    type="text"
                    value={enrollForm.clientPhone}
                    onChange={(e) => setEnrollForm({ ...enrollForm, clientPhone: e.target.value })}
                    placeholder="+51 984 123 456"
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#6B655C] mb-1">Cama Asignada (1 a 8)</label>
                  <select
                    value={enrollForm.bedNumber}
                    onChange={(e) => setEnrollForm({ ...enrollForm, bedNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    {Array.from({ length: currentClass.totalSpots }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Cama #{i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enrollForm.markAttended}
                    onChange={(e) => setEnrollForm({ ...enrollForm, markAttended: e.target.checked })}
                    className="rounded border-[#E4DED4] text-[#B5654A] focus:ring-[#B5654A]"
                  />
                  <span className="text-[#1A1815] font-medium">
                    Marcar Check-in / Asistencia presencial de inmediato
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E4DED4]">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 text-xs text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDITAR SESIÓN / HORARIO */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4DED4] mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#B5654A]/10 text-[#B5654A]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-base font-semibold text-[#1A1815]">
                    Editar Sesión del Horario
                  </h3>
                  <p className="text-xs text-[#6B655C]">
                    Modifica los datos del bloque en vivo en la agenda.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="p-1.5 text-[#6B655C] hover:text-[#1A1815] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">
                  Nombre de la Clase
                </label>
                <input
                  type="text"
                  required
                  value={editClassForm.name}
                  onChange={(e) => setEditClassForm({ ...editClassForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#6B655C] mb-1">
                    Disciplina
                  </label>
                  <select
                    value={editClassForm.classType}
                    onChange={(e) =>
                      setEditClassForm({
                        ...editClassForm,
                        classType: e.target.value as 'Reformer' | 'Mat' | 'Suspensión',
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    <option value="Reformer">Reformer Allegro 2</option>
                    <option value="Mat">Mat Pilates & Core</option>
                    <option value="Suspensión">Pilates en Suspensión</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#6B655C] mb-1">
                    Día de la Semana
                  </label>
                  <select
                    value={editClassForm.day}
                    onChange={(e) => setEditClassForm({ ...editClassForm, day: e.target.value as DayOfWeek })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    {DAY_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {DAY_LABELS[k].full}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#6B655C] mb-1">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={editClassForm.time}
                    onChange={(e) => setEditClassForm({ ...editClassForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#6B655C] mb-1">
                    Duración
                  </label>
                  <input
                    type="text"
                    required
                    value={editClassForm.duration}
                    onChange={(e) => setEditClassForm({ ...editClassForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#6B655C] mb-1">
                    Total Camas / Cupos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    required
                    value={editClassForm.totalSpots}
                    onChange={(e) => setEditClassForm({ ...editClassForm, totalSpots: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#6B655C] mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    required
                    value={editClassForm.instructor}
                    onChange={(e) => setEditClassForm({ ...editClassForm, instructor: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#6B655C] mb-1">
                    Nivel
                  </label>
                  <select
                    value={editClassForm.level}
                    onChange={(e) =>
                      setEditClassForm({
                        ...editClassForm,
                        level: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    <option value="Principiante">Principiante / Fundamentos</option>
                    <option value="Multinivel">Multinivel</option>
                    <option value="Intermedio / Avanzado">Intermedio / Avanzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">
                  Descripción & Enfoque
                </label>
                <textarea
                  rows={2}
                  value={editClassForm.description}
                  onChange={(e) => setEditClassForm({ ...editClassForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E4DED4]">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 text-xs text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
