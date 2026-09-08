import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  Database,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Code2,
  Layers,
  Terminal,
  Activity,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { studioApi, HealthResponse } from '../../services/api';

export const AdminBackendTab: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // AI Insights state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    summary: string;
    recommendations: string[];
    retentionTip: string;
    projectedRevenue?: string;
  } | null>(null);

  // AI Biomechanics state
  const [selectedCondition, setSelectedCondition] = useState('Hernia discal L4-L5 leve');
  const [selectedFocus, setSelectedFocus] = useState('Reformer Clásico');
  const [selectedExercise, setSelectedExercise] = useState('Footwork y The Hundred');
  const [biomechanicsLoading, setBiomechanicsLoading] = useState(false);
  const [biomechanicsResult, setBiomechanicsResult] = useState<{
    condition: string;
    recommendedSprings: string;
    headrestPosition: string;
    contraindications: string[];
    suggestedModifications: string;
    instructorCue?: string;
  } | null>(null);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const data = await studioApi.getHealth();
      setHealth(data);
    } catch (err: any) {
      setHealthError(err.message || 'No se pudo conectar con el backend');
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRunAiInsights = async () => {
    setAiLoading(true);
    try {
      const res = await studioApi.getStudioInsights();
      if (res.success && res.insights) {
        setAiInsights(res.insights);
      }
    } catch (err: any) {
      alert('Error al consultar insights de IA: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRunBiomechanics = async () => {
    setBiomechanicsLoading(true);
    try {
      const res = await studioApi.getBiomechanicsAdvice({
        clientCondition: selectedCondition,
        classFocus: selectedFocus,
        exerciseName: selectedExercise,
      });
      if (res.success && res.adaptation) {
        setBiomechanicsResult(res.adaptation);
      }
    } catch (err: any) {
      alert('Error al consultar asesor biomecánico: ' + err.message);
    } finally {
      setBiomechanicsLoading(false);
    }
  };

  const ENDPOINTS_CATALOG = [
    { method: 'GET', path: '/api/health', desc: 'Diagnóstico general, métricas y estado del servidor' },
    { method: 'GET / POST', path: '/api/classes', desc: 'Gestión de agenda semanal, cupos de Reformer (8 camas)' },
    { method: 'GET / POST', path: '/api/bookings', desc: 'Motor de reservas de alumnas y lista de espera' },
    { method: 'GET / POST', path: '/api/clients', desc: 'CRM de alumnas, créditos activos y notas médicas' },
    { method: 'GET / POST', path: '/api/finance/register', desc: 'Apertura y cierre de caja diaria con cuadre' },
    { method: 'GET / POST', path: '/api/finance/transactions', desc: 'Registro de cobros (Yape, Plin, POS, Efectivo)' },
    { method: 'GET / POST', path: '/api/finance/expenses', desc: 'Control de egresos operativos (Alquiler, sueldos)' },
    { method: 'GET / POST', path: '/api/leads', desc: 'Embudo comercial y conversión automática a alumna' },
    { method: 'POST', path: '/api/ai/studio-insights', desc: 'Inteligencia operativa con Google GenAI (Gemini)' },
    { method: 'POST', path: '/api/ai/biomechanics-advisor', desc: 'Asistente de resortes y adaptaciones de reformer' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-[#B5654A]/10 text-[#B5654A] rounded-2xl shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-fraunces text-2xl font-medium text-[#1A1815]">
                  Arquitectura Backend & Servicios API
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Express + Vite Middleware (Full-Stack)
                </span>
              </div>
              <p className="text-xs text-[#6B655C] max-w-2xl leading-relaxed">
                El backend de <strong>FIRME STUDIO</strong> está configurado con un servidor <strong>Node.js (Express 4.x)</strong> desacoplado y modular, ejecutándose en el puerto <strong>3000</strong>. Integra servicios RESTful para agenda, clientes, caja diaria y la suite de Inteligencia Artificial con <strong>@google/genai (Gemini 3.8 Flash)</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F1ECE5] text-[#1A1815] border border-[#DDD5C9] rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
              <span>Verificar Estado</span>
            </button>
          </div>
        </div>

        {/* Server Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E4DED4]">
          <div className="p-3 bg-[#F1ECE5]/60 rounded-xl border border-[#E4DED4]/60">
            <span className="text-[10px] font-bold text-[#6B655C] uppercase tracking-wider block mb-0.5">
              Estado del Servidor
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{health ? 'API Activa & Saludable' : 'Conectando...'}</span>
            </div>
          </div>

          <div className="p-3 bg-[#F1ECE5]/60 rounded-xl border border-[#E4DED4]/60">
            <span className="text-[10px] font-bold text-[#6B655C] uppercase tracking-wider block mb-0.5">
              Puerto & Entorno
            </span>
            <span className="text-xs font-mono font-bold text-[#1A1815]">
              0.0.0.0:3000 ({health?.environment || 'dev'})
            </span>
          </div>

          <div className="p-3 bg-[#F1ECE5]/60 rounded-xl border border-[#E4DED4]/60">
            <span className="text-[10px] font-bold text-[#6B655C] uppercase tracking-wider block mb-0.5">
              Métricas Sincronizadas
            </span>
            <span className="text-xs font-bold text-[#1A1815]">
              {health?.metrics.totalClasses || 0} Clases · {health?.metrics.totalClients || 0} Alumnas
            </span>
          </div>

          <div className="p-3 bg-[#F1ECE5]/60 rounded-xl border border-[#E4DED4]/60">
            <span className="text-[10px] font-bold text-[#6B655C] uppercase tracking-wider block mb-0.5">
              Motor de IA Server-Side
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-[#B5654A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Left: Architecture & Endpoints, Right: AI Operations Center) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Architecture & Routes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Architecture Tree Card */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#B5654A]" />
              <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                Estructura Modular del Backend
              </h3>
            </div>

            <div className="bg-[#1A1815] text-[#FAF8F5] p-4 rounded-xl font-mono text-xs overflow-x-auto border border-[#2C2723] space-y-1.5 leading-relaxed">
              <p className="text-[#8C8479]"># Estructura del proyecto Full-Stack:</p>
              <p className="text-amber-300">server.ts <span className="text-[#8C8479]">// Entry point Express + Vite middleware</span></p>
              <p className="text-emerald-400">├── server/data/</p>
              <p className="text-[#D49581]">│   └── store.ts <span className="text-[#8C8479]">// Capa de datos y persistencia en memoria</span></p>
              <p className="text-emerald-400">├── server/middleware/</p>
              <p className="text-[#D49581]">│   └── errorHandler.ts <span className="text-[#8C8479]">// Manejador centralizado de errores API</span></p>
              <p className="text-emerald-400">├── server/routes/</p>
              <p className="text-[#FAF8F5]">│   ├── health.ts <span className="text-emerald-400">&rarr; /api/health</span></p>
              <p className="text-[#FAF8F5]">│   ├── classes.ts <span className="text-emerald-400">&rarr; /api/classes</span></p>
              <p className="text-[#FAF8F5]">│   ├── bookings.ts <span className="text-emerald-400">&rarr; /api/bookings</span></p>
              <p className="text-[#FAF8F5]">│   ├── clients.ts <span className="text-emerald-400">&rarr; /api/clients</span></p>
              <p className="text-[#FAF8F5]">│   ├── finance.ts <span className="text-emerald-400">&rarr; /api/finance</span></p>
              <p className="text-[#FAF8F5]">│   ├── leads.ts <span className="text-emerald-400">&rarr; /api/leads</span></p>
              <p className="text-[#FAF8F5]">│   └── ai.ts <span className="text-amber-400">&rarr; /api/ai (Gemini AI Studio)</span></p>
              <p className="text-cyan-400">└── src/services/api.ts <span className="text-[#8C8479]">// Cliente tipado frontend con fallback</span></p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-3 bg-[#F1ECE5] rounded-xl border border-[#E4DED4]">
                <div className="font-bold text-[#1A1815]">Desacoplado</div>
                <div className="text-[11px] text-[#6B655C]">Rutas independientes por dominio</div>
              </div>
              <div className="p-3 bg-[#F1ECE5] rounded-xl border border-[#E4DED4]">
                <div className="font-bold text-[#1A1815]">Seguridad de Claves</div>
                <div className="text-[11px] text-[#6B655C]">GEMINI_API_KEY no expuesta</div>
              </div>
              <div className="p-3 bg-[#F1ECE5] rounded-xl border border-[#E4DED4]">
                <div className="font-bold text-[#1A1815]">Alta Velocidad</div>
                <div className="text-[11px] text-[#6B655C]">Respuestas sub-15ms en Cloud Run</div>
              </div>
            </div>
          </div>

          {/* Endpoints Table Card */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#B5654A]" />
                <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                  Catálogo de Endpoints REST
                </h3>
              </div>
              <span className="text-xs text-[#6B655C]">
                {ENDPOINTS_CATALOG.length} rutas activas
              </span>
            </div>

            <div className="divide-y divide-[#E4DED4] text-xs">
              {ENDPOINTS_CATALOG.map((ep, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E4DED4] text-[#1A1815]">
                      {ep.method}
                    </span>
                    <span className="font-mono font-semibold text-[#B5654A]">
                      {ep.path}
                    </span>
                  </div>
                  <span className="text-[#6B655C] text-[11px] text-right truncate">
                    {ep.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Operations & Clinical Reformer Advisor (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Feature 1: Studio Insights */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#B5654A]/10 text-[#B5654A]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
                    Auditoría & Insights de Negocio
                  </h3>
                  <p className="text-[11px] text-[#6B655C]">
                    Optimización de ocupación de las 8 camas
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAiInsights}
                disabled={aiLoading}
                className="px-3 py-1.5 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'Analizando...' : 'Generar'}</span>
              </button>
            </div>

            {aiInsights ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-xs text-[#1A1815] leading-relaxed">
                  <span className="font-bold text-[#B5654A] block mb-1">Diagnóstico Ejecutivo:</span>
                  {aiInsights.summary}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#6B655C] uppercase tracking-wider block">
                    Recomendaciones Tácticas:
                  </span>
                  {aiInsights.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#1A1815] p-2 bg-white rounded-lg border border-[#E4DED4]">
                      <span className="w-4 h-4 rounded-full bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Estrategia de Retención:</span>
                    <span>{aiInsights.retentionTip}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#F1ECE5]/40 border border-dashed border-[#DDD5C9] rounded-xl text-center space-y-2">
                <p className="text-xs text-[#6B655C]">
                  Haz clic en <strong>Generar</strong> para consultar al modelo Gemini 3.8 Flash con las métricas en vivo de FIRME STUDIO.
                </p>
              </div>
            )}
          </div>

          {/* AI Feature 2: Biomechanics & Spring Configuration */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#B5654A]/10 text-[#B5654A]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
                  Asesor Biomecánico Reformer
                </h3>
                <p className="text-[11px] text-[#6B655C]">
                  Ajuste clínico de resortes para instructoras
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Lesión / Condición Médica de la Alumna
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                >
                  <option value="Hernia discal L4-L5 leve">Hernia discal lumbar (L4-L5)</option>
                  <option value="Rectificación cervical y tensión">Rectificación cervical y contractura</option>
                  <option value="Post-cirugía de menisco rodilla">Post-cirugía de menisco (rodilla)</option>
                  <option value="Embarazo segundo trimestre (semana 22)">Embarazo 2do trimestre (semana 22)</option>
                  <option value="Escoliosis dorsal estructurada">Escoliosis dorsal funcional</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Enfoque
                  </label>
                  <select
                    value={selectedFocus}
                    onChange={(e) => setSelectedFocus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    <option value="Reformer Clásico">Reformer Clásico</option>
                    <option value="Power Core">Power Core</option>
                    <option value="Restorative">Restorative Mat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Ejercicio
                  </label>
                  <input
                    type="text"
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunBiomechanics}
                disabled={biomechanicsLoading}
                className="w-full py-2 bg-[#1A1815] hover:bg-[#2C2723] text-white rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#B5654A]" />
                <span>{biomechanicsLoading ? 'Calculando resortes...' : 'Consultar Configuración de Cama'}</span>
              </button>

              {biomechanicsResult && (
                <div className="mt-3 p-3.5 bg-white border border-[#E4DED4] rounded-xl space-y-2 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4DED4]">
                    <span className="font-bold text-[#1A1815]">Configuración Sugerida:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B5654A]/10 text-[#B5654A]">
                      Allegro 2
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#6B655C] uppercase block">Resortes (Springs):</span>
                    <p className="font-semibold text-emerald-800">{biomechanicsResult.recommendedSprings}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#6B655C] uppercase block">Cabecero (Headrest):</span>
                    <p className="text-[#1A1815]">{biomechanicsResult.headrestPosition}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-rose-700 uppercase block">Contraindicaciones:</span>
                    <ul className="list-disc list-inside text-rose-900 space-y-0.5">
                      {biomechanicsResult.contraindications.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#6B655C] uppercase block">Modificación Biomecánica:</span>
                    <p className="text-[#1A1815]">{biomechanicsResult.suggestedModifications}</p>
                  </div>

                  {biomechanicsResult.instructorCue && (
                    <div className="p-2 bg-[#F1ECE5] rounded-lg border border-[#E4DED4] text-[11px] italic text-[#1A1815]">
                      "{biomechanicsResult.instructorCue}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
