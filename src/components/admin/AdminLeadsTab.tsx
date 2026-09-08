import React, { useState } from 'react';
import {
  TrendingUp,
  MessageCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  UserCheck,
  X,
  Phone,
  Share2,
  Instagram,
  Globe,
  Pencil,
  Trash2,
  Check,
} from 'lucide-react';
import {
  LeadRecord,
  LeadStatus,
  LeadChannel,
  ClientProfile,
} from '../../types';

interface AdminLeadsTabProps {
  leads: LeadRecord[];
  onAddLead: (lead: Omit<LeadRecord, 'id' | 'createdAt'>) => void;
  onUpdateLead?: (lead: LeadRecord) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
  onConvertLeadToClient: (lead: LeadRecord) => void;
}

const STAGES: { key: LeadStatus; label: string; color: string }[] = [
  { key: 'nuevo', label: 'Nuevo Lead', color: 'bg-zinc-100 text-zinc-800 border-zinc-300' },
  { key: 'contactado', label: 'Contactado', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { key: 'prueba_agendada', label: 'Clase Prueba Agendada', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { key: 'asistio_prueba', label: 'Asistió a Prueba', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { key: 'convertido', label: 'Convertido a Alumno', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { key: 'no_interesado', label: 'Descartado', color: 'bg-rose-50 text-rose-800 border-rose-200' },
];

export const AdminLeadsTab: React.FC<AdminLeadsTabProps> = ({
  leads,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onUpdateLeadStatus,
  onConvertLeadToClient,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeStageFilter, setActiveStageFilter] = useState<string>('todos');

  // New Lead form
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    channel: LeadChannel;
    interest: LeadRecord['interest'];
    trialDate: string;
    notes: string;
  }>({
    name: '',
    phone: '',
    email: '',
    channel: 'instagram',
    interest: 'Reformer',
    trialDate: '',
    notes: '',
  });

  // Edit Lead state
  const [editingLead, setEditingLead] = useState<LeadRecord | null>(null);
  const [editLeadForm, setEditLeadForm] = useState<{
    name: string;
    phone: string;
    email: string;
    channel: LeadChannel;
    status: LeadStatus;
    interest: LeadRecord['interest'];
    trialDate: string;
    notes: string;
  }>({
    name: '',
    phone: '',
    email: '',
    channel: 'instagram',
    status: 'nuevo',
    interest: 'Reformer',
    trialDate: '',
    notes: '',
  });

  const handleStartEditLead = (lead: LeadRecord) => {
    setEditingLead(lead);
    setEditLeadForm({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      channel: lead.channel,
      status: lead.status,
      interest: lead.interest,
      trialDate: lead.trialDate || '',
      notes: lead.notes || '',
    });
  };

  const handleSaveEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead || !editLeadForm.name.trim()) return;

    const updated: LeadRecord = {
      ...editingLead,
      name: editLeadForm.name.trim(),
      phone: editLeadForm.phone.trim() || '+51 999 000 000',
      email: editLeadForm.email.trim() || undefined,
      channel: editLeadForm.channel,
      status: editLeadForm.status,
      interest: editLeadForm.interest,
      trialDate: editLeadForm.trialDate.trim() || undefined,
      notes: editLeadForm.notes.trim() || undefined,
    };

    onUpdateLead?.(updated);
    setEditingLead(null);
  };

  const handleDeleteLead = (leadId: string, leadName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el prospecto "${leadName}"? Esta acción no se puede deshacer.`)) {
      onDeleteLead?.(leadId);
    }
  };

  const convertedCount = leads.filter((l) => l.status === 'convertido').length;
  const conversionRate = leads.length > 0 ? Math.round((convertedCount / leads.length) * 100) : 0;
  const trialBookedCount = leads.filter((l) => l.status === 'prueba_agendada' || l.status === 'asistio_prueba').length;

  const filteredLeads = leads.filter((l) => {
    return activeStageFilter === 'todos' || l.status === activeStageFilter;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddLead({
      name: formData.name.trim(),
      phone: formData.phone.trim() || '+51 999 000 000',
      email: formData.email.trim() || 'prospecto@gmail.com',
      channel: formData.channel,
      interest: formData.interest,
      status: formData.trialDate ? 'prueba_agendada' : 'nuevo',
      trialDate: formData.trialDate.trim(),
      notes: formData.notes.trim(),
    });

    setFormData({
      name: '',
      phone: '',
      email: '',
      channel: 'instagram',
      interest: 'Reformer',
      trialDate: '',
      notes: '',
    });
    setShowAddModal(false);
  };

  const getWhatsAppMessage = (lead: LeadRecord) => {
    const name = lead.name || 'Alumna';
    if (lead.status === 'prueba_agendada') {
      return `¡Hola ${name}! Te confirmamos tu clase de prueba en FIRME STUDIO (Sede San Juan de Lurigancho). Te esperamos con 10 minutos de anticipación y calcetines con grip antideslizante. ¿Tienes alguna duda previa?`;
    }
    if (lead.status === 'asistio_prueba') {
      return `¡Hola ${name}! Esperamos que hayas disfrutado tu sesión en FIRME STUDIO. Tenemos activa una cortesía de matrícula al inscribirte esta semana en nuestro Pack 8 o Membresía Ilimitada. ¿Te gustaría asegurar tu turno fijo?`;
    }
    return `¡Hola ${name}! Te saludamos de FIRME STUDIO Pilates Reformer & Mat (Sede Lima - SJL). Vimos tu interés en nuestras clases. ¿Te gustaría agendar una clase de prueba personalizada para conocer nuestras camas Allegro 2?`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-fraunces text-xl font-medium text-[#1A1815]">
            Embudo de Captación & Leads
          </h2>
          <p className="text-xs text-[#6B655C] mt-0.5">
            Gestión comercial de prospectos de Instagram, TikTok, WhatsApp y reservas de clase de prueba.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Prospecto</span>
        </button>
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-[#6B655C] block">Total Prospectos</span>
          <span className="text-2xl font-bold text-[#1A1815] mt-1 block">{leads.length}</span>
        </div>
        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-[#6B655C] block">Clases de Prueba Agendadas</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{trialBookedCount}</span>
        </div>
        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-[#6B655C] block">Alumnos Convertidos</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{convertedCount}</span>
        </div>
        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-[#6B655C] block">Tasa de Conversión</span>
          <span className="text-2xl font-bold text-purple-700 mt-1 block">{conversionRate}%</span>
        </div>
      </div>

      {/* Stage Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveStageFilter('todos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeStageFilter === 'todos'
              ? 'bg-[#1A1815] text-[#FAF8F5]'
              : 'bg-[#F1ECE5] text-[#6B655C] hover:text-[#1A1815]'
          }`}
        >
          Todos ({leads.length})
        </button>
        {STAGES.map((st) => {
          const count = leads.filter((l) => l.status === st.key).length;
          return (
            <button
              key={st.key}
              type="button"
              onClick={() => setActiveStageFilter(st.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                activeStageFilter === st.key
                  ? 'bg-[#1A1815] text-[#FAF8F5]'
                  : 'bg-[#F1ECE5] text-[#6B655C] hover:text-[#1A1815]'
              }`}
            >
              <span>{st.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FAF8F5] text-[#1A1815] font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leads Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => {
          const stageInfo = STAGES.find((s) => s.key === lead.status) || STAGES[0];
          return (
            <div
              key={lead.id}
              className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-[#B5654A] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${stageInfo.color}`}>
                    {stageInfo.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#6B655C] capitalize">
                      {lead.channel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartEditLead(lead)}
                      className="p-1 rounded bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] transition-colors cursor-pointer border border-[#DDD5C9]"
                      title="Editar prospecto"
                    >
                      <Pencil className="w-3 h-3 text-[#B5654A]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLead(lead.id, lead.name)}
                      className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer border border-rose-200"
                      title="Eliminar prospecto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h4 className="font-semibold text-sm text-[#1A1815]">{lead.name}</h4>
                <div className="text-xs text-[#6B655C] mt-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#B5654A]" />
                    <span>{lead.phone}</span>
                  </div>
                  <div>Interés: <strong className="text-[#1A1815]">{lead.interest}</strong></div>
                  {lead.trialDate && (
                    <div className="text-amber-800 font-medium inline-flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Clase prueba: {lead.trialDate}</span>
                    </div>
                  )}
                </div>

                {lead.notes && (
                  <p className="text-[11px] text-[#6B655C] bg-[#F1ECE5] p-2 rounded-lg mt-2.5 leading-relaxed">
                    {lead.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#E4DED4] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {/* WhatsApp Direct */}
                  <a
                    href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                      getWhatsAppMessage(lead)
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-[#FAF8F5] text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer flex-1 justify-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contactar WhatsApp</span>
                  </a>

                  {/* Stage mover dropdown */}
                  <select
                    value={lead.status}
                    onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                    className="text-xs bg-[#F1ECE5] border border-[#E4DED4] rounded-lg px-2 py-1.5 text-[#1A1815]"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {lead.status !== 'convertido' && (
                  <button
                    type="button"
                    onClick={() => onConvertLeadToClient(lead)}
                    className="w-full py-1 text-center text-[11px] font-semibold text-[#B5654A] hover:bg-[#B5654A]/10 rounded border border-[#B5654A]/20 transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Convertir directamente a Alumno</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateLead}
            className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E4DED4]">
              <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                Registrar Nuevo Prospecto / Lead
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#6B655C] hover:text-[#1A1815]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Nombre del Prospecto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Carmen Del Solar..."
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    WhatsApp / Celular *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+51 987 654 321"
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Canal de Entrada
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value as LeadChannel })}
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                  >
                    <option value="instagram">Instagram DM / Ads</option>
                    <option value="tiktok">TikTok</option>
                    <option value="whatsapp">WhatsApp Directo</option>
                    <option value="web_organico">Web Orgánico</option>
                    <option value="recomendacion">Recomendación de Alumno</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Disciplina de Interés
                  </label>
                  <select
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                  >
                    <option value="Reformer">Reformer Allegro 2</option>
                    <option value="Mat">Mat Pilates</option>
                    <option value="Suspensión">Suspensión / Tower</option>
                    <option value="Todos">Todos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Fecha de Clase Prueba (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.trialDate}
                    onChange={(e) => setFormData({ ...formData, trialDate: e.target.value })}
                    placeholder="Ej. 04/09 18:00 h"
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Notas / Observaciones Comerciales
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej. Preguntó si se aceptan principiantes, busca horario nocturno..."
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-xs text-[#1A1815]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E4DED4]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B655C] hover:text-[#1A1815]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Guardar Prospecto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditLead}
            className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DED4]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#B5654A]/10 text-[#B5654A]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                    Editar Prospecto / Lead
                  </h3>
                  <p className="text-xs text-[#6B655C]">
                    Actualiza contacto, interés o estado en el embudo comercial.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="p-1.5 text-[#6B655C] hover:text-[#1A1815] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editLeadForm.name}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    WhatsApp / Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editLeadForm.phone}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={editLeadForm.email}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Canal de Captación
                  </label>
                  <select
                    value={editLeadForm.channel}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, channel: e.target.value as LeadChannel })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    <option value="instagram">Instagram Ads / DM</option>
                    <option value="whatsapp_directo">WhatsApp Directo</option>
                    <option value="referido">Referido por Alumno</option>
                    <option value="web">Web Landing Page</option>
                    <option value="tiktok">TikTok Video</option>
                    <option value="walk_in">Pasó por el Local (SJL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Estado en el Embudo
                  </label>
                  <select
                    value={editLeadForm.status}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, status: e.target.value as LeadStatus })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Disciplina / Interés
                  </label>
                  <select
                    value={editLeadForm.interest}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, interest: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    <option value="Reformer">Reformer Clásico</option>
                    <option value="Cadillac">Tower / Cadillac</option>
                    <option value="Mat & Barre">Mat & Barre</option>
                    <option value="Post-rehabilitación">Post-rehabilitación</option>
                    <option value="Membresía Ilimitada">Membresía Ilimitada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Fecha de Clase Prueba
                  </label>
                  <input
                    type="text"
                    value={editLeadForm.trialDate}
                    onChange={(e) => setEditLeadForm({ ...editLeadForm, trialDate: e.target.value })}
                    placeholder="Ej. Jueves 6:00 PM"
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Notas / Observaciones Comerciales
                </label>
                <textarea
                  rows={2}
                  value={editLeadForm.notes}
                  onChange={(e) => setEditLeadForm({ ...editLeadForm, notes: e.target.value })}
                  placeholder="Ej. Preguntó si se aceptan principiantes, busca horario nocturno..."
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-xs text-[#1A1815] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E4DED4]">
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 text-xs text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Actualizar Prospecto</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
