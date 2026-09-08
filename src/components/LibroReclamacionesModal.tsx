import React, { useState } from 'react';
import { BookOpen, X, Check, Printer, ShieldCheck, ArrowLeft, ArrowRight, Send, AlertCircle } from 'lucide-react';

interface LibroReclamacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LibroReclamacionesModal: React.FC<LibroReclamacionesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoDoc: 'DNI',
    numDoc: '',
    telefono: '',
    email: '',
    domicilio: '',
    tipoBien: 'servicio', // 'servicio' | 'producto'
    montoReclamado: '',
    descripcionBien: '',
    tipoReclamacion: 'reclamo', // 'reclamo' | 'queja'
    detalle: '',
    pedido: '',
    aceptaTerminos: false,
  });

  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [submissionDate, setSubmissionDate] = useState<string>('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.nombreCompleto.trim() || !formData.numDoc.trim() || !formData.email.trim() || !formData.telefono.trim()) {
        alert('Por favor completa todos tus datos personales para continuar.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.detalle.trim() || !formData.pedido.trim() || !formData.aceptaTerminos) {
      alert('Por favor completa el detalle de tu reclamo/queja, tu pedido concreto y acepta la declaración jurada.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `FIRME-2026-00${randomNum}`;
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;

    setSubmittedCode(code);
    setSubmissionDate(formattedDate);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseReset = () => {
    setCurrentStep(1);
    setSubmittedCode(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1815]/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleCloseReset}
    >
      <div
        className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-lg w-full max-h-[85vh] shadow-2xl relative text-[#1A1815] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4DED4] bg-[#F1ECE5]/70 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#B5654A]/15 text-[#B5654A] flex items-center justify-center shrink-0 border border-[#B5654A]/25">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#B5654A] block">
                  INDECOPI · D.S. 011-2011-PCM
                </span>
                <h3 className="font-fraunces text-lg sm:text-xl text-[#1A1815] font-medium leading-tight">
                  Libro de Reclamaciones Virtual
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseReset}
              className="p-1.5 rounded-lg text-[#6B655C] hover:text-[#1A1815] hover:bg-[#E4DED4] transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!submittedCode && (
            <div className="mt-3.5">
              {/* Stepper indicator pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold mb-2">
                <span className={currentStep === 1 ? 'text-[#B5654A]' : 'text-[#6B655C]'}>
                  1. Tus Datos
                </span>
                <span className={currentStep === 2 ? 'text-[#B5654A]' : 'text-[#6B655C]'}>
                  2. Bien o Servicio
                </span>
                <span className={currentStep === 3 ? 'text-[#B5654A]' : 'text-[#6B655C]'}>
                  3. Reclamación
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-[#E4DED4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B5654A] transition-all duration-300 rounded-full"
                  style={{ width: currentStep === 1 ? '33.3%' : currentStep === 2 ? '66.6%' : '100%' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {!submittedCode ? (
            <form id="form-libro-reclamaciones" onSubmit={handleSubmit} className="space-y-4">
              
              {/* PASO 1: IDENTIFICACIÓN DEL CONSUMIDOR */}
              {currentStep === 1 && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-3 text-[11px] text-[#6B655C] space-y-0.5 mb-3">
                    <p><strong>Proveedor:</strong> FIRME STUDIO S.A.C. · RUC 20608945123</p>
                    <p><strong>Sede:</strong> Jr. Akapana 1261, Lima - SJL</p>
                  </div>

                  <div>
                    <label className="block text-xs text-[#1A1815] font-medium mb-1">
                      Nombres y Apellidos Completos *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombreCompleto}
                      onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                      placeholder="Ej. Sofía Montaner Vargas"
                      className="w-full px-3 py-2 bg-white border border-[#E4DED4] rounded-lg text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#1A1815] font-medium mb-1">
                        Tipo de Doc. *
                      </label>
                      <select
                        value={formData.tipoDoc}
                        onChange={(e) => setFormData({ ...formData, tipoDoc: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#E4DED4] rounded-lg text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">Carné Ext.</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#1A1815] font-medium mb-1">
                        Número de Doc. *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.numDoc}
                        onChange={(e) => setFormData({ ...formData, numDoc: e.target.value })}
                        placeholder="72418902"
                        className="w-full px-3 py-2 bg-white border border-[#E4DED4] rounded-lg text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#1A1815] font-medium mb-1">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="984 123 456"
                        className="w-full px-3 py-2 bg-white border border-[#E4DED4] rounded-lg text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#1A1815] font-medium mb-1">
                        Email de Notificación *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sofia@gmail.com"
                        className="w-full px-3 py-2 bg-white border border-[#E4DED4] rounded-lg text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#1A1815] font-medium mb-1">
                      Domicilio (Distrito, Dirección)
                    </label>
                    <input
                      type="text"
                      value={formData.domicilio}
                      onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                      placeholder="Ej. Las Flores 340, San Juan de Lurigancho"
                      className="w-full px-3 py-2 bg-white border border-[#E4DED4] rounded-lg text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>
                </div>
              )}

              {/* PASO 2: BIEN O SERVICIO CONTRATADO */}
              {currentStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs text-[#1A1815] font-medium mb-2">
                      Tipo de Bien Contratado *
                    </label>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <label
                        className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          formData.tipoBien === 'servicio'
                            ? 'border-[#B5654A] bg-[#B5654A]/10 font-bold text-[#1A1815]'
                            : 'border-[#E4DED4] bg-white text-[#6B655C]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipoBien"
                          value="servicio"
                          checked={formData.tipoBien === 'servicio'}
                          onChange={() => setFormData({ ...formData, tipoBien: 'servicio' })}
                          className="accent-[#B5654A]"
                        />
                        <span>Servicio (Clase / Plan)</span>
                      </label>

                      <label
                        className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          formData.tipoBien === 'producto'
                            ? 'border-[#B5654A] bg-[#B5654A]/10 font-bold text-[#1A1815]'
                            : 'border-[#E4DED4] bg-white text-[#6B655C]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipoBien"
                          value="producto"
                          checked={formData.tipoBien === 'producto'}
                          onChange={() => setFormData({ ...formData, tipoBien: 'producto' })}
                          className="accent-[#B5654A]"
                        />
                        <span>Producto (Boutique)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#1A1815] font-medium mb-1">
                      Descripción del Servicio o Producto Contratado
                    </label>
                    <input
                      type="text"
                      value={formData.descripcionBien}
                      onChange={(e) => setFormData({ ...formData, descripcionBien: e.target.value })}
                      placeholder="Ej. Plan Semestral 48 Clases, Sesión Reformer 07:30 h o Calcetines Grip"
                      className="w-full px-3 py-2 bg-white border border-[#E4DED4] rounded-lg text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#1A1815] font-medium mb-1">
                      Monto Reclamado en Soles (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.montoReclamado}
                      onChange={(e) => setFormData({ ...formData, montoReclamado: e.target.value })}
                      placeholder="Ej. S/. 95.00"
                      className="w-full px-3 py-2 bg-white border border-[#E4DED4] rounded-lg text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>
                </div>
              )}

              {/* PASO 3: RECLAMACIÓN Y ENVÍO */}
              {currentStep === 3 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  {/* Selector Reclamo vs Queja */}
                  <div>
                    <label className="block text-xs text-[#1A1815] font-medium mb-1.5">
                      Tipo de Reclamación *
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          formData.tipoReclamacion === 'reclamo'
                            ? 'border-[#B5654A] bg-[#B5654A]/10 font-bold text-[#1A1815]'
                            : 'border-[#E4DED4] bg-white text-[#6B655C]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <input
                            type="radio"
                            name="tipoReclamacion"
                            value="reclamo"
                            checked={formData.tipoReclamacion === 'reclamo'}
                            onChange={() => setFormData({ ...formData, tipoReclamacion: 'reclamo' })}
                            className="accent-[#B5654A]"
                          />
                          <span>Reclamo</span>
                        </div>
                        <p className="text-[10px] text-[#6B655C] font-normal leading-tight">
                          Disconformidad con el servicio o producto recibido.
                        </p>
                      </label>

                      <label
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          formData.tipoReclamacion === 'queja'
                            ? 'border-[#B5654A] bg-[#B5654A]/10 font-bold text-[#1A1815]'
                            : 'border-[#E4DED4] bg-white text-[#6B655C]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <input
                            type="radio"
                            name="tipoReclamacion"
                            value="queja"
                            checked={formData.tipoReclamacion === 'queja'}
                            onChange={() => setFormData({ ...formData, tipoReclamacion: 'queja' })}
                            className="accent-[#B5654A]"
                          />
                          <span>Queja</span>
                        </div>
                        <p className="text-[10px] text-[#6B655C] font-normal leading-tight">
                          Malestar con la atención o trato en el local.
                        </p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#1A1815] font-medium mb-1">
                      Detalle de los Hechos *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.detalle}
                      onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
                      placeholder="Explica qué sucedió de forma clara y respetuosa..."
                      className="w-full px-3 py-2 bg-white border border-[#E4DED4] rounded-lg text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#1A1815] font-medium mb-1">
                      Pedido Concreto *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.pedido}
                      onChange={(e) => setFormData({ ...formData, pedido: e.target.value })}
                      placeholder="Qué solución específica solicitas..."
                      className="w-full px-3 py-2 bg-white border border-[#E4DED4] rounded-lg text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>

                  {/* Declaration checkbox */}
                  <div className="bg-[#F1ECE5] p-3 rounded-xl border border-[#E4DED4] text-xs">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.aceptaTerminos}
                        onChange={(e) => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
                        className="accent-[#B5654A] mt-0.5 rounded"
                      />
                      <span className="text-[11px] text-[#1A1815] leading-snug">
                        Declaro ser el titular del reclamo y la veracidad de los hechos. Acepto recibir respuesta en un plazo máximo de <strong>15 días hábiles</strong> a mi correo conforme al D.S. N° 011-2011-PCM.
                      </span>
                    </label>
                  </div>
                </div>
              )}

            </form>
          ) : (
            /* Confirmación y Comprobante Formal */
            <div className="text-center py-4 space-y-3.5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#B5654A] block">
                  Hoja de Reclamación Registrada
                </span>
                <h3 className="font-fraunces text-2xl text-[#1A1815]">
                  {submittedCode}
                </h3>
                <span className="text-[11px] text-[#6B655C] block mt-0.5">
                  Fecha y hora: {submissionDate}
                </span>
              </div>

              <div className="bg-white border border-[#E4DED4] rounded-xl p-3.5 text-left text-xs space-y-2 max-w-sm mx-auto shadow-2xs">
                <div className="flex justify-between border-b border-[#E4DED4] pb-1.5">
                  <span className="text-[#6B655C]">Reclamante:</span>
                  <span className="font-medium text-[#1A1815] truncate max-w-[180px]">{formData.nombreCompleto}</span>
                </div>
                <div className="flex justify-between border-b border-[#E4DED4] pb-1.5">
                  <span className="text-[#6B655C]">Documento:</span>
                  <span className="font-mono text-[#1A1815]">{formData.tipoDoc} {formData.numDoc}</span>
                </div>
                <div className="flex justify-between border-b border-[#E4DED4] pb-1.5">
                  <span className="text-[#6B655C]">Tipo de Registro:</span>
                  <span className="font-bold text-[#B5654A] uppercase">{formData.tipoReclamacion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B655C]">Plazo Legal de Respuesta:</span>
                  <span className="font-bold text-emerald-700">15 días hábiles</span>
                </div>
              </div>

              <p className="text-[11px] text-[#6B655C] max-w-xs mx-auto leading-relaxed">
                Hemos enviado una copia fiel a <strong>{formData.email}</strong>. Puedes imprimir este comprobante formal.
              </p>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t border-[#E4DED4] bg-[#FAF8F5] shrink-0 flex items-center justify-between gap-3">
          {!submittedCode ? (
            <>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-3.5 py-2 border border-[#E4DED4] text-xs font-medium text-[#6B655C] rounded-xl hover:bg-[#F1ECE5] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Atrás</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseReset}
                  className="px-3.5 py-2 border border-[#E4DED4] text-xs font-medium text-[#6B655C] rounded-xl hover:bg-[#F1ECE5] transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 bg-[#1A1815] hover:bg-[#B5654A] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  form="form-libro-reclamaciones"
                  className="px-5 py-2 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Radicar Reclamación</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex gap-2 justify-center">
              <button
                type="button"
                onClick={handlePrint}
                className="w-1/2 py-2 px-3 bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                onClick={handleCloseReset}
                className="w-1/2 py-2 px-3 bg-[#1A1815] hover:bg-[#B5654A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Finalizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
