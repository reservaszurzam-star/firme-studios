import React, { useState } from 'react';
import { DAYS_OF_WEEK } from '../data/mockData';
import { ClassSession, DayOfWeek, DifficultyLevel, ClassType } from '../types';
import {
  Clock,
  User,
  Sparkles,
  Check,
  Users,
  SlidersHorizontal,
  RotateCcw,
  Layers,
  Search,
  X,
  Bell,
  BellRing,
} from 'lucide-react';

interface ScheduleCalendarProps {
  classes: ClassSession[];
  bookedClassIds: Set<string>;
  waitlistClassIds: Set<string>;
  alertClassIds?: Set<string>;
  onSelectClassForBooking: (session: ClassSession, type: 'reserve' | 'waitlist') => void;
  onToggleAlert?: (session: ClassSession) => void;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  classes,
  bookedClassIds,
  waitlistClassIds,
  alertClassIds = new Set(),
  onSelectClassForBooking,
  onToggleAlert,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lun');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedType !== 'all' ||
    selectedInstructor !== 'all' ||
    selectedLevel !== 'all';

  const activeFiltersCount =
    (searchQuery.trim() !== '' ? 1 : 0) +
    (selectedType !== 'all' ? 1 : 0) +
    (selectedInstructor !== 'all' ? 1 : 0) +
    (selectedLevel !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedInstructor('all');
    setSelectedLevel('all');
  };

  const filteredClasses = classes.filter((c) => {
    const matchesDay = c.day === selectedDay;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.instructor.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.focus.toLowerCase().includes(q);
    const matchesType =
      selectedType === 'all' || c.classType === selectedType;
    const matchesInstructor =
      selectedInstructor === 'all' || c.instructor === selectedInstructor;
    const matchesLevel =
      selectedLevel === 'all' ||
      c.level.toLowerCase() === selectedLevel.toLowerCase();

    return matchesDay && matchesSearch && matchesType && matchesInstructor && matchesLevel;
  });

