import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  Users,
  Copy,
  ExternalLink,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Phone,
  Search,
  CheckCheck,
  Smartphone,
  ChevronRight,
  UserCheck,
  UserX,
  History,
} from 'lucide-react';
import {
  BookingRecord,
  ClientProfile,
  LeadRecord,
  ClassSession,
  WhatsAppTemplate,
  WhatsAppMessageLog,
} from '../../types';
import { studioApi } from '../../services/api';

interface AdminWhatsAppTabProps {
  bookings: BookingRecord[];
  clients: ClientProfile[];
  leads: LeadRecord[];
  classes: ClassSession[];
  onUpdateBookingStatus?: (bookingId: string, status: BookingRecord['status']) => void;
  onUpdateClientCredits?: (clientId: string, credits: number) => void;
}

export const AdminWhatsAppTab: React.FC<AdminWhatsAppTabProps> = ({
  bookings,
  clients,
  leads,
  classes,
  onUpdateBookingStatus,
  onUpdateClientCredits,
}) => {
  const [activeTab, setActiveTab] = useState<'recordatorios' | 'cancelaciones' | 'leads' | 'historial'>('recordatorios');
  const [logs, setLogs] = useState<WhatsAppMessageLog[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedBookingForPreview, setSelectedBookingForPreview] = useState<BookingRecord | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Initial load of templates & logs
  useEffect(() => {
    async function loadData() {
      try {
        const tRes = await studioApi.getWhatsAppTemplates();
        if (tRes.data) setTemplates(tRes.data);

        const lRes = await studioApi.getWhatsAppLogs();
        if (lRes.data) setLogs(lRes.data);
      } catch {
        // Fallback default templates
        setTemplates([
          {
            id: 'tpl-reminder',
            title: 'Recordatorio de Clase (3h antes)',
            category: 'recordatorio',
            template:
              '¡Hola {nombre}! ✨ Te recordamos tu clase de {clase} hoy a las {hora} con {instructora} en FIRME STUDIO.\n\n📍 Ubicación: Jr. Akapana 1261 (SJL, Lima)\n🧦 Recuerda traer tus calcetines antideslizantes obligatorios.\nTe esperamos con tu cama #{cama} lista.',
            variables: ['nombre', 'clase', 'hora', 'instructora', 'cama'],
          },
          {
            id: 'tpl-waitlist',
            title: 'Cupo Liberado (Lista de Espera)',
            category: 'lista_espera',
            template:
              '¡Hola {nombre}! 🎉 Se ha liberado una cama Reformer para la sesión de {clase} hoy a las {hora} con {instructora} en FIRME STUDIO.\n\n¿Deseas asegurar tu lugar? Responde SI a este mensaje en los próximos 15 minutos.',
            variables: ['nombre', 'clase', 'hora', 'instructora'],
          },
          {
            id: 'tpl-post-trial',
            title: 'Seguimiento Post-Clase de Prueba',
            category: 'post_prueba',
            template:
              '¡Hola {nombre}! 🌿 Esperamos que hayas disfrutado tu experiencia en el Reformer.\n\nPara que continúes fortaleciendo tu centro, tienes activo 15% de descuento en tu primer Pack de 8 clases (S/. 578 en vez de S/. 680).\n\n¿Te gustaría que te reservemos tus días fijos esta semana?',
            variables: ['nombre'],
          },
        ]);
      }
    }
    loadData();
  }, []);

  // Today's active bookings (filter out cancelada)
  const todayBookings = useMemo(() => {
    return bookings.filter((b) => b.status !== 'cancelada');
  }, [bookings]);

  // Set default preview booking
  useEffect(() => {
    if (todayBookings.length > 0 && !selectedBookingForPreview) {
      setSelectedBookingForPreview(todayBookings[0]);
    }
  }, [todayBookings, selectedBookingForPreview]);

  // Leads who attended a trial class
  const postTrialLeads = useMemo(() => {
    return leads.filter((l) => l.status === 'asistio_prueba' || l.status === 'prueba_agendada');
  }, [leads]);

  // Build the dynamic WhatsApp message for a booking
  const generateReminderText = (booking: BookingRecord) => {
    const template = templates.find((t) => t.category === 'recordatorio')?.template ||
      '¡Hola {nombre}! ✨ Te recordamos tu clase de {clase} hoy a las {hora} con {instructora} en FIRME STUDIO.\n\n📍 Ubicación: Jr. Akapana 1261 (SJL, Lima)\n🧦 Recuerda traer tus calcetines antideslizantes obligatorios.\nTe esperamos con tu cama #{cama} lista.';

    return template
      .replace('{nombre}', (booking.clientName || 'Alumna').split(' ')[0])
      .replace('{clase}', booking.className || 'Pilates Reformer')
      .replace('{hora}', booking.classTime || '')
      .replace('{instructora}', booking.instructor || 'Staff')
      .replace('{cama}', String(booking.bedNumber || '1'));
  };

  // Clean phone number for Peru wa.me URL
  const getCleanPhone = (phone?: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('51') && digits.length === 11) {
      return digits;
    }
    if (digits.length === 9) {
      return `51${digits}`;
    }
    return digits ? `51${digits}` : '';
  };

  // Trigger WhatsApp send link
  const handleSendWhatsApp = async (
    name: string,
    phone: string,
    message: string,
    type: 'recordatorio' | 'lista_espera' | 'post_prueba' | 'cancelacion',
    bookingId?: string
  ) => {
    const cleanNumber = getCleanPhone(phone);
    const encodedText = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Register log in backend
    try {
      const res = await studioApi.logWhatsAppSend({
        toName: name,
        toPhone: phone,
        type,
        content: message,
      });

      if (res.data) {
        setLogs((prev) => [res.data, ...prev]);
      }
    } catch {
      // Local fallback log
      const now = new Date();
      const localLog: WhatsAppMessageLog = {
        id: `wa-${Date.now()}`,
        toName: name,
        toPhone: phone,
        type,
        sentAt: `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
        status: 'enviado',
        content: message,
      };
      setLogs((prev) => [localLog, ...prev]);
    }

    // Mark reminder as sent on booking
    if (bookingId) {
      const b = bookings.find((item) => item.id === bookingId);
      if (b) {
        b.whatsappReminderSent = true;
        b.whatsappReminderTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      }
    }

    setNotification(`Mensaje generado para ${name}. Se abrió la ventana de WhatsApp.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Fair cancellation logic with automatic credit refund and waitlist check
  const handleCancelBooking = async (booking: BookingRecord) => {
    if (!window.confirm(`¿Confirmas la cancelación de la clase de ${booking.clientName}? Se liberará la cama #${booking.bedNumber || 'sala'} y se devolverá el crédito si tiene pack activo.`)) {
      return;
    }

    try {
      const res = await studioApi.cancelBookingWithRefund(booking.id);
      if (onUpdateBookingStatus) {
        onUpdateBookingStatus(booking.id, 'cancelada');
      }

      // Check if client has pack
      const client = clients.find((c) => c.email.toLowerCase() === booking.clientEmail.toLowerCase());
      if (client && onUpdateClientCredits && client.planType === 'pack') {
        onUpdateClientCredits(client.id, client.creditsLeft + 1);
      }

      setNotification(`Reserva de ${booking.clientName} cancelada. ${res.refunded ? 'Crédito devuelto a la alumna.' : ''} Cupo liberado.`);
      
      // If waitlist lead found, offer to notify
      if (res.nextWaitlistCandidate) {
        const lead = res.nextWaitlistCandidate;
        const waitlistMsg = `¡Hola ${lead.name.split(' ')[0]}! 🎉 Se ha liberado una cama Reformer para la sesión de ${booking.className} hoy a las ${booking.classTime} con ${booking.instructor} en FIRME STUDIO.\n\n¿Deseas asegurar tu lugar? Responde SI a este mensaje en los próximos 15 minutos.`;
        
        handleSendWhatsApp(lead.name, lead.phone, waitlistMsg, 'lista_espera');
      }
    } catch {
      if (onUpdateBookingStatus) {
        onUpdateBookingStatus(booking.id, 'cancelada');
      }
      setNotification(`Reserva cancelada y cupo liberado en sala.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-emerald-600" />
              <span>WhatsApp Cloud Automation</span>
            </span>
            <span className="text-xs text-[#8C8479]">• Enlaces wa.me directos sin agendar</span>
          </div>
          <h2 className="font-fraunces text-2xl font-medium text-[#1A1815]">
            Centro de Automatización por WhatsApp & Cancelación Justa
          </h2>
          <p className="text-xs text-[#6B655C] mt-1">
            Envío de recordatorios pre-clase (3h antes), reasignación instantánea de lista de espera y seguimiento a prospectos.
          </p>
        </div>

        {/* Subtab navigation */}
        <div className="flex items-center gap-1.5 bg-[#F1ECE5] p-1.5 rounded-xl border border-[#E4DED4] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('recordatorios')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'recordatorios'
                ? 'bg-white text-[#1A1815] shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            Recordatorios ({todayBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancelaciones')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'cancelaciones'
                ? 'bg-white text-[#1A1815] shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            Cancelación Justa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-white text-[#1A1815] shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            Leads Post-Prueba ({postTrialLeads.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'historial'
                ? 'bg-white text-[#1A1815] shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial ({logs.length})</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 1: RECORDATORIOS DE CLASE
          ========================================================= */}
      {activeTab === 'recordatorios' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table of bookings to notify (7 cols) */}
          <div className="lg:col-span-7 bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
                  Alumnas Agendadas para Hoy
                </h3>
                <p className="text-[11px] text-[#6B655C]">
                  Envía el aviso 3 horas antes con ubicación, hora y recordatorio de calcetines.
                </p>
              </div>

              {/* Batch send helper */}
              <button
                type="button"
                onClick={() => {
                  const pending = todayBookings.filter((b) => !b.whatsappReminderSent);
                  if (pending.length === 0) {
                    alert('Todas las alumnas de hoy ya tienen su recordatorio enviado.');
                    return;
                  }
                  // Send to first pending
                  const first = pending[0];
                  handleSendWhatsApp(
                    first.clientName,
                    first.clientPhone,
                    generateReminderText(first),
                    'recordatorio',
                    first.id
                  );
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Siguiente Pendiente</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {todayBookings.map((b) => {
                const isSelected = selectedBookingForPreview?.id === b.id;
                const isSent = b.whatsappReminderSent;
                const msgText = generateReminderText(b);

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBookingForPreview(b)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500 shadow-xs'
                        : 'border-[#E4DED4] bg-white hover:border-[#DDD5C9]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#1A1815] truncate">
                          {b.clientName}
                        </span>
                        {isSent ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            <span>Enviado ({b.whatsappReminderTime || 'Hoy'})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#6B655C] mt-1 flex items-center gap-2">
                        <span className="font-semibold text-[#1A1815]">{b.classTime}</span>
                        <span>•</span>
                        <span>{b.className}</span>
                        <span>•</span>
                        <span className="font-mono text-[#8C8479]">{b.clientPhone}</span>
                        <span>•</span>
                        <span className="text-[#B5654A] font-semibold">Cama #{b.bedNumber || 'Sin asignar'}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendWhatsApp(b.clientName, b.clientPhone, msgText, 'recordatorio', b.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isSent ? 'Reenviar' : 'Enviar WhatsApp'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Interactive Simulator Mockup (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B655C] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Simulador de Vista Móvil</span>
                </span>
                <span className="text-[10px] text-[#8C8479]">Previsualización exacta</span>
              </div>

              {/* Smartphone Frame */}
              <div className="max-w-[340px] mx-auto bg-[#0B141A] rounded-[32px] p-3 border-4 border-zinc-800 shadow-xl text-white">
                {/* Status Bar */}
                <div className="flex justify-between items-center text-[10px] text-zinc-400 px-3 py-1">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* WhatsApp Chat Header */}
                <div className="bg-[#202C33] p-2.5 rounded-t-2xl flex items-center gap-2.5 border-b border-[#2A3942]">
                  <div className="w-8 h-8 rounded-full bg-[#111B21] p-0.5 border border-[#25D366]">
                    <img
                      src="/firme-studio-logo.svg"
                      alt="FIRME STUDIO"
                      className="w-full h-full object-contain rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#E9EDEF] truncate">
                      {selectedBookingForPreview?.clientName || 'María Fernanda Ruiz'}
                    </div>
                    <div className="text-[9px] text-[#25D366]">en línea • FIRME STUDIO</div>
                  </div>
                </div>

                {/* Chat Background & Message Bubble */}
                <div className="bg-[#0B141A] p-3 min-h-[220px] flex flex-col justify-end space-y-2 rounded-b-2xl bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
                  {/* WhatsApp Green Bubble */}
                  <div className="bg-[#005C4B] text-[#E9EDEF] p-3 rounded-2xl rounded-tr-xs text-xs shadow-md space-y-1.5 leading-relaxed">
                    <p className="whitespace-pre-line text-[11px]">
                      {selectedBookingForPreview
                        ? generateReminderText(selectedBookingForPreview)
                        : 'Selecciona una reserva para previsualizar el mensaje...'}
                    </p>
                    <div className="flex justify-end items-center gap-1 text-[9px] text-zinc-400 pt-1">
                      <span>09:42</span>
                      <CheckCheck className="w-3 h-3 text-[#53BDEB]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action below simulator */}
            {selectedBookingForPreview && (
              <div className="mt-4 pt-3 border-t border-[#E4DED4] text-center">
                <button
                  type="button"
                  onClick={() =>
                    handleSendWhatsApp(
                      selectedBookingForPreview.clientName,
                      selectedBookingForPreview.clientPhone,
                      generateReminderText(selectedBookingForPreview),
                      'recordatorio',
                      selectedBookingForPreview.id
                    )
                  }
                  className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>Abrir Conversación en WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: CANCELACIÓN JUSTA & LISTA DE ESPERA
          ========================================================= */}
      {activeTab === 'cancelaciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Rules & Policy Card (4 cols) */}
          <div className="lg:col-span-4 bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#B5654A]/10 text-[#B5654A]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
                  Política de Cancelación Justa
                </h3>
                <span className="text-[10px] text-[#8C8479]">Normativa del Estudio</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#6B655C] leading-relaxed">
              <div className="p-3 bg-white rounded-xl border border-[#E4DED4]">
                <strong className="text-[#1A1815] block mb-1">⏱️ Ventana de 6 Horas:</strong>
                Las alumnas pueden cancelar su sesión con hasta 6 horas de anticipación. El crédito se restituye automáticamente a su pack en CRM.
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E4DED4]">
                <strong className="text-[#1A1815] block mb-1">🎯 Liberación Automática:</strong>
                Al registrar la cancelación, el cupo de la cama se libera de inmediato en el Kiosco y en la vista de la instructora.
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E4DED4]">
                <strong className="text-[#1A1815] block mb-1">🔔 Asignación a Lista de Espera:</strong>
                El sistema detecta a las interesadas registradas y genera un mensaje con urgencia para ocupar el cupo en menos de 15 min.
              </div>
            </div>
          </div>

          {/* Cancellable Bookings & Waitlist Candidates (8 cols) */}
          <div className="lg:col-span-8 bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
                Gestión de Cancelaciones Activas
              </h3>
              <p className="text-[11px] text-[#6B655C]">
                Selecciona una reserva para cancelar de forma justa y transferir el cupo a una persona en espera.
              </p>
            </div>

            <div className="space-y-2.5">
              {todayBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-[#E4DED4] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#1A1815]">{b.clientName}</span>
                      <span className="font-mono text-[10px] text-[#8C8479]">{b.clientPhone}</span>
                    </div>
                    <div className="text-[11px] text-[#6B655C] mt-0.5 flex items-center gap-2">
                      <span>{b.className} ({b.classTime})</span>
                      <span>•</span>
                      <span className="text-[#B5654A] font-medium">Cama #{b.bedNumber || 'Asignada'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(b)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 cursor-pointer flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Cancelar & Reembolsar Crédito</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Waitlist section */}
            <div className="mt-6 pt-5 border-t border-[#E4DED4]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B655C] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B5654A]" />
                <span>Candidatas en Lista de Espera Disponibles</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leads.slice(0, 4).map((lead) => {
                  const firstName = (lead.name || 'Alumna').split(' ')[0];
                  const waitlistMsg = `¡Hola ${firstName}! 🎉 Se ha liberado una cama Reformer en FIRME STUDIO hoy para una sesión. ¿Deseas asegurar tu lugar? Responde SI a este mensaje en los próximos 15 minutos.`;

                  return (
                    <div
                      key={lead.id}
                      className="p-3 bg-white rounded-xl border border-[#E4DED4] flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-semibold text-xs text-[#1A1815]">{lead.name}</div>
                        <div className="text-[11px] text-[#8C8479]">{lead.phone} • {lead.interest}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(lead.name, lead.phone, waitlistMsg, 'lista_espera')}
                        className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Avisar Cupo Liberado</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: SEGUIMIENTO A LEADS POST-PRUEBA
          ========================================================= */}
      {activeTab === 'leads' && (
        <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
                Seguimiento Post-Clase de Prueba a Prospectos
              </h3>
              <p className="text-xs text-[#6B655C]">
                Envía la oferta especial de bienvenida (15% de descuento en Pack de 8 clases) dentro de las 24 horas siguientes a su sesión.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {postTrialLeads.map((lead) => {
              const offerMsg = `¡Hola ${lead.name.split(' ')[0]}! 🌿 Esperamos que hayas disfrutado al máximo tu clase de prueba en FIRME STUDIO.\n\nPara que continúes fortaleciendo tu centro y postura, tenemos activo para ti un 15% de descuento en tu primer Pack de 8 clases (S/. 578 en vez de S/. 680).\n\n¿Te gustaría que te reservemos tus días fijos esta semana?`;

              return (
                <div
                  key={lead.id}
                  className="p-4 rounded-xl border border-[#E4DED4] bg-white shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1A1815]">{lead.name}</span>
                      <span className="text-[10px] font-semibold bg-[#B5654A]/10 text-[#B5654A] px-2 py-0.5 rounded-full">
                        {lead.status === 'asistio_prueba' ? 'Asistió Prueba' : 'Prueba Agendada'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B655C]">Tel: {lead.phone}</div>
                    <div className="text-[11px] text-[#8C8479]">Interés: {lead.interest} • Canal: {lead.channel}</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(lead.name, lead.phone, offerMsg, 'post_prueba')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Oferta 15% por WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: HISTORIAL DE MENSAJES ENVIADOS
          ========================================================= */}
      {activeTab === 'historial' && (
        <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
                Historial de Notificaciones WhatsApp Enviadas
              </h3>
              <p className="text-xs text-[#6B655C]">
                Registro de trazabilidad de recordatorios, avisos de lista de espera y promociones enviadas.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8C8479]">
              Total enviados: {logs.length}
            </span>
          </div>

          <div className="divide-y divide-[#E4DED4] border border-[#E4DED4] rounded-xl overflow-hidden bg-white">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8C8479]">
                No hay registros de envíos todavía.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1A1815]">{log.toName}</span>
                      <span className="font-mono text-[#8C8479]">{log.toPhone}</span>
                      <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md uppercase">
                        {log.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B655C] mt-1 line-clamp-1 italic">
                      "{log.content}"
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] text-[#8C8479]">{log.sentAt}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      <span>Enviado</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
