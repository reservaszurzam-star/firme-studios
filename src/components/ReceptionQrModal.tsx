import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Share2,
  Printer,
  Smartphone,
  Sparkles,
  ExternalLink,
  Send,
  MapPin,
} from 'lucide-react';

interface ReceptionQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceptionQrModal: React.FC<ReceptionQrModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [clientPhone, setClientPhone] = useState('');
  const [showPosterMode, setShowPosterMode] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://firmestudio.pe';
  const registerUrl = `${currentOrigin}/#registro`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&color=1A1815&bgcolor=FAF8F5&margin=10&data=${encodeURIComponent(registerUrl)}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(registerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = clientPhone.replace(/\D/g, '');
    const phoneParam = cleanPhone ? (cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`) : '';
    const message = `Hola! Te damos la bienvenida a FIRME STUDIO. Puedes crear tu cuenta de alumna en 30 segundos ingresando a este enlace oficial: ${registerUrl} . Te esperamos en tu cama Reformer!`;
    const waUrl = phoneParam
      ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-3xl border border-[#E4DED4] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-[#1A1815] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
          aria-label="Cerrar modal QR"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="mb-4">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold tracking-wider uppercase text-[#B5654A] bg-[#F1ECE5] px-3 py-1 rounded-full border border-[#E4DED4] mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>FIRME STUDIO · RECEPCIÓN & MOSTRADOR</span>
          </div>

          <h2 className="font-fraunces text-2xl sm:text-3xl text-[#1A1815] leading-tight">
            {showPosterMode ? 'Cartel de Mostrador (Imprimible)' : 'QR de Auto-Registro'}
          </h2>

          <p className="text-xs sm:text-sm text-[#6B655C] mt-1 leading-relaxed">
            {showPosterMode
              ? 'Listo para exhibir en una tablet o imprimir para el mostrador de recepción en Jr. Akapana 1261.'
              : 'Permite que las alumnas escaneen con la cámara de su celular para crear su cuenta y agendar en 30 segundos.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* Card con Código QR */}
          <div className="bg-white border border-[#DDD5C9] rounded-2xl p-5 shadow-xs flex flex-col items-center text-center">
            <div className="relative p-3 bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] shadow-inner mb-3">
              <img
                src={qrImageUrl}
                alt="Código QR de Registro FIRME STUDIO"
                className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl"
                loading="eager"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-white/95 shadow-md border border-[#DDD5C9] flex items-center justify-center">
                  <span className="font-fraunces text-xs font-bold text-[#B5654A]">FS</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1815]">
              <Smartphone className="w-4 h-4 text-[#B5654A]" />
              <span>Escanea con la cámara de tu celular</span>
            </div>
            <p className="text-[11px] text-[#6B655C] mt-0.5">
              Abre directamente la pantalla oficial de registro con Google o correo.
            </p>
          </div>

          {/* Enlace Único con Botón de Copiar */}
          <div className="bg-[#F1ECE5]/70 border border-[#E4DED4] rounded-2xl p-4 space-y-2">
            <label className="block text-xs font-semibold text-[#1A1815]">
              Enlace directo único de registro:
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={registerUrl}
                className="w-full bg-white border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] font-mono select-all focus:outline-hidden"
              />

              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#1A1815] hover:bg-[#322C27] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Enviar por WhatsApp */}
          <form onSubmit={handleSendWhatsApp} className="bg-white border border-[#DDD5C9] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1A1815] flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Enviar enlace por WhatsApp a la alumna:</span>
              </label>
              <span className="text-[10px] text-[#6B655C] font-mono">+51 (Perú)</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej. 984 123 456 (o dejar vacío)"
                className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3.5 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#25D366] transition-colors"
              />

              <button
                type="submit"
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar WhatsApp</span>
              </button>
            </div>
          </form>

          {/* Información del Local */}
          <div className="p-3 rounded-2xl bg-[#FAF2E8] border border-[#E4DED4] flex items-center justify-between text-xs text-[#6B655C]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#B5654A] shrink-0" />
              <span>Sede SJL · Jr. Akapana 1261 (Alt. Paradero 13 Las Flores)</span>
            </div>

            <a
              href={registerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B5654A] hover:underline shrink-0"
            >
              <span>Probar enlace</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-[#E4DED4] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDD5C9] bg-white hover:bg-[#F1ECE5] text-[#1A1815] font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#B5654A]" />
            <span>Imprimir Cartel</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
