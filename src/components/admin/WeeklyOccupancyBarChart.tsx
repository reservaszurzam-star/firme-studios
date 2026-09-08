import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Calendar,
  AlertCircle,
  PlusCircle,
  Clock,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { ClassSession, DayOfWeek } from '../../types';

interface WeeklyOccupancyBarChartProps {
  classes: ClassSession[];
  onOpenNewClassModal?: () => void;
  onNavigateToAgenda?: () => void;
}

const DAY_ORDER: DayOfWeek[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

const DAY_CONFIG: Record<DayOfWeek, { short: string; full: string }> = {
  lun: { short: 'Lun', full: 'Lunes' },
  mar: { short: 'Mar', full: 'Martes' },
  mie: { short: 'Mié', full: 'Miércoles' },
  jue: { short: 'Jue', full: 'Jueves' },
  vie: { short: 'Vie', full: 'Viernes' },
  sab: { short: 'Sáb', full: 'Sábado' },
  dom: { short: 'Dom', full: 'Domingo' },
};

interface DayOccupancyData {
  dayKey: DayOfWeek;
  dayShort: string;
  dayFull: string;
  occupancyRate: number;
  totalSpots: number;
  occupiedSpots: number;
  totalSessions: number;
  recommendation: string;
  status: 'alta' | 'optima' | 'moderada' | 'vacia';
}

export const WeeklyOccupancyBarChart: React.FC<WeeklyOccupancyBarChartProps> = ({
  classes,
  onOpenNewClassModal,
  onNavigateToAgenda,
}) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('todas');

  // Compute daily aggregated statistics
  const chartData = useMemo<DayOccupancyData[]>(() => {
    return DAY_ORDER.map((dayKey) => {
      const dayClasses = classes.filter((c) => {
        const matchesDay = c.day === dayKey;
        const matchesDiscipline =
          selectedDiscipline === 'todas' || c.classType === selectedDiscipline;
        return matchesDay && matchesDiscipline;
      });

      const totalSessions = dayClasses.length;
      const totalSpots = dayClasses.reduce((sum, c) => sum + c.totalSpots, 0);
      const occupiedSpots = dayClasses.reduce((sum, c) => sum + c.occupiedSpots, 0);
      const occupancyRate =
        totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

      let recommendation = '';
      let status: 'alta' | 'optima' | 'moderada' | 'vacia' = 'moderada';

      if (totalSessions === 0) {
        status = 'vacia';
        recommendation = 'Día sin programación. Excelente oportunidad para talleres de fin de semana o clases privadas.';
      } else if (occupancyRate >= 80) {
        status = 'alta';
        recommendation = 'Alta demanda (>80%). Capacidad casi al tope: se recomienda aperturar un nuevo turno (ej. 08:00 o 19:00 h).';
      } else if (occupancyRate >= 60) {
        status = 'optima';
        recommendation = 'Aforo equilibrado (60-79%). Capacidad saludable con margen para alumnos en recuperación.';
      } else {
        status = 'moderada';
        recommendation = 'Capacidad libre (>40%). Buen día para canalizar leads con clases de prueba o ajustar horarios matutinos.';
      }

      return {
        dayKey,
        dayShort: DAY_CONFIG[dayKey].short,
        dayFull: DAY_CONFIG[dayKey].full,
        occupancyRate,
        totalSpots,
        occupiedSpots,
        totalSessions,
        recommendation,
        status,
      };
    });
  }, [classes, selectedDiscipline]);

  // Overall statistics for insights
  const overallStats = useMemo(() => {
    const activeDays = chartData.filter((d) => d.totalSessions > 0);
    const totalSpotsWeek = activeDays.reduce((sum, d) => sum + d.totalSpots, 0);
    const totalOccupiedWeek = activeDays.reduce((sum, d) => sum + d.occupiedSpots, 0);
    const weeklyAvgOccupancy =
      totalSpotsWeek > 0 ? Math.round((totalOccupiedWeek / totalSpotsWeek) * 100) : 0;

    // Highest day
    const peakDay = [...activeDays].sort((a, b) => b.occupancyRate - a.occupancyRate)[0] || null;

    // Lowest day with classes
    const lowestDay = [...activeDays].sort((a, b) => a.occupancyRate - b.occupancyRate)[0] || null;

    return {
      weeklyAvgOccupancy,
      totalSpotsWeek,
      totalOccupiedWeek,
      peakDay,
      lowestDay,
    };
  }, [chartData]);

  // Dynamic bar colors based on occupancy level
  const getBarColor = (entry: DayOccupancyData) => {
    if (entry.status === 'alta') return '#B5654A'; // Terracotta intenso (alta demanda)
    if (entry.status === 'optima') return '#8C4F3B'; // Terracotta profundo
    if (entry.status === 'moderada') return '#CBB8A6'; // Tono arena suave
    return '#E4DED4'; // Gris neutro sin clases
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Top Header with Title, Discipline Filter & Quick Schedule Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4DED4]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#B5654A]/10 text-[#B5654A]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B5654A]">
              Optimización de Capacidad · SJL
            </span>
          </div>
          <h3 className="font-fraunces text-lg sm:text-xl font-medium text-[#1A1815] mt-1">
            Ocupación Promedio por Día de la Semana
          </h3>
          <p className="text-xs text-[#6B655C] mt-0.5">
            Analiza el aforo porcentual de camas para identificar cuellos de botella y tomar decisiones sobre apertura de nuevos horarios.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Filter by Discipline */}
          <div className="flex items-center gap-1.5 bg-[#F1ECE5] p-1 rounded-xl border border-[#DDD5C9]">
            <Layers className="w-3.5 h-3.5 text-[#6B655C] ml-1.5" />
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#1A1815] pr-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="todas">Todas las disciplinas</option>
              <option value="Reformer">Reformer Allegro 2</option>
              <option value="Mat">Mat Pilates</option>
              <option value="Suspensión">Suspensión TRX</option>
            </select>
          </div>

          {onOpenNewClassModal && (
            <button
              type="button"
              onClick={onOpenNewClassModal}
              className="bg-[#1A1815] hover:bg-black text-[#FAF8F5] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#B5654A]" />
              <span>Abrir Nuevo Horario</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards: Weekly Snapshot & Schedule Optimization Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#F1ECE5]/50 border border-[#E4DED4] p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-[#6B655C]">
            <span>Promedio Semanal</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#B5654A]" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A1815] font-fraunces">
              {overallStats.weeklyAvgOccupancy}%
            </span>
            <span className="text-[11px] text-[#6B655C]">
              ({overallStats.totalOccupiedWeek} de {overallStats.totalSpotsWeek} cupos)
            </span>
          </div>
          <p className="text-[10px] text-[#6B655C] mt-1">
            Meta del estudio: <strong>80%</strong> para rentabilidad óptima.
          </p>
        </div>

        <div className="bg-[#F1ECE5]/50 border border-[#E4DED4] p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-[#6B655C]">
            <span>Día de Mayor Saturación</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5654A] bg-[#B5654A]/10 px-2 py-0.5 rounded-full">
              Pico
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A1815] font-fraunces">
              {overallStats.peakDay?.dayFull || 'N/A'}
            </span>
            <span className="text-xs font-semibold text-[#B5654A]">
              {overallStats.peakDay?.occupancyRate}% aforo
            </span>
          </div>
          <p className="text-[10px] text-[#6B655C] mt-1">
            {overallStats.peakDay?.totalSessions} sesiones programadas ({overallStats.peakDay?.occupiedSpots}/{overallStats.peakDay?.totalSpots} camas ocupadas).
          </p>
        </div>

        <div className="bg-[#F1ECE5]/50 border border-[#E4DED4] p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-[#6B655C]">
            <span>Oportunidad de Crecimiento</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A1815] font-fraunces">
              {overallStats.lowestDay?.dayFull || 'N/A'}
            </span>
            <span className="text-xs font-semibold text-[#6B655C]">
              {overallStats.lowestDay?.occupancyRate}% aforo
            </span>
          </div>
          <p className="text-[10px] text-[#6B655C] mt-1">
            Día con mayor margen libre ({overallStats.lowestDay ? overallStats.lowestDay.totalSpots - overallStats.lowestDay.occupiedSpots : 0} camas disponibles).
          </p>
        </div>
      </div>

      {/* Main Recharts Bar Chart Container */}
      <div className="pt-2">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E4DED4"
              />
              <XAxis
                dataKey="dayShort"
                stroke="#6B655C"
                tick={{ fill: '#6B655C', fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#E4DED4' }}
              />
              <YAxis
                unit="%"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                stroke="#6B655C"
                tick={{ fill: '#6B655C', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              {/* Reference line at 80% studio optimal capacity target */}
              <ReferenceLine
                y={80}
                stroke="#B5654A"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Objetivo Aforo 80%',
                  fill: '#B5654A',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontWeight: 600,
                }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(181, 101, 74, 0.08)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DayOccupancyData;
                    return (
                      <div className="bg-[#1A1815] text-[#FAF8F5] p-3.5 rounded-xl shadow-xl border border-[#B5654A]/40 text-xs space-y-2 max-w-xs">
                        <div className="flex items-center justify-between border-b border-[#38332E] pb-1.5">
                          <span className="font-fraunces font-bold text-sm text-[#FAF8F5]">
                            {data.dayFull}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              data.status === 'alta'
                                ? 'bg-[#B5654A] text-white'
                                : data.status === 'optima'
                                ? 'bg-amber-700/80 text-white'
                                : 'bg-[#38332E] text-zinc-300'
                            }`}
                          >
                            {data.occupancyRate}% Ocupación
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Camas ocupadas:</span>
                            <strong className="text-white">
                              {data.occupiedSpots} de {data.totalSpots}
                            </strong>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Clases del día:</span>
                            <strong className="text-white">{data.totalSessions} sesiones</strong>
                          </div>
                        </div>

                        <div className="text-[10px] text-zinc-300 pt-1 border-t border-[#38332E] leading-relaxed">
                          <strong className="text-[#B5654A]">Diagnóstico: </strong>
                          {data.recommendation}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="occupancyRate"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.dayKey}`}
                    fill={getBarColor(entry)}
                    className="transition-opacity duration-200 hover:opacity-85"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Color Code */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-[#E4DED4] text-xs text-[#6B655C]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#B5654A]" />
              <span>Alta Demanda (&gt;80%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#8C4F3B]" />
              <span>Aforo Óptimo (60–79%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#CBB8A6]" />
              <span>Capacidad Disponible (&lt;60%)</span>
            </div>
          </div>

          {onNavigateToAgenda && (
            <button
              type="button"
              onClick={onNavigateToAgenda}
              className="text-xs font-semibold text-[#B5654A] hover:text-[#9A5340] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ver agenda semanal detallada</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Strategic Schedule Recommendations Banner */}
      <div className="p-4 bg-[#F1ECE5]/60 border border-[#E4DED4] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#B5654A] text-white shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1815]">
              Estrategia Sugerida para Apertura de Nuevos Horarios
            </h4>
            <p className="text-xs text-[#6B655C] mt-0.5 leading-relaxed">
              {overallStats.peakDay && overallStats.peakDay.occupancyRate >= 80 ? (
                <>
                  Los días <strong className="text-[#1A1815]">{overallStats.peakDay.dayFull}</strong> registran una tasa de ocupación del{' '}
                  <strong className="text-[#B5654A]">{overallStats.peakDay.occupancyRate}%</strong> en sala. Abrir un nuevo bloque a las <strong>08:00 h</strong> o <strong>19:00 h</strong> permitirá captar hasta 8 nuevos cupos sin saturar las camas Allegro 2 existentes.
                </>
              ) : (
                <>
                  El aforo semanal se encuentra balanceado al <strong>{overallStats.weeklyAvgOccupancy}%</strong>. Te sugerimos reforzar la captación en los días con mayor disponibilidad ({overallStats.lowestDay?.dayFull || 'sábados'}).
                </>
              )}
            </p>
          </div>
        </div>

        {onOpenNewClassModal && (
          <button
            type="button"
            onClick={onOpenNewClassModal}
            className="shrink-0 bg-[#B5654A] hover:bg-[#9A5340] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Programar Turno</span>
          </button>
        )}
      </div>
    </div>
  );
};