  const renderDifficultyBadge = (level: DifficultyLevel) => {
    switch (level) {
      case 'Principiante':
        return (
          <span
            id={`badge-difficulty-${level.toLowerCase()}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#EDF5F0] text-[#245E39] border border-[#C5DEC9]"
            title="Nivel Principiante: fundamentos posturales y ritmo guiado"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D46]" />
            Principiante
          </span>
        );
      case 'Intermedio':
        return (
          <span
            id={`badge-difficulty-${level.toLowerCase()}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FAF2E8] text-[#8C5511] border border-[#ECD1B0]"
            title="Nivel Intermedio: fluidez continua y resistencia del centro"
          >
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8731F]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8731F]" />
            </span>
            Intermedio
          </span>
        );
      case 'Avanzado':
        return (
          <span
            id={`badge-difficulty-${level.toLowerCase()}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FAECE8] text-[#A64028] border border-[#ECC0B4]"
            title="Nivel Avanzado: secuencias complejas, control y alta intensidad"
          >
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B5654A]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B5654A]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B5654A]" />
            </span>
            Avanzado
          </span>
        );
      default:
        return null;
    }
  };

  const renderClassTypeBadge = (classType: ClassType) => {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#1A1815] border border-[#E4DED4]">
        <Layers className="w-3 h-3 text-[#B5654A]" />
        {classType}
      </span>
    );
  };

  return (
    <section
      id="horarios"
      className="w-full bg-[#FAF8F5] py-16 sm:py-20 lg:py-24 border-b border-[#E4DED4]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <span className="text-xs font-medium tracking-widest uppercase text-[#B5654A] block mb-2">
              Horario Semanal
            </span>
            <h2 className="font-fraunces text-2xl sm:text-3xl md:text-4xl text-[#1A1815] tracking-tight">
              Encuentra tu práctica
            </h2>
            <p className="mt-2 text-[#6B655C] text-sm sm:text-base leading-relaxed">
              Grupos reducidos de máximo 8 personas por sesión para garantizar corrección postural constante.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center text-xs text-[#6B655C]">
            <span className="bg-[#F1ECE5] px-3 py-1.5 rounded-md border border-[#E4DED4]">
              {classes.length} clases programadas esta semana
            </span>
          </div>
        </div>

        {/* Day Selector Tabs (Responsive: scrollable on mobile, flex grid on desktop) */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex sm:grid sm:grid-cols-7 gap-2 min-w-[560px] sm:min-w-0">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDay === day.key;
              const count = classes.filter((c) => c.day === day.key).length;

              return (
                <button
                  key={day.key}
                  id={`tab-day-${day.key}`}
                  onClick={() => setSelectedDay(day.key)}
                  className={`flex-1 flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border transition-all duration-200 text-center ${
                    isSelected
                      ? 'bg-[#F1ECE5] border-[#B5654A] text-[#1A1815] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E4DED4] text-[#6B655C] hover:bg-[#F1ECE5]/60 hover:text-[#1A1815]'
                  }`}
                  aria-selected={isSelected}
                  role="tab"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider block">
                    {day.shortLabel}
                  </span>
                  <span className="font-fraunces text-lg sm:text-xl font-medium text-[#1A1815] my-0.5">
                    {day.dateLabel.split(' ')[0]}
                  </span>
                  <span className="text-[11px] text-[#6B655C]">
                    {count} {count === 1 ? 'clase' : 'clases'}
                  </span>
                  
                  {isSelected && (
                    <div className="w-6 h-[2px] bg-[#B5654A] mt-1.5 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Bar */}
        <div
          id="schedule-filter-bar"
          className="mb-8 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg p-4 sm:p-5 shadow-xs"
        >
          {/* Header row with count and reset */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#E4DED4]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#B5654A]" />
              <span className="font-fraunces text-sm sm:text-base font-medium text-[#1A1815]">
                Filtros de horario
              </span>
              {hasActiveFilters && (
                <span className="text-[11px] bg-[#B5654A]/10 text-[#B5654A] font-medium px-2 py-0.5 rounded-full border border-[#B5654A]/20">
                  {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Beginner Toggle Button */}
              <button
                type="button"
                id="btn-quick-beginner-filter"
                onClick={() => setSelectedLevel(selectedLevel === 'Principiante' ? 'all' : 'Principiante')}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  selectedLevel === 'Principiante'
                    ? 'bg-[#2E7D46] text-white border border-[#2E7D46] ring-2 ring-[#2E7D46]/20'
                    : 'bg-[#EDF5F0] text-[#245E39] border border-[#C5DEC9] hover:bg-[#d8edd9]'
                }`}
                title="Filtrar clases ideales para tu primera vez o reinicio de práctica"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedLevel === 'Principiante' ? 'bg-white' : 'bg-[#2E7D46]'}`} />
                <span>Principiantes</span>
              </button>

              <span className="text-xs text-[#6B655C] hidden sm:inline">
                {filteredClasses.length} {filteredClasses.length === 1 ? 'sesión' : 'sesiones'}
              </span>

              {hasActiveFilters && (
                <button
                  id="btn-clear-filters"
                  onClick={handleResetFilters}
                  className="inline-flex items-center text-xs font-medium text-[#B5654A] hover:text-[#9A5340] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Limpiar filtros</span>
                  <span className="sm:hidden">Limpiar</span>
                </button>
              )}

              {/* Mobile Collapsible Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E4DED4] text-xs font-semibold text-[#1A1815] cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#B5654A]" />
                <span>{mobileFiltersOpen ? 'Cerrar' : 'Buscar'}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Filter Body */}
          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} sm:block animate-in fade-in duration-200`}>
            {/* Search Input for Instructors & Classes */}
            <div className="pt-3.5 pb-3 border-b border-[#E4DED4]">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#6B655C] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                id="search-instructor-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por instructor favorito (Valeria, Mateo, Clara) o nombre de clase..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E4DED4] rounded-lg text-xs sm:text-sm text-[#1A1815] placeholder-[#6B655C]/60 focus:outline-hidden focus:border-[#B5654A] focus:ring-1 focus:ring-[#B5654A] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 text-[#6B655C] hover:text-[#1A1815] rounded-full hover:bg-[#F1ECE5] transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick click suggestions for favorite instructors */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px] text-[#6B655C]">
              <span className="font-medium">Instructores favoritos:</span>
              {['Valeria Soler', 'Mateo Arismendi', 'Clara Domínguez'].map((inst) => {
                const isActive = searchQuery.toLowerCase().includes(inst.toLowerCase());
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        setSearchQuery('');
                      } else {
                        setSearchQuery(inst);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#B5654A] text-[#FAF8F5] border-[#B5654A]'
                        : 'bg-[#FAF8F5] text-[#6B655C] border-[#E4DED4] hover:border-[#B5654A] hover:text-[#1A1815]'
                    }`}
                  >
                    {inst}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3.5 text-xs">
            {/* Filter by Type */}
            <div>
              <span className="block font-medium text-[#6B655C] mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Layers className="w-3.5 h-3.5 text-[#B5654A]" />
                Tipo de clase
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Todos', value: 'all' },
                  { label: 'Reformer', value: 'Reformer' },
                  { label: 'Mat', value: 'Mat' },
                  { label: 'Suspensión', value: 'Suspensión' },
                ].map((item) => (
                  <button
                    key={item.value}
                    id={`filter-type-${item.value.toLowerCase()}`}
                    onClick={() => setSelectedType(item.value)}
                    className={`px-3 py-1.5 rounded-full transition-colors font-medium cursor-pointer ${
                      selectedType === item.value
                        ? 'bg-[#1A1815] text-[#FAF8F5]'
                        : 'bg-[#FAF8F5] text-[#6B655C] hover:text-[#1A1815] border border-[#E4DED4]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Instructor */}
            <div>
              <span className="block font-medium text-[#6B655C] mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <User className="w-3.5 h-3.5 text-[#B5654A]" />
                Instructor
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Todos', value: 'all' },
                  { label: 'Valeria Soler', value: 'Valeria Soler' },
                  { label: 'Mateo Arismendi', value: 'Mateo Arismendi' },
                  { label: 'Clara Domínguez', value: 'Clara Domínguez' },
                ].map((item) => (
                  <button
                    key={item.value}
                    id={`filter-instructor-${item.value.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedInstructor(item.value)}
                    className={`px-3 py-1.5 rounded-full transition-colors font-medium cursor-pointer ${
                      selectedInstructor === item.value
                        ? 'bg-[#1A1815] text-[#FAF8F5]'
                        : 'bg-[#FAF8F5] text-[#6B655C] hover:text-[#1A1815] border border-[#E4DED4]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Difficulty Level */}
            <div>
              <span className="block font-medium text-[#6B655C] mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-[#B5654A]" />
                Nivel de dificultad
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Todos', value: 'all' },
                  { label: 'Principiante', value: 'Principiante' },
                  { label: 'Intermedio', value: 'Intermedio' },
                  { label: 'Avanzado', value: 'Avanzado' },
                ].map((item) => (
                  <button
                    key={item.value}
                    id={`filter-level-${item.value.toLowerCase()}`}
                    onClick={() => setSelectedLevel(item.value)}
                    className={`px-3 py-1.5 rounded-full transition-colors font-medium cursor-pointer ${
                      selectedLevel === item.value
                        ? 'bg-[#1A1815] text-[#FAF8F5]'
                        : 'bg-[#FAF8F5] text-[#6B655C] hover:text-[#1A1815] border border-[#E4DED4]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Beginner Alert Callout */}
        {selectedLevel === 'Principiante' && (
          <div className="mb-4 bg-[#EDF5F0] border border-[#C5DEC9] rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs text-[#245E39] animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D46] shrink-0" />
              <p>
                <strong>¡Sesiones ideales para tu primera vez!</strong> En estas clases los profesores adaptan la resistencia de los resortes paso a paso y te enseñan la alineación básica antes de cada ejercicio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className="text-xs font-semibold underline text-[#245E39] hover:text-[#184428] shrink-0 cursor-pointer"
            >
              Ver todos los niveles
            </button>
          </div>
        )}

        {/* Classes List */}
        <div className="space-y-4">
          {filteredClasses.length === 0 ? (
            <div className="bg-[#F1ECE5] border border-[#E4DED4] rounded-lg p-10 text-center">
              <Sparkles className="w-8 h-8 text-[#B5654A] mx-auto mb-3" />
              <p className="font-fraunces text-lg text-[#1A1815]">No hay clases con los filtros seleccionados</p>
              <p className="text-xs text-[#6B655C] mt-1 max-w-md mx-auto leading-relaxed">
                Prueba ajustando el tipo de clase, instructor o nivel de dificultad, o explora otros días de la semana.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-[#1A1815] text-[#FAF8F5] text-xs font-medium hover:bg-[#33302B] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Restablecer todos los filtros
              </button>
            </div>
          ) : (
            filteredClasses.map((session) => {
              const spotsLeft = session.totalSpots - session.occupiedSpots;
              const isFull = spotsLeft <= 0;
              const isBooked = bookedClassIds.has(session.id);
              const isWaitlisted = waitlistClassIds.has(session.id);

              return (
                <div
                  key={session.id}
                  id={`class-card-${session.id}`}
                  className="bg-[#FAF8F5] border border-[#E4DED4] rounded-lg p-5 sm:p-6 transition-all duration-200 hover:border-[#B5654A]/40 hover:shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* Class Info Left */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Time Badge */}
                    <div className="flex items-center sm:flex-col sm:justify-center bg-[#F1ECE5] border border-[#E4DED4] px-3.5 py-2 sm:py-3 rounded-md shrink-0 text-left sm:text-center w-fit sm:w-24">
                      <Clock className="w-4 h-4 text-[#B5654A] mr-2 sm:mr-0 sm:mb-1" />
                      <span className="font-fraunces text-base sm:text-lg font-medium text-[#1A1815]">
                        {session.time}
                      </span>
                      <span className="text-[11px] text-[#6B655C] ml-2 sm:ml-0 font-medium">
                        {session.duration}
                      </span>
                    </div>

                    {/* Titles and Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="font-fraunces text-lg sm:text-xl text-[#1A1815] font-medium">
                          {session.name}
                        </h3>
                        {/* Class Type Badge */}
                        {renderClassTypeBadge(session.classType)}
                        {/* Difficulty Level Badge */}
                        {renderDifficultyBadge(session.level)}
                        {/* Alert Active Badge */}
                        {alertClassIds.has(session.id) && (
                          <span
                            id={`badge-alert-${session.id}`}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF2E8] text-[#8C5511] border border-[#ECD1B0] font-medium"
                            title="Aviso automático activado: te notificaremos cuando se libere un cupo"
                          >
                            <BellRing className="w-3 h-3 text-[#B5654A]" />
                            Aviso automático activo
                          </span>
                        )}
                        {/* Full capacity badge */}
                        {isFull && !isBooked && !isWaitlisted && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#9A5340]/10 text-[#9A5340] border border-[#9A5340]/20 font-medium">
                            0 cupos disponibles
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#6B655C] leading-relaxed mb-2 max-w-xl">
                        {session.focus}
                      </p>

                      <div className="flex items-center text-xs text-[#6B655C] space-x-4 mb-3">
                        <span className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1.5 text-[#B5654A]" />
                          Instructor: <strong className="ml-1 text-[#1A1815] font-medium">{session.instructor}</strong>
                        </span>
                        <span className="hidden sm:flex items-center">
                          <Users className="w-3.5 h-3.5 mr-1.5 text-[#B5654A]" />
                          Capacidad total: {session.totalSpots} alumnos
                        </span>
                      </div>

                      {/* Visual Occupancy Progress Bar */}
                      <div
                        id={`progress-bar-container-${session.id}`}
                        className="w-full max-w-sm pt-1"
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-medium text-[#1A1815] flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isFull
                                  ? 'bg-[#A64028]'
                                  : session.occupiedSpots >= session.totalSpots * 0.75
                                  ? 'bg-[#B5654A]'
                                  : 'bg-[#7D8B78]'
                              }`}
                            />
                            {session.occupiedSpots}/{session.totalSpots} lugares reservados
                          </span>
                          <span className="text-[#6B655C] font-mono text-[10px]">
                            {Math.round((session.occupiedSpots / session.totalSpots) * 100)}%
                          </span>
                        </div>

                        {/* Progress Bar Track */}
                        <div
                          className="w-full bg-[#E8E2D8] h-2 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={session.occupiedSpots}
                          aria-valuemin={0}
                          aria-valuemax={session.totalSpots}
                          aria-label={`Ocupación: ${session.occupiedSpots} de ${session.totalSpots} plazas reservadas`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${
                              isFull
                                ? 'bg-[#A64028]'
                                : session.occupiedSpots >= session.totalSpots * 0.75
                                ? 'bg-[#B5654A]'
                                : 'bg-[#7D8B78]'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.round((session.occupiedSpots / session.totalSpots) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Spots Right */}
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 border-[#E4DED4] pt-3 sm:pt-4 lg:pt-0 gap-2.5 sm:gap-3 shrink-0">
                    
                    {/* Spots info text visible right next to / above the button */}
                    <div className="text-xs text-left sm:text-right flex sm:block items-center justify-between">
                      {isBooked ? (
                        <span className="text-emerald-700 font-medium flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1" /> Tienes plaza confirmada
                        </span>
                      ) : isWaitlisted ? (
                        <span className="text-[#B5654A] font-medium flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1" /> En lista de espera
                        </span>
                      ) : isFull ? (
                        <span className="text-[#6B655C] text-[11px]">
                          Sin plazas disponibles
                        </span>
                      ) : (
                        <span className="text-[#1A1815] font-medium">
                          Quedan <strong className="text-[#B5654A]">{spotsLeft}</strong> {spotsLeft === 1 ? 'lugar' : 'lugares'}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    {isBooked ? (
                      <button
                        disabled
                        className="w-full sm:w-auto justify-center bg-[#E4DED4] text-[#6B655C] px-5 py-2.5 rounded-md text-xs sm:text-sm font-medium cursor-default flex items-center space-x-1.5"
                      >
                        <span>Reservado</span>
                        <Check className="w-4 h-4 text-emerald-700" />
                      </button>
                    ) : isWaitlisted ? (
                      <button
                        disabled
                        className="w-full sm:w-auto justify-center bg-[#E4DED4] text-[#6B655C] px-5 py-2.5 rounded-md text-xs sm:text-sm font-medium cursor-default flex items-center space-x-1.5"
                      >
                        <span>En lista de espera</span>
                        <Check className="w-4 h-4 text-[#B5654A]" />
                      </button>
                    ) : isFull ? (
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 items-stretch sm:items-center lg:items-end w-full sm:w-auto">
                        {onToggleAlert && (
                          <button
                            id={`btn-toggle-alert-${session.id}`}
                            type="button"
                            onClick={() => onToggleAlert(session)}
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium transition-colors duration-200 cursor-pointer ${
                              alertClassIds.has(session.id)
                                ? 'bg-[#EDF5F0] text-[#245E39] border border-[#C5DEC9]'
                                : 'bg-[#FAF8F5] text-[#B5654A] hover:bg-[#FAF2E8] border border-[#ECD1B0]'
                            }`}
                            title={
                              alertClassIds.has(session.id)
                                ? 'Aviso automático activado. Clic para desactivar'
                                : 'Recibir aviso automático si se libera un cupo en esta sesión'
                            }
                          >
                            {alertClassIds.has(session.id) ? (
                              <>
                                <BellRing className="w-3.5 h-3.5 text-[#2E7D46]" />
                                <span>Aviso activo</span>
                              </>
                            ) : (
                              <>
                                <Bell className="w-3.5 h-3.5 text-[#B5654A]" />
                                <span>Avisarme si hay cupo</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          id={`btn-waitlist-${session.id}`}
                          onClick={() => onSelectClassForBooking(session, 'waitlist')}
                          className="w-full sm:w-auto text-center justify-center border border-[#B5654A] text-[#B5654A] hover:bg-[#B5654A] hover:text-[#FAF8F5] px-4 sm:px-5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer"
                        >
                          Unirme a lista de espera
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-reserve-${session.id}`}
                        onClick={() => onSelectClassForBooking(session, 'reserve')}
                        className="w-full sm:w-auto text-center justify-center bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-5 sm:px-6 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 shadow-xs"
                      >
                        Reservar
                      </button>
                    )}

                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Cancellation Reminder Footer */}
        <div className="mt-8 text-center text-xs text-[#6B655C] flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>• Cancelación sin cargo hasta 12h antes</span>
          <span>• Calcetines antideslizantes obligatorios</span>
          <span>• Máximo 8 plazas por sala</span>
        </div>

      </div>
    </section>
  );
};
