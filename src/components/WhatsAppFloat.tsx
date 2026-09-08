import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Clock, Check } from 'lucide-react';

export const WhatsAppFloat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '51984123456';

  const quickMessages = [
    {
      title: 'Primera vez en Reformer',
      text: 'Hola FIRME STUDIO, nunca he hecho Pilates y quisiera saber qué clase me recomiendan para empezar.',
    },
    {
      title: 'Consultar cupos hoy en SJL',
      text: 'Hola, quisiera consultar si tienen cupos disponibles para hoy en la sede de San Juan de Lurigancho.',
    },
    {
      title: 'Dudas sobre membresías',
      text: 'Hola, tengo dudas sobre las formas de pago de los planes (Yape / Tarjeta / Transferencia).',
    },
  ];

  const handleSendCustomMessage = (msg: string) => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className={`fixed bottom-6 right-6 ${isOpen ? 'z-50' : 'z-40'} flex flex-col items-end`}>
      {/* Quick Chat Popup Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Atención por WhatsApp FIRME STUDIO"
          className="mb-3 w-80 sm:w-96 bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="bg-[#1A1815] text-[#FAF8F5] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] p-1 flex items-center justify-center border border-[#E4DED4]">
                  <img
                    src="/firme-studio-logo.svg"
                    alt="FIRME STUDIO"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-[#1A1815]" />
              </div>
              <div>
                <h4 className="font-fraunces text-base font-medium">FIRME STUDIO</h4>
                <p className="text-[11px] text-[#25D366] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  En línea · Asesoría San Juan de Lurigancho
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#FAF8F5]/70 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Cerrar chat flotante"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-[#F1ECE5]/40 space-y-3 max-h-80 overflow-y-auto">
            {/* Assistant message bubble */}
            <div className="bg-white p-3 rounded-xl rounded-tl-xs border border-[#E4DED4] shadow-xs text-xs text-[#1A1815] space-y-1">
              <p className="font-semibold text-[#B5654A] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                ¡Hola! Bienvenida/o a FIRME STUDIO
              </p>
              <p className="text-[#6B655C] leading-relaxed">
                ¿En qué podemos ayudarte hoy? Selecciona una opción rápida o escribe tu mensaje directo a nuestro WhatsApp oficial:
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B655C] block">
                Preguntas Rápidas:
              </span>
              {quickMessages.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendCustomMessage(item.text)}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E4DED4] hover:border-[#B5654A]/40 transition-all text-xs flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <span className="text-[#1A1815] font-medium group-hover:text-[#B5654A] transition-colors">
                    {item.title}
                  </span>
                  <Send className="w-3.5 h-3.5 text-[#6B655C] group-hover:text-[#B5654A] transition-colors shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Direct CTA footer */}
          <div className="p-3.5 bg-white border-t border-[#E4DED4]">
            <button
              type="button"
              onClick={() => handleSendCustomMessage('Hola FIRME STUDIO, deseo comunicarme con recepción.')}
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Abrir WhatsApp directo</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        aria-label="Abrir chat de WhatsApp de FIRME STUDIO"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        <MessageCircle className="w-6 h-6 fill-white stroke-[1.5]" />
        <span className="hidden sm:inline-block text-xs font-bold tracking-wide">
          ¿Dudas? Chatea con nosotros
        </span>
      </button>
    </div>
  );
};
