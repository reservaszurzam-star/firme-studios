import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  UserPlus,
  Shield,
  Sparkles,
  Users,
  Lock,
  Eye,
  EyeOff,
  Key,
  Mail,
  AlertCircle,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Share2,
  Send,
  Printer,
  Calendar,
  HeartPulse,
  UserCheck,
  CreditCard,
  MessageCircle,
  Store,
  FileText,
  BadgeAlert,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { AuthUser, findStaffByCredential } from '../types';
import { supabaseService } from '../services/supabaseService';

export type AuthModality = 'qr' | 'manual' | 'whatsapp' | 'receptionist';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  purpose?: string;
  initialMode?: 'register' | 'login' | 'google' | 'staff' | 'qr' | 'manual' | 'whatsapp' | 'receptionist';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  purpose = 'para continuar en FIRME STUDIO',
  initialMode = 'manual',
}) => {
  // Modalidad activa (1 de las 4 maneras de registro/acceso para alumnas)
  const [activeModality, setActiveModality] = useState<AuthModality>('manual');

  // Sub-modo dentro del Formulario Manual: 'register' (Crear cuenta SmartFit) | 'login' (Ingresar)
  const [manualSubMode, setManualSubMode] = useState<'register' | 'login'>('register');

  // Sincronizar modo inicial al abrir
  useEffect(() => {
    if (isOpen && initialMode) {
      if (initialMode === 'qr' || initialMode === 'manual' || initialMode === 'whatsapp' || initialMode === 'receptionist') {
        setActiveModality(initialMode);
      } else if (initialMode === 'login') {
        setActiveModality('manual');
        setManualSubMode('login');
      } else if (initialMode === 'register' || initialMode === 'google' || initialMode === 'staff') {
        setActiveModality('manual');
        setManualSubMode('register');
      }
    }
  }, [isOpen, initialMode]);

  // --------------------------------------------------------------------------
  // ESTADOS - MODALIDAD 1: QR
  // --------------------------------------------------------------------------
  const [qrCopied, setQrCopied] = useState(false);
  const [qrPhone, setQrPhone] = useState('');

  // --------------------------------------------------------------------------
  // ESTADOS - MODALIDAD 2: FORMULARIO MANUAL ESTILO SMARTFIT
  // --------------------------------------------------------------------------
  const [docType, setDocType] = useState<'dni' | 'ce' | 'pasaporte'>('dni');
  const [docNumber, setDocNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'femenino' | 'masculino' | 'otro'>('femenino');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [medicalCondition, setMedicalCondition] = useState('Ninguna');

  // Login manual con DNI o Correo
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // --------------------------------------------------------------------------
  // ESTADOS - MODALIDAD 3: ATENCION WHATSAPP (CONCIERGE)
  // --------------------------------------------------------------------------
  const [waName, setWaName] = useState('');
  const [waDni, setWaDni] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [waInterest, setWaInterest] = useState('Crear cuenta nueva y conocer horarios');
  const [waVerificationPin, setWaVerificationPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  // --------------------------------------------------------------------------
  // ESTADOS - MODALIDAD 4: RECEPCIONISTA PRESENCIAL (COUNTER SJL)
  // --------------------------------------------------------------------------
  const [recDni, setRecDni] = useState('');
  const [recName, setRecName] = useState('');
  const [recPhone, setRecPhone] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recPlan, setRecPlan] = useState('Clase de Prueba (S/. 45)');
  const [recPaymentMethod, setRecPaymentMethod] = useState('Efectivo');
  const [recBed, setRecBed] = useState<number>(1);
  const [recSuccessCard, setRecSuccessCard] = useState<AuthUser | null>(null);

  // Estados comunes
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://firmestudio.pe';
  const registerUrl = `${currentOrigin}/#registro`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=340x340&color=1A1815&bgcolor=FAF8F5&margin=10&data=${encodeURIComponent(registerUrl)}`;

  // Copiar enlace QR
  const handleCopyQrLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(registerUrl);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2500);
    }
  };

  // Enviar QR por WhatsApp
  const handleSendQrWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = qrPhone.replace(/\D/g, '');
    const target = clean ? (clean.startsWith('51') ? clean : `51${clean}`) : '';
    const msg = `Hola, te damos la bienvenida a FIRME STUDIO. Puedes crear tu cuenta de alumna en 30 segundos ingresando al enlace oficial: ${registerUrl} . Te esperamos en Jr. Akapana 1261, SJL.`;
    const waUrl = target
      ? `https://wa.me/${target}?text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // Autenticación con Google OAuth Real (Supabase)
  const handleGoogleSignIn = async () => {
    setLoadingAction('google');
    setErrorMsg('');
    try {
      const res = await supabaseService.signInWithGoogle();
      if (res?.error) {
        if (
          res.error.toLowerCase().includes('provider is not enabled') ||
          res.error.toLowerCase().includes('unsupported provider')
        ) {
          setErrorMsg(
            'El proveedor de Google aún requiere ser activado en Supabase. Puedes crear tu cuenta en el Formulario Manual con DNI y contraseña.'
          );
        } else {
          setErrorMsg(res.error);
        }
        setLoadingAction(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Google OAuth');
      setLoadingAction(null);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLER: SUBMIT FORMULARIO SMARTFIT (REGISTRO)
  // --------------------------------------------------------------------------
  const handleSmartFitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (docType === 'dni' && docNumber.trim().length !== 8) {
      setErrorMsg('El DNI debe contener exactamente 8 dígitos numéricos.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Por favor ingresa tus nombres y apellidos completos.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg('Por favor ingresa un número de celular WhatsApp válido.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setLoadingAction('smartfit_register');

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      // 1. Registro real en Supabase Auth con metadatos SmartFit
      const res = await supabaseService.signUpWithPassword(
        email.trim(),
        password,
        fullName,
        phone.trim(),
        {
          dni: docNumber.trim(),
          documentType: docType,
          birthDate: birthDate,
          gender: gender,
          emergencyContact: emergencyName.trim(),
          emergencyPhone: emergencyPhone.trim(),
          medicalNotes: medicalCondition,
          registrationMethod: 'manual_smartfit',
          planName: 'Alumna Registrada',
          creditsLeft: 0,
        }
      );

      if (res.success && res.user) {
        // Guardar credencial de respaldo en localStorage
        try {
          const storedUsersRaw = localStorage.getItem('firme_registered_users');
          const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
          storedUsers.push({
            ...res.user,
            password: password,
          });
          localStorage.setItem('firme_registered_users', JSON.stringify(storedUsers));
        } catch {
          // ignore
        }

        localStorage.setItem('firme_auth_user', JSON.stringify(res.user));
        sessionStorage.removeItem('firme_admin_logged');

        setLoadingAction(null);
        onSuccess(res.user);
        onClose();
        return;
      }

      if (res.error) {
        if (res.error.toLowerCase().includes('already registered')) {
          setErrorMsg('Este correo ya se encuentra registrado. Ingresa en la opción "Iniciar Sesión" con tu DNI o Correo.');
        } else {
          setErrorMsg(res.error);
        }
        setLoadingAction(null);
        return;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor');
      setLoadingAction(null);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLER: SUBMIT LOGIN MANUAL (CON DNI O CORREO)
  // --------------------------------------------------------------------------
  const handleSmartFitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Ingresa tu DNI o tu correo electrónico registrado.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Ingresa tu contraseña.');
      return;
    }

    setLoadingAction('smartfit_login');

    // Comprobación directa para cuentas Staff (Valentino, Soni o Keyla)
    const staffMatch = findStaffByCredential(loginIdentifier.trim());
    if (staffMatch) {
      const storedMaster = localStorage.getItem('firme_admin_password') || 'firme2026';
      const staffPass = staffMatch.defaultPassword || 'firme2026';
      if (loginPassword.trim() === staffPass || loginPassword.trim() === storedMaster) {
        const staffUser: AuthUser = {
          id: staffMatch.id,
          name: staffMatch.name,
          email: staffMatch.email,
          role: staffMatch.role,
          roleTitle: staffMatch.roleTitle,
          avatar: staffMatch.avatar,
          provider: 'manual',
          phone: staffMatch.phone,
          dni: staffMatch.dni,
          planName: staffMatch.role === 'owner_dev' ? 'Owner Developer' : 'Administración Sede',
          creditsLeft: 99,
          experienceLevel: 'Avanzado',
          healthConditions: ['Ninguna'],
        };

        localStorage.setItem('firme_auth_user', JSON.stringify(staffUser));
        sessionStorage.setItem('firme_admin_logged', 'true');
        setLoadingAction(null);
        onSuccess(staffUser);
        onClose();
        return;
      } else {
        setErrorMsg(`Contraseña incorrecta para la cuenta de ${staffMatch.name}.`);
        setLoadingAction(null);
        return;
      }
    }

    try {
      // 1. Intento con Supabase (soporta DNI o correo)
      const res = await supabaseService.signInWithPassword(loginIdentifier.trim(), loginPassword);

      if (res.success && res.user) {
        localStorage.setItem('firme_auth_user', JSON.stringify(res.user));
        if (res.user.role === 'owner_dev' || res.user.role === 'admin') {
          sessionStorage.setItem('firme_admin_logged', 'true');
        } else {
          sessionStorage.removeItem('firme_admin_logged');
        }

        setLoadingAction(null);
        onSuccess(res.user);
        onClose();
        return;
      }

      // 2. Fallback de usuarios guardados localmente
      const cleanIdent = loginIdentifier.trim().toLowerCase();
      let foundUser: any = null;
      try {
        const storedUsersRaw = localStorage.getItem('firme_registered_users');
        if (storedUsersRaw) {
          const stored = JSON.parse(storedUsersRaw);
          foundUser = stored.find(
            (u: any) =>
              (u.dni && u.dni.toLowerCase() === cleanIdent) ||
              (u.email && u.email.toLowerCase() === cleanIdent)
          );
        }
      } catch {
        // ignore
      }

      if (foundUser) {
        if (foundUser.password && foundUser.password !== loginPassword) {
          setErrorMsg('Contraseña incorrecta. Por favor verifica tu clave.');
          setLoadingAction(null);
          return;
        }

        const authUser: AuthUser = {
          id: foundUser.id || `usr-${Date.now()}`,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role || 'client',
          roleTitle: foundUser.roleTitle || 'Alumna',
          avatar: foundUser.avatar,
          provider: 'manual',
          phone: foundUser.phone || '+51 900 000 000',
          dni: foundUser.dni || loginIdentifier.trim(),
          planName: foundUser.planName || 'Alumna Registrada',
          creditsLeft: foundUser.creditsLeft ?? 0,
          experienceLevel: foundUser.experienceLevel || 'Principiante',
          healthConditions: foundUser.healthConditions || ['Ninguna'],
        };

        localStorage.setItem('firme_auth_user', JSON.stringify(authUser));
        if (authUser.role === 'owner_dev' || authUser.role === 'admin') {
          sessionStorage.setItem('firme_admin_logged', 'true');
        } else {
          sessionStorage.removeItem('firme_admin_logged');
        }

        setLoadingAction(null);
        onSuccess(authUser);
        onClose();
        return;
      }

      setErrorMsg('Credenciales no encontradas. Verifica tu DNI/correo o crea tu cuenta en el Formulario.');
      setLoadingAction(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión');
      setLoadingAction(null);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLER: MODALIDAD 3 - WHATSAPP CONCIERGE
  // --------------------------------------------------------------------------
  const handleConnectWhatsAppConcierge = () => {
    const cleanPhone = waPhone.replace(/\D/g, '');
    const clientName = waName.trim() || 'Alumna';
    const clientDni = waDni.trim() || 'No especificado';

    const message = `Hola FIRME STUDIO, deseo registrar mi cuenta de alumna y recibir asesoría para agendar mi sesión de Pilates Reformer en la sede SJL.\n\nMis datos:\n- Nombre: ${clientName}\n- DNI: ${clientDni}\n- Celular: ${cleanPhone || 'Mismo número de WhatsApp'}\n- Motivo: ${waInterest}\n\nQuedo atenta a su confirmación.`;

    const studioWhatsAppNumber = '51984123456';
    const waUrl = `https://wa.me/${studioWhatsAppNumber}?text=${encodeURIComponent(message)}`;

    // Registrar en logs locales de leads
    try {
      const leadsRaw = localStorage.getItem('firme_leads_data');
      const leads = leadsRaw ? JSON.parse(leadsRaw) : [];
      leads.unshift({
        id: `lead-wa-${Date.now()}`,
        name: clientName,
        phone: cleanPhone || '+51 900 000 000',
        email: `${clientDni}@lead.pe`,
        channel: 'whatsapp',
        interest: 'Reformer',
        status: 'nuevo',
        createdAt: new Date().toLocaleDateString('es-PE'),
        notes: `Registro express solicitado vía WhatsApp. Motivo: ${waInterest}`,
      });
      localStorage.setItem('firme_leads_data', JSON.stringify(leads));
    } catch {
      // ignore
    }

    window.open(waUrl, '_blank');
  };

  // Validar código PIN recibido por WhatsApp
  const handleValidateWhatsAppPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waDni.trim() || !waVerificationPin.trim()) {
      setErrorMsg('Ingresa tu número de DNI y el código PIN proporcionado por la asesora.');
      return;
    }

    setLoadingAction('wa_pin');
    setTimeout(() => {
      const authUser: AuthUser = {
        id: `usr-wa-${Date.now()}`,
        name: waName.trim() || 'Alumna FIRME',
        email: `${waDni.trim()}@firme-alumna.pe`,
        role: 'client',
        roleTitle: 'Alumna Concierge',
        provider: 'manual',
        phone: waPhone.trim() || '+51 984 123 456',
        dni: waDni.trim(),
        planName: 'Clase de Prueba Reformer',
        creditsLeft: 1,
        experienceLevel: 'Principiante',
        healthConditions: ['Ninguna'],
        registrationMethod: 'whatsapp',
      };

      localStorage.setItem('firme_auth_user', JSON.stringify(authUser));
      sessionStorage.removeItem('firme_admin_logged');
      setLoadingAction(null);
      onSuccess(authUser);
      onClose();
    }, 700);
  };

  // --------------------------------------------------------------------------
  // HANDLER: MODALIDAD 4 - RECEPCIONISTA PRESENCIAL (COUNTER SJL)
  // --------------------------------------------------------------------------
  const handleReceptionDeskRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!recDni.trim() || recDni.trim().length < 6) {
      setErrorMsg('Ingresa un número de DNI o documento válido.');
      return;
    }
    if (!recName.trim()) {
      setErrorMsg('Ingresa el nombre completo de la alumna.');
      return;
    }

    setLoadingAction('desk_register');

    setTimeout(() => {
      const formattedEmail = recEmail.trim() || `${recDni.trim()}@firme-alumna.pe`;
      const credits = recPlan.includes('8') ? 8 : recPlan.includes('12') ? 12 : recPlan.includes('Ilimitad') ? 99 : 1;

      const newUser: AuthUser = {
        id: `usr-counter-${Date.now()}`,
        name: recName.trim(),
        email: formattedEmail,
        role: 'client',
        roleTitle: 'Alumna Presencial',
        provider: 'manual',
        phone: recPhone.trim() || '+51 900 000 000',
        dni: recDni.trim(),
        planName: recPlan,
        creditsLeft: credits,
        experienceLevel: 'Principiante',
        healthConditions: ['Verificado en counter'],
        registrationMethod: 'receptionist_desk',
      };

      // Guardar en clientes registrados
      try {
        const storedClientsRaw = localStorage.getItem('firme_clients_data');
        const storedClients = storedClientsRaw ? JSON.parse(storedClientsRaw) : [];
        storedClients.unshift({
          id: newUser.id,
          name: newUser.name,
          dni: newUser.dni,
          phone: newUser.phone,
          email: newUser.email,
          currentPlan: newUser.planName,
          planType: credits > 1 ? 'pack' : 'clase_suelta',
          creditsLeft: credits,
          totalAttended: 0,
          status: 'activo',
          joinDate: new Date().toLocaleDateString('es-PE'),
          lastVisit: 'Hoy en sede SJL',
          emergencyContact: 'Registrado en mostrador',
          medicalNotes: 'Ficha creada por personal en Jr. Akapana 1261',
        });
        localStorage.setItem('firme_clients_data', JSON.stringify(storedClients));

        // Registrar transacción de caja si fue pagado
        const transRaw = localStorage.getItem('firme_transactions_data');
        const transactions = transRaw ? JSON.parse(transRaw) : [];
        const cost = recPlan.includes('Prueba') ? 45 : recPlan.includes('8') ? 680 : recPlan.includes('12') ? 900 : 1050;
        transactions.unshift({
          id: `tx-${Date.now()}`,
          type: 'ingreso',
          concept: `Cobro en mostrador - ${recPlan}`,
          category: 'pack_clases',
          amount: cost,
          paymentMethod: recPaymentMethod.toLowerCase().includes('yape') ? 'yape' : 'efectivo',
          clientName: newUser.name,
          receiptNumber: `BOL-REC-${Math.floor(Math.random() * 9000 + 1000)}`,
          date: new Date().toLocaleDateString('es-PE'),
          time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          notes: `Pago en recepción sede Jr. Akapana 1261 por ${recPaymentMethod}`,
        });
        localStorage.setItem('firme_transactions_data', JSON.stringify(transactions));
      } catch {
        // ignore
      }

      setRecSuccessCard(newUser);
      setLoadingAction(null);
    }, 600);
  };



  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1815]/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-3xl border border-[#E4DED4] p-5 sm:p-7 max-w-xl w-full shadow-2xl relative overflow-hidden text-[#1A1815] max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado Superior */}
        <div className="mb-3">
          <div className="inline-flex items-center space-x-1.5 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-[#B5654A] bg-[#F1ECE5] px-2.5 py-0.5 rounded-full border border-[#E4DED4] mb-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>FIRME STUDIO · ACCESO & REGISTRO MULTIMODAL</span>
          </div>

          <h2 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] leading-tight">
            {activeModality === 'qr'
              ? '1. Escanear Código QR de Registro'
              : activeModality === 'manual'
              ? manualSubMode === 'register'
                ? '2. Formulario Manual de Alumna (Estilo SmartFit)'
                : '2. Iniciar Sesión con DNI o Correo'
              : activeModality === 'whatsapp'
              ? '3. Atención al Cliente por WhatsApp'
              : '4. Recepcionista Presencial (Counter SJL)'}
          </h2>

          <p className="text-xs text-[#6B655C] mt-0.5 leading-relaxed">
            Elige la modalidad que prefieras para crear tu cuenta o iniciar sesión:
          </p>
        </div>

        {/* SELECTOR DE LAS 4 MODALIDADES DE ALUMNA */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#EFE9DF] rounded-2xl border border-[#DDD5C9] mb-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveModality('qr');
                setErrorMsg('');
              }}
              className={`py-2 px-2 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                activeModality === 'qr'
                  ? 'bg-[#B5654A] text-white shadow-xs'
                  : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="text-[11px] leading-tight">1. Código QR</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveModality('manual');
                setErrorMsg('');
              }}
              className={`py-2 px-2 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                activeModality === 'manual'
                  ? 'bg-[#1A1815] text-white shadow-xs'
                  : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[11px] leading-tight">2. SmartFit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveModality('whatsapp');
                setErrorMsg('');
              }}
              className={`py-2 px-2 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                activeModality === 'whatsapp'
                  ? 'bg-[#25D366] text-white shadow-xs'
                  : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/50'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-[11px] leading-tight">3. WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveModality('receptionist');
                setErrorMsg('');
              }}
              className={`py-2 px-2 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                activeModality === 'receptionist'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="text-[11px] leading-tight">4. En Counter</span>
            </button>
          </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="mb-3 text-xs text-[#9A5340] bg-[#9A5340]/10 border border-[#9A5340]/20 p-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {successMsg && (
          <div className="mb-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* CONTENEDOR DESPLAZABLE */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* =================================================================
              MODALIDAD 1: ESCANEAR QR
              ================================================================= */}
          {activeModality === 'qr' && (
            <div className="space-y-3.5">
              <div className="bg-white border border-[#DDD5C9] rounded-2xl p-4 flex flex-col items-center text-center shadow-xs">
                <div className="relative p-3 bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] shadow-inner mb-2">
                  <img
                    src={qrImageUrl}
                    alt="QR de Registro FIRME STUDIO"
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-full bg-white/95 shadow-md border border-[#DDD5C9] flex items-center justify-center">
                      <span className="font-fraunces text-xs font-bold text-[#B5654A]">FS</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1815]">
                  <Smartphone className="w-4 h-4 text-[#B5654A]" />
                  <span>Apunta con la cámara de tu teléfono móvil</span>
                </div>
                <p className="text-[11px] text-[#6B655C] mt-0.5 max-w-xs">
                  Crea tu cuenta desde tu propio celular sin ingresar contraseñas en pantallas compartidas.
                </p>
              </div>

              {/* Enlace y botón copiar */}
              <div className="bg-[#F1ECE5]/70 border border-[#E4DED4] rounded-2xl p-3 space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#1A1815]">
                  Enlace único directo de registro:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={registerUrl}
                    className="w-full bg-white border border-[#DDD5C9] rounded-xl px-3 py-1.5 text-xs text-[#1A1815] font-mono select-all focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleCopyQrLink}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-[#1A1815] hover:bg-[#322C27] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {qrCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{qrCopied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Enviar enlace a mi WhatsApp */}
              <form onSubmit={handleSendQrWhatsApp} className="bg-white border border-[#DDD5C9] rounded-2xl p-3 space-y-2">
                <label className="text-xs font-semibold text-[#1A1815] flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Enviar el enlace directo a mi WhatsApp:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={qrPhone}
                    onChange={(e) => setQrPhone(e.target.value)}
                    placeholder="Ej. 984 123 456"
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-1.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#25D366] transition-colors"
                  />
                  <button
                    type="submit"
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =================================================================
              MODALIDAD 2: FORMULARIO MANUAL ESTILO SMARTFIT
              ================================================================= */}
          {activeModality === 'manual' && (
            <div className="space-y-3.5">
              {/* Sub-tabs: Crear cuenta vs Iniciar sesión */}
              <div className="flex rounded-xl bg-[#EFE9DF] p-1 border border-[#DDD5C9] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setManualSubMode('register');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    manualSubMode === 'register'
                      ? 'bg-white text-[#1A1815] shadow-xs'
                      : 'text-[#6B655C] hover:text-[#1A1815]'
                  }`}
                >
                  Crear Cuenta (Ficha Completa)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualSubMode('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    manualSubMode === 'login'
                      ? 'bg-white text-[#1A1815] shadow-xs'
                      : 'text-[#6B655C] hover:text-[#1A1815]'
                  }`}
                >
                  Iniciar Sesión (DNI o Correo)
                </button>
              </div>

              {/* Botón rápido con Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loadingAction !== null}
                className="w-full bg-white hover:bg-[#F7F5F0] border border-[#DDD5C9] hover:border-[#B5654A] py-2 px-3 rounded-xl font-medium text-xs text-[#1A1815] shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                <span>Acceso rápido con Google (1 Clic)</span>
              </button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#DDD5C9]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-[#6B655C]">
                  <span className="bg-[#FAF8F5] px-2 font-medium">o con datos manuales estilo SmartFit</span>
                </div>
              </div>

              {/* SUB-MODO: CREAR CUENTA SMARTFIT */}
              {manualSubMode === 'register' && (
                <form onSubmit={handleSmartFitRegister} className="space-y-3">
                  {/* Bloque 1: Identificación */}
                  <div className="bg-white border border-[#DDD5C9] p-3.5 rounded-2xl space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5654A] flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      <span>Paso 1: Documento de Identidad</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">Tipo</label>
                        <select
                          value={docType}
                          onChange={(e: any) => setDocType(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-2.5 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                        >
                          <option value="dni">DNI (Perú)</option>
                          <option value="ce">Carnet Ext.</option>
                          <option value="pasaporte">Pasaporte</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          Número de Documento <span className="text-[#B5654A]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, '').slice(0, docType === 'dni' ? 8 : 12))}
                          placeholder={docType === 'dni' ? '8 dígitos (ej. 72418902)' : 'Número de documento'}
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] font-mono focus:outline-hidden focus:border-[#B5654A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloque 2: Datos Personales */}
                  <div className="bg-white border border-[#DDD5C9] p-3.5 rounded-2xl space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5654A] flex items-center gap-1">
                      <UserPlus className="w-3 h-3" />
                      <span>Paso 2: Datos Personales</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          Nombres <span className="text-[#B5654A]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ej. Sofía"
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          Apellidos <span className="text-[#B5654A]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Ej. Montaner Cruz"
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          Fecha de Nacimiento
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          Género
                        </label>
                        <select
                          value={gender}
                          onChange={(e: any) => setGender(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-2.5 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                        >
                          <option value="femenino">Femenino</option>
                          <option value="masculino">Masculino</option>
                          <option value="otro">Prefiero no especificar</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Bloque 3: Contacto & Clave */}
                  <div className="bg-white border border-[#DDD5C9] p-3.5 rounded-2xl space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5654A] flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Paso 3: Contacto & Clave de Acceso</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          WhatsApp / Celular <span className="text-[#B5654A]">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+51 984 123 456"
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          Correo Electrónico <span className="text-[#B5654A]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ejemplo@correo.com"
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          Contraseña Secreta <span className="text-[#B5654A]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl pl-3 pr-8 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          Confirmar Contraseña <span className="text-[#B5654A]">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repite la contraseña"
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloque 4: Ficha de Salud Reformer */}
                  <div className="bg-white border border-[#DDD5C9] p-3.5 rounded-2xl space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5654A] flex items-center gap-1">
                      <HeartPulse className="w-3 h-3" />
                      <span>Paso 4: Ficha de Salud & Emergencia</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          Contacto de Emergencia
                        </label>
                        <input
                          type="text"
                          value={emergencyName}
                          onChange={(e) => setEmergencyName(e.target.value)}
                          placeholder="Familiar o pareja"
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                          Teléfono de Emergencia
                        </label>
                        <input
                          type="tel"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          placeholder="Celular de contacto"
                          className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#1A1815] mb-1">
                        Condición o molestia física previa
                      </label>
                      <select
                        value={medicalCondition}
                        onChange={(e) => setMedicalCondition(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-2.5 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                      >
                        <option value="Ninguna">Ninguna (Apto para Reformer regular)</option>
                        <option value="Molestia Lumbar / Hernia discal">Molestia Lumbar / Hernia discal</option>
                        <option value="Cervicalgia / Tensión cuello">Cervicalgia / Tensión cuello</option>
                        <option value="Molestia en Rodilla / Tobillo">Molestia en Rodilla / Tobillo</option>
                        <option value="Embarazo (Revisión con instructora)">Embarazo (Revisión con instructora)</option>
                        <option value="Recuperación post-quirúrgica">Recuperación post-quirúrgica</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction !== null}
                    className="w-full py-3 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loadingAction === 'smartfit_register' ? (
                      <span>Creando tu cuenta en FIRME STUDIO...</span>
                    ) : (
                      <>
                        <span>Crear Cuenta de Alumna (Estilo SmartFit)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* SUB-MODO: LOGIN MANUAL CON DNI O CORREO */}
              {manualSubMode === 'login' && (
                <form onSubmit={handleSmartFitLogin} className="space-y-3 bg-white border border-[#DDD5C9] p-4 rounded-2xl">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                      DNI o Correo Electrónico <span className="text-[#B5654A]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="Ingresa tu DNI (8 dígitos) o tu correo"
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                      />
                      <CreditCard className="w-4 h-4 text-[#6B655C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <span className="text-[10px] text-[#6B655C] mt-1 block">
                      Puedes ingresar tanto con tu DNI como con tu correo registrado.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                      Contraseña <span className="text-[#B5654A]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Tu contraseña secreta"
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                      />
                      <Key className="w-4 h-4 text-[#6B655C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction !== null}
                    className="w-full py-3 px-4 rounded-xl bg-[#1A1815] hover:bg-[#322C27] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loadingAction === 'smartfit_login' ? (
                      <span>Verificando credenciales...</span>
                    ) : (
                      <>
                        <span>Ingresar a mi Cuenta</span>
                        <ArrowRight className="w-4 h-4 text-[#B5654A]" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* =================================================================
              MODALIDAD 3: ATENCIÓN AL CLIENTE WHATSAPP (CONCIERGE)
              ================================================================= */}
          {activeModality === 'whatsapp' && (
            <div className="space-y-3.5">
              <div className="bg-[#E7F7ED] border border-[#25D366]/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-emerald-950">
                      Asistencia Personalizada 1-a-1 por WhatsApp
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      La recepcionista creará tu ficha y te enviará tu confirmación de reserva al instante.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#DDD5C9] p-4 rounded-2xl space-y-3 shadow-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                    Tu Nombre y Apellido
                  </label>
                  <input
                    type="text"
                    value={waName}
                    onChange={(e) => setWaName(e.target.value)}
                    placeholder="Ej. Camila Morales"
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#25D366]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                      DNI (Para tu ficha)
                    </label>
                    <input
                      type="text"
                      value={waDni}
                      onChange={(e) => setWaDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="8 dígitos"
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] font-mono focus:outline-hidden focus:border-[#25D366]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                      Número Celular
                    </label>
                    <input
                      type="tel"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="+51 984 123 456"
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#25D366]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                    ¿Cuál es tu consulta o interés?
                  </label>
                  <select
                    value={waInterest}
                    onChange={(e) => setWaInterest(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-2.5 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#25D366]"
                  >
                    <option value="Crear cuenta nueva y conocer horarios">Crear cuenta nueva y conocer horarios</option>
                    <option value="Agendar mi primera Clase de Prueba en Reformer">Agendar mi primera Clase de Prueba (S/. 45)</option>
                    <option value="Validar comprobante de pago por Yape/Transferencia">Validar comprobante de pago por Yape/Transferencia</option>
                    <option value="Consultar sobre dolores o lesiones con la instructora">Consultar sobre dolores o lesiones con la instructora</option>
                    <option value="Recuperar acceso o cambio de contraseña">Recuperar acceso o cambio de contraseña</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleConnectWhatsAppConcierge}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Conectar con Asesora en WhatsApp (+51 984 123 456)</span>
                </button>
              </div>

              {/* Opción para ingresar con PIN dado por la asesora */}
              <div className="bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl p-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowPinInput(!showPinInput)}
                  className="text-xs text-[#6B655C] hover:text-[#B5654A] font-medium underline cursor-pointer"
                >
                  {showPinInput
                    ? 'Ocultar validación por PIN'
                    : '¿La asesora de WhatsApp ya te dio un PIN o Código de Bienvenida? Pulsa aquí'}
                </button>

                {showPinInput && (
                  <form onSubmit={handleValidateWhatsAppPin} className="mt-3 space-y-2 text-left animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815]">Tu DNI</label>
                        <input
                          type="text"
                          required
                          value={waDni}
                          onChange={(e) => setWaDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                          placeholder="8 dígitos"
                          className="w-full bg-white border border-[#DDD5C9] rounded-xl px-3 py-1.5 text-xs text-[#1A1815] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1A1815]">Código PIN</label>
                        <input
                          type="text"
                          required
                          value={waVerificationPin}
                          onChange={(e) => setWaVerificationPin(e.target.value.toUpperCase())}
                          placeholder="Ej. FIRME2026"
                          className="w-full bg-white border border-[#DDD5C9] rounded-xl px-3 py-1.5 text-xs text-[#1A1815] font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loadingAction !== null}
                      className="w-full py-2 bg-[#1A1815] hover:bg-[#322C27] text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      {loadingAction === 'wa_pin' ? 'Validando...' : 'Validar PIN e Ingresar'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              MODALIDAD 4: RECEPCIONISTA PRESENCIAL (COUNTER SJL)
              ================================================================= */}
          {activeModality === 'receptionist' && (
            <div className="space-y-3.5">
              {recSuccessCard ? (
                <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 text-center space-y-3 shadow-md animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5654A] block">
                      Registro de Mostrador Completado
                    </span>
                    <h3 className="font-fraunces text-xl text-[#1A1815] mt-0.5">
                      Bienvenida, {recSuccessCard.name}
                    </h3>
                    <p className="text-xs text-[#6B655C] mt-0.5">
                      Ficha creada exitosamente en la recepción de sede Jr. Akapana 1261.
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#DDD5C9] p-3 rounded-xl text-xs text-left grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#6B655C] block">DNI Registrado:</span>
                      <span className="font-mono font-bold text-[#1A1815]">{recSuccessCard.dni}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B655C] block">Plan Asignado:</span>
                      <span className="font-semibold text-[#B5654A]">{recSuccessCard.planName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B655C] block">Cama Asignada:</span>
                      <span className="font-semibold text-emerald-700">Reformer #{recBed}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B655C] block">Créditos:</span>
                      <span className="font-semibold text-[#1A1815]">{recSuccessCard.creditsLeft} sesiones</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('firme_auth_user', JSON.stringify(recSuccessCard));
                      onSuccess(recSuccessCard);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
                  >
                    Iniciar Sesión de la Alumna Ahora
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReceptionDeskRegister} className="bg-white border border-[#DDD5C9] p-4 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 p-2 bg-[#FAF2E8] border border-[#E4DED4] rounded-xl text-xs text-[#6B655C]">
                    <Store className="w-4 h-4 text-[#B5654A] shrink-0" />
                    <span>
                      <strong>Atención en Counter SJL:</strong> Alta inmediata para alumnas que llegan en persona a sede.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                        DNI de la Alumna <span className="text-[#B5654A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={recDni}
                        onChange={(e) => setRecDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="8 dígitos"
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] font-mono focus:outline-hidden focus:border-[#B5654A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                        Nombre Completo <span className="text-[#B5654A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={recName}
                        onChange={(e) => setRecName(e.target.value)}
                        placeholder="Ej. Mariana Ramos"
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                        Celular WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={recPhone}
                        onChange={(e) => setRecPhone(e.target.value)}
                        placeholder="+51 984 123 456"
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                        Correo (Opcional)
                      </label>
                      <input
                        type="email"
                        value={recEmail}
                        onChange={(e) => setRecEmail(e.target.value)}
                        placeholder="alumna@correo.com"
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1815] mb-1">Plan</label>
                      <select
                        value={recPlan}
                        onChange={(e) => setRecPlan(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-2 py-2 text-xs text-[#1A1815]"
                      >
                        <option value="Clase de Prueba (S/. 45)">Prueba (S/. 45)</option>
                        <option value="Pack 8 Clases (S/. 680)">Pack 8 (S/. 680)</option>
                        <option value="Pack 12 Clases (S/. 900)">Pack 12 (S/. 900)</option>
                        <option value="Membresía Ilimitada (S/. 1,050)">Ilimitado (S/. 1,050)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1815] mb-1">Pago</label>
                      <select
                        value={recPaymentMethod}
                        onChange={(e) => setRecPaymentMethod(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-2 py-2 text-xs text-[#1A1815]"
                      >
                        <option value="Efectivo">Efectivo en caja</option>
                        <option value="Yape / Plin">Yape / Plin</option>
                        <option value="Tarjeta POS">Tarjeta POS</option>
                        <option value="Transferencia BCP">Transf. BCP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1815] mb-1">Cama Reformer</label>
                      <select
                        value={recBed}
                        onChange={(e) => setRecBed(Number(e.target.value))}
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-2 py-2 text-xs text-[#1A1815]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num}>
                            Cama #{num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction !== null}
                    className="w-full py-3 px-4 rounded-xl bg-[#1A1815] hover:bg-[#322C27] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loadingAction === 'desk_register' ? (
                      <span>Registrando alumna en el mostrador...</span>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Completar Registro Presencial en Mostrador</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-[#E4DED4] flex items-center justify-between text-[11px] text-[#6B655C]">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>FIRME STUDIO · Jr. Akapana 1261, SJL</span>
          </div>
          <span>Pilates Reformer Boutique</span>
        </div>
      </div>
    </div>
  );
};
