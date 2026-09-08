import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  Receipt,
  Sparkles,
  Shield,
  ArrowRight,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  Download,
  AlertCircle,
} from 'lucide-react';
import { PricingPlan, AuthUser, PaymentMethod } from '../types';

interface PlanCheckoutModalProps {
  isOpen: boolean;
  plan: PricingPlan | null;
  onClose: () => void;
  currentUser: AuthUser | null;
  onOpenGoogleAuth: () => void;
  onPaymentSuccess: (
    plan: PricingPlan,
    details: {
      paymentMethod: PaymentMethod;
      clientName: string;
      clientEmail: string;
      clientDni: string;
      receiptType: 'boleta' | 'factura';
      receiptNumber: string;
      amountPaid: number;
    }
  ) => void;
}

export const PlanCheckoutModal: React.FC<PlanCheckoutModalProps> = ({
  isOpen,
  plan,
  onClose,
  currentUser,
  onOpenGoogleAuth,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientDni, setClientDni] = useState('');
  const [receiptType, setReceiptType] = useState<'boleta' | 'factura'>('boleta');
  const [rucNumber, setRucNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Simulación de Tarjeta
  const [cardNumber, setCardNumber] = useState('4557 8901 2345 6789');
  const [cardExp, setCardExp] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardHolder, setCardHolder] = useState('');

  // Simulación de Yape / Operación
  const [opNumber, setOpNumber] = useState('948201');

  // Estados de proceso
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [voucherData, setVoucherData] = useState<{
    receiptNumber: string;
    authCode: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && plan) {
      setIsSuccess(false);
      setIsProcessing(false);
      setErrorMsg('');

      if (currentUser) {
        setClientName(currentUser.name);
        setClientEmail(currentUser.email);
        setClientPhone(currentUser.phone || '+51 984 123 456');
        setClientDni(currentUser.dni || '74829103');
        setCardHolder(currentUser.name.toUpperCase());
      } else {
        setClientName('');
        setClientEmail('');
        setClientPhone('');
        setClientDni('');
        setCardHolder('');
      }
    }
  }, [isOpen, plan, currentUser]);

  if (!isOpen || !plan) return null;

  // Extraer precio numérico de la cadena ej "S/. 890" -> 890
  const numericPrice = parseInt(plan.price.replace(/[^\d]/g, ''), 10) || 890;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y apellido');
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido');
      return;
    }
    if (!clientDni.trim()) {
      setErrorMsg('Ingresa tu DNI para la emisión de la boleta');
      return;
    }
    if (receiptType === 'factura' && !rucNumber.trim()) {
      setErrorMsg('Ingresa el RUC de tu empresa para la factura');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    // Simulación de pasarela de pago (1.5 segundos)
    setTimeout(() => {
      const generatedReceipt = `${receiptType === 'factura' ? 'F001' : 'B001'}-${Math.floor(
        100000 + Math.random() * 900000
      )}`;
      const authCode = `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const now = new Date().toLocaleString('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      setVoucherData({
        receiptNumber: generatedReceipt,
        authCode,
        date: now,
      });

      setIsProcessing(false);
      setIsSuccess(true);

      onPaymentSuccess(plan, {
        paymentMethod,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientDni: clientDni.trim(),
        receiptType,
        receiptNumber: generatedReceipt,
        amountPaid: numericPrice,
      });
    }, 1500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden text-[#1A1815] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors"
          aria-label="Cerrar modal de pago"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div className="overflow-y-auto pr-1 flex-1">
            {/* Header */}
            <div className="mb-5">
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold tracking-wider uppercase text-[#B5654A] bg-[#F1ECE5] px-2.5 py-1 rounded border border-[#E4DED4] mb-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>Checkout & Activación de Suscripción</span>
              </div>
              <h2 className="font-fraunces text-2xl sm:text-3xl text-[#1A1815]">
                Suscripción a {plan.name}
              </h2>
            </div>

            {/* Plan Summary Card */}
            <div className="bg-[#F1ECE5] border border-[#E4DED4] rounded-xl p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-fraunces text-xl font-medium text-[#1A1815]">
                    {plan.name}
                  </h3>
                  {plan.isPopular && (
                    <span className="bg-[#B5654A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Más elegido
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B655C] mt-1">
                  Acceso a sala boutique (8 reformers), toalla y equipamiento incluidos.
                </p>
                <div className="text-[11px] text-[#B5654A] font-medium mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Sin matrícula ni costo de afiliación</span>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-[#E4DED4] sm:pl-5 shrink-0">
                <span className="text-xs text-[#6B655C] block">Total a pagar:</span>
                <span className="font-fraunces text-3xl font-bold text-[#1A1815] block">
                  {plan.price}
                </span>
                <span className="text-[11px] text-[#6B655C]">{plan.period || 'periodo'}</span>
              </div>
            </div>

            {/* Google autofill shortcut if not logged in */}
            {!currentUser && onOpenGoogleAuth && (
              <div className="mb-5 p-3 bg-white border border-[#E4DED4] rounded-lg flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2 text-xs text-[#1A1815]">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>¿Tienes cuenta con Gmail? Completa tus datos en 1 clic:</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenGoogleAuth}
                  className="text-xs font-semibold text-[#B5654A] hover:underline"
                >
                  Conectar Gmail
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 text-xs text-[#9A5340] bg-[#9A5340]/10 border border-[#9A5340]/20 p-2.5 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleProcessPayment} className="space-y-5">
              {/* Sección 1: Datos del Titular y Comprobante */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B655C]">
                    1. Datos de Titular y Facturación
                  </span>
                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="comprobante"
                        checked={receiptType === 'boleta'}
                        onChange={() => setReceiptType('boleta')}
                        className="text-[#B5654A]"
                      />
                      <span>Boleta (DNI)</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="comprobante"
                        checked={receiptType === 'factura'}
                        onChange={() => setReceiptType('factura')}
                        className="text-[#B5654A]"
                      />
                      <span>Factura (RUC)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                      Nombre y Apellidos *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        if (!cardHolder) setCardHolder(e.target.value.toUpperCase());
                      }}
                      placeholder="Ej. Sofía Montaner"
                      className="w-full bg-white border border-[#E4DED4] rounded-md px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                      {receiptType === 'factura' ? 'RUC de Empresa *' : 'DNI / Documento *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={receiptType === 'factura' ? rucNumber : clientDni}
                      onChange={(e) =>
                        receiptType === 'factura'
                          ? setRucNumber(e.target.value)
                          : setClientDni(e.target.value)
                      }
                      placeholder={receiptType === 'factura' ? 'Ej. 20601234567' : 'Ej. 74829103'}
                      className="w-full bg-white border border-[#E4DED4] rounded-md px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                      Correo Electrónico (para comprobante y accesos) *
                    </label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="sofia@gmail.com"
                      className="w-full bg-white border border-[#E4DED4] rounded-md px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                      Teléfono / WhatsApp de contacto *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+51 984 123 456"
                      className="w-full bg-white border border-[#E4DED4] rounded-md px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Método de Pago */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B655C] block mb-2">
                  2. Método de Pago Seguro (Perú)
                </span>

                {/* Tabs de Métodos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { key: 'yape', label: 'Yape / Plin', icon: QrCode },
                    { key: 'tarjeta_pos', label: 'Tarjeta Déb./Créd.', icon: CreditCard },
                    { key: 'transferencia_bcp', label: 'BCP / BBVA', icon: Building2 },
                    { key: 'efectivo', label: 'En Recepción', icon: Receipt },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.key;
                    return (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => setPaymentMethod(method.key as PaymentMethod)}
                        className={`p-2.5 rounded-lg border text-left flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FAF8F5] border-[#B5654A] ring-2 ring-[#B5654A]/30 text-[#B5654A] shadow-xs'
                            : 'bg-white border-[#E4DED4] text-[#6B655C] hover:bg-[#F1ECE5]'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1 text-[#B5654A]" />
                        <span className="text-xs font-medium text-center">{method.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-panel según método seleccionado */}
                {/* 1. YAPE / PLIN */}
                {paymentMethod === 'yape' && (
                  <div className="bg-white border border-[#E4DED4] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-28 h-28 bg-[#7A2181]/10 rounded-lg border border-[#7A2181]/30 flex flex-col items-center justify-center p-2 shrink-0">
                      <QrCode className="w-16 h-16 text-[#7A2181]" />
                      <span className="text-[10px] font-bold text-[#7A2181] mt-0.5">YAPE / PLIN</span>
                    </div>
                    <div className="text-xs space-y-1 text-center sm:text-left flex-1">
                      <div className="font-semibold text-sm text-[#1A1815]">
                        Número Yape / Plin: <span className="text-[#7A2181]">984 123 456</span>
                      </div>
                      <p className="text-[#6B655C]">
                        Titular: <strong>FIRME STUDIO S.A.C.</strong> · Monto exacto:{' '}
                        <strong className="text-[#1A1815]">{plan.price}</strong>
                      </p>
                      <div className="pt-2">
                        <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                          N° de Operación o últimos 4 dígitos simulados:
                        </label>
                        <input
                          type="text"
                          value={opNumber}
                          onChange={(e) => setOpNumber(e.target.value)}
                          placeholder="Ej. 849201"
                          className="w-full sm:w-48 bg-[#FAF8F5] border border-[#E4DED4] rounded px-2.5 py-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TARJETA CRÉDITO / DÉBITO */}
                {paymentMethod === 'tarjeta_pos' && (
                  <div className="bg-white border border-[#E4DED4] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#6B655C]">
                      <span>Aceptamos Visa, Mastercard, Amex y Diners</span>
                      <div className="flex gap-1 font-bold text-[10px] text-gray-500">
                        <span>VISA</span> · <span>MC</span> · <span>AMEX</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                        Número de Tarjeta (Simulada)
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E4DED4] rounded-md px-3 py-2 text-xs font-mono text-[#1A1815]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                          Fecha Vencimiento (MM/AA)
                        </label>
                        <input
                          type="text"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#E4DED4] rounded-md px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#E4DED4] rounded-md px-3 py-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TRANSFERENCIA BANCARIA */}
                {paymentMethod === 'transferencia_bcp' && (
                  <div className="bg-white border border-[#E4DED4] rounded-xl p-4 text-xs space-y-2">
                    <div className="flex justify-between border-b border-[#E4DED4] pb-2">
                      <span className="text-[#6B655C]">Banco BCP (Soles):</span>
                      <span className="font-mono font-medium">193-98472910-0-12</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E4DED4] pb-2">
                      <span className="text-[#6B655C]">CCI Interbancario:</span>
                      <span className="font-mono font-medium">002-193-009847291000-14</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B655C]">Titular de Cuenta:</span>
                      <span className="font-medium">FIRME STUDIO PERÚ S.A.C.</span>
                    </div>
                  </div>
                )}

                {/* 4. EFECTIVO EN RECEPCIÓN */}
                {paymentMethod === 'efectivo' && (
                  <div className="bg-white border border-[#E4DED4] rounded-xl p-4 text-xs text-[#6B655C] flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#B5654A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1A1815]">Pago Presencial en la Recepción del Estudio</p>
                      <p className="mt-1 leading-relaxed">
                        Tu membresía quedará pre-activada en el sistema. Podrás abonar con efectivo o tarjeta en el counter de recepción en San Juan de Lurigancho antes de tu primera clase.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#B5654A] hover:bg-[#9A5340] text-white py-3.5 px-4 rounded-lg font-medium text-sm transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Procesando suscripción segura...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>
                        Confirmar Pago de {plan.price} ({paymentMethod.toUpperCase()})
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-[#6B655C]">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transacción cifrada SSL 256 bits · Cancelación flexible sin penalidad</span>
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS STATE / COMPROBANTE DIGITAL */
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#B5654A] block mb-1">
                ¡Pago Aprobado y Suscripción Activa!
              </span>
              <h3 className="font-fraunces text-2xl sm:text-3xl text-[#1A1815]">
                Bienvenido/a a {plan.name}
              </h3>
              <p className="text-xs text-[#6B655C] max-w-sm mx-auto mt-1">
                Tu membresía ha sido registrada exitosamente en FIRME STUDIO. Ya puedes agendar tus clases en el calendario semanal.
              </p>
            </div>

            {/* Voucher Digital */}
            <div className="bg-white border border-[#E4DED4] rounded-xl p-4 text-xs text-left shadow-xs max-w-md mx-auto space-y-2">
              <div className="flex justify-between border-b border-[#E4DED4] pb-2">
                <span className="text-[#6B655C]">Comprobante Electrónico:</span>
                <span className="font-mono font-bold text-[#1A1815]">{voucherData?.receiptNumber}</span>
              </div>
              <div className="flex justify-between border-b border-[#E4DED4] pb-2">
                <span className="text-[#6B655C]">Titular:</span>
                <span className="font-medium text-[#1A1815]">{clientName} ({clientDni})</span>
              </div>
              <div className="flex justify-between border-b border-[#E4DED4] pb-2">
                <span className="text-[#6B655C]">Plan Adquirido:</span>
                <span className="font-semibold text-[#B5654A]">{plan.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#E4DED4] pb-2">
                <span className="text-[#6B655C]">Monto Abonado:</span>
                <span className="font-bold text-[#1A1815]">{plan.price}</span>
              </div>
              <div className="flex justify-between border-b border-[#E4DED4] pb-2">
                <span className="text-[#6B655C]">Método de Pago:</span>
                <span className="uppercase font-medium text-[#1A1815]">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#6B655C]">
                <span>Fecha y Hora:</span>
                <span>{voucherData?.date}</span>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-[#B5654A] hover:bg-[#9A5340] text-white px-6 py-2.5 rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                Ir a Horarios y Reservar Mi Primera Clase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
