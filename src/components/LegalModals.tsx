import React from 'react';
import { X, ShieldCheck, FileText, Clock, AlertTriangle } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'cancellation' | 'rules';

interface LegalModalsProps {
  type: LegalDocType | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative text-[#1A1815] my-6 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4DED4] shrink-0">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-1">
              FIRME STUDIO S.A.C. · Marco Legal
            </span>
            <h2 className="font-fraunces text-2xl text-[#1A1815]">
              {type === 'terms' && 'Términos y Condiciones del Servicio'}
              {type === 'privacy' && 'Política de Privacidad y Protección de Datos'}
              {type === 'cancellation' && 'Política de Cancelación y Reprogramación (12h)'}
              {type === 'rules' && 'Reglamento Interno y Normas de Sala'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Document Body */}
        <div className="overflow-y-auto py-5 space-y-4 text-xs sm:text-sm text-[#6B655C] leading-relaxed pr-2">
          {type === 'cancellation' && (
            <>
              <div className="bg-[#B5654A]/10 p-4 rounded-xl border border-[#B5654A]/30 text-[#1A1815] space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[#B5654A]">
                  <Clock className="w-4 h-4" />
                  Regla de Oro: 12 Horas de Anticipación
                </p>
                <p className="text-xs">
                  Por respeto a los instructores y a los cupos limitados de 8 personas por sesión, cualquier modificación debe realizarse con un mínimo de 12 horas.
                </p>
              </div>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">1. Cancelación Oportuna (Early Cancel)</h3>
              <p>
                Si cancelas tu reserva con <strong>más de 12 horas</strong> de anticipación a la hora pactada, el crédito de la clase se reintegrará de forma inmediata a tu saldo activo de cuenta para que puedas reagendar en cualquier otro horario disponible dentro de la vigencia de tu plan.
              </p>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">2. Cancelación Tardía (Late Cancel) y No Show</h3>
              <p>
                Las cancelaciones efectuadas con <strong>menos de 12 horas</strong> previas al inicio de la sesión, así como la inasistencia física a la misma (No Show), ocasionarán la pérdida irremediable del crédito correspondiente. No se aplicarán excepciones por tráfico o imprevistos de índole personal.
              </p>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">3. Excepciones Médicas Formales</h3>
              <p>
                Únicamente se considerará la reposición de una clase cancelada tardíamente ante la presentación de un <strong>Certificado Médico oficial</strong> con sello de colegiatura emitido dentro de las 48 horas posteriores al evento.
              </p>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">4. Puntualidad y Cierre de Puerta</h3>
              <p>
                Por razones de prevención biomecánica de lesiones, se otorgará una <strong>tolerancia máxima de 5 minutos</strong> de cortesía. Pasado este tiempo no se admitirá el ingreso al reformer ni habrá lugar a reprogramación.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <div className="bg-[#EDF5F0] p-4 rounded-xl border border-[#C5DEC9] text-[#245E39] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D46]" />
                  Cumplimiento Ley N° 29733 (Perú)
                </p>
                <p className="text-xs">
                  Tus datos personales y de salud están protegidos bajo estricto secreto profesional y no serán transferidos a terceros.
                </p>
              </div>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">1. Titular del Banco de Datos</h3>
              <p>
                FIRME STUDIO S.A.C., con RUC 20608945123 y domicilio en San Juan de Lurigancho, Lima, es el titular responsable del tratamiento de los datos personales recopilados a través de esta plataforma digital y en recepción.
              </p>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">2. Finalidad del Tratamiento</h3>
              <p>
                Los datos solicitados (Nombres, DNI, Teléfono, Correo, ficha de salud o lesiones previas) son tratados con la exclusiva finalidad de:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Gestionar y confirmar tus reservas de clases y cupos en reformers.</li>
                <li>Garantizar que los instructores adapten los ejercicios a tus condiciones biomecánicas de salud.</li>
                <li>Emitir los comprobantes de pago electrónicos reglamentarios (Boletas o Facturas electrónicas SUNAT).</li>
                <li>Remitir avisos automáticos de confirmación, cancelaciones y recordatorios por WhatsApp o email.</li>
              </ul>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">3. Ejercicio de Derechos ARCO</h3>
              <p>
                Puedes ejercer en cualquier momento tus derechos de Acceso, Rectificación, Cancelación y Oposición remitiendo una comunicación por escrito al correo <strong>privacidad@firmestudio.pe</strong> adjuntando copia legible de tu DNI o documento equivalente.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">1. Vigencia y Caducidad de Planes</h3>
              <p>
                Todo paquete, plan o suscripción contratado en FIRME STUDIO posee un periodo improrrogable de validez especificado en el momento de la compra (Pase de Bienvenida: 15 días; Pack 8: 45 días; Plan Trimestral: 90 días; Plan Semestral: 180 días). Las clases no utilizadas dentro del plazo caducarán de pleno derecho.
              </p>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">2. Uso Obligatorio de Calcetines Grip</h3>
              <p>
                Es condición indispensable para ingresar a la sala y utilizar los reformers el empleo de <strong>calcetines antideslizantes con suela de silicona (grip socks)</strong>. Quien no disponga de los mismos podrá adquirirlos en la boutique del estudio antes de dar inicio a la sesión.
              </p>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">3. Declaración de Aptitud Física</h3>
              <p>
                El usuario manifiesta bajo juramento encontrarse en condiciones psicofísicas idóneas para la realización de ejercicio físico y asume el deber de informar al instructor y en la ficha médica de registro sobre cualquier embarazo, cirugía reciente, hipertensión o lesión de columna existente.
              </p>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">4. Política de Reembolsos</h3>
              <p>
                Las membresías y packs son de uso personal e intransferible. Salvo disposición legal en contrario o reclamo fundamentado conforme a INDECOPI, no se realizarán devoluciones dinerarias una vez iniciado el periodo de vigencia del servicio.
              </p>
            </>
          )}

          {type === 'rules' && (
            <>
              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">1. Ambiente de Calma y Silencio</h3>
              <p>
                FIRME STUDIO es un espacio concebido para el bienestar integral. Los teléfonos móviles deberán permanecer en modo silencio o apagados dentro de los lockers. No está permitido hablar por teléfono en la sala de práctica.
              </p>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">2. Higiene de Equipos Reformer</h3>
              <p>
                Al finalizar la clase, cada alumno recibirá una toallita desinfectante ecológica para limpiar los apoyacabezas, hombreras y barra de pies del reformer que utilizó, garantizando la bioseguridad del siguiente grupo.
              </p>

              <h3 className="font-fraunces text-base text-[#1A1815] font-medium pt-2">3. Uso de Lockers</h3>
              <p>
                Los casilleros son para uso transitorio durante la sesión. El estudio no se hace responsable por objetos de valor de alto calibre que no hayan sido declarados en recepción.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#E4DED4] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#1A1815] hover:bg-[#B5654A] text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
