import React, { useState } from 'react';
import {
  X,
  Check,
  ArrowRight,
  UserPlus,
  Shield,
  Sparkles,
  ShieldCheck,
  Users,
  Lock,
  Eye,
  EyeOff,
  Key,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { AuthUser, PREDEFINED_STAFF, StaffAccount, determineUserRole } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  purpose?: string;
}

// Cuentas de demostración simuladas de Alumnas (Clientes)
const MOCK_GMAIL_ACCOUNTS = [
  {
    id: 'g-1',
    name: 'Sofía Montaner',
    email: 'sofia.montaner@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    plan: 'Membresía Ilimitada',
    credits: 12,
    dni: '74829103',
    phone: '+51 984 321 654',
  },
  {
    id: 'g-2',
    name: 'Elena Serrano',
    email: 'elena.serrano@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    plan: 'Pack 8 Clases',
    credits: 5,
    dni: '46291837',
    phone: '+51 971 884 219',
  },
  {
    id: 'g-3',
    name: 'Javier Bermejo',
    email: 'javier.bermejo@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    plan: 'Clase Suelta',
    credits: 1,
    dni: '71930284',
    phone: '+51 993 112 405',
  },
];

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  purpose = 'para continuar en FIRME STUDIO',
}) => {
  // Navigation tabs: 'register' (Crear cuenta) | 'login' (Iniciar sesión) | 'google' (Google Rápido) | 'staff' (Equipo)
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'google' | 'staff'>('register');

  // Form states
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [loadingAccountId, setLoadingAccountId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Acceso para Alumnas / Clientes mediante tarjeta rápida
  const handleSelectAccount = (account: typeof MOCK_GMAIL_ACCOUNTS[0]) => {
    setLoadingAccountId(account.id);
    setErrorMsg('');

    setTimeout(() => {
      const authUser: AuthUser = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: 'client',
        roleTitle: 'Alumna',
        avatar: account.avatar,
        provider: 'google',
        phone: account.phone,
        dni: account.dni,
        planName: account.plan,
        creditsLeft: account.credits,
        experienceLevel: 'Intermedio',
        healthConditions: ['Ninguna'],
      };

      localStorage.setItem('firme_auth_user', JSON.stringify(authUser));
      sessionStorage.removeItem('firme_admin_logged');
      setLoadingAccountId(null);
      onSuccess(authUser);
      onClose();
    }, 600);
  };

  // Acceso para Equipo Staff (Valentino: owner_dev | Soni, Keyla: admin)
  const handleSelectStaff = (staff: StaffAccount) => {
    setLoadingAccountId(staff.id);
    setErrorMsg('');

    setTimeout(() => {
      const authUser: AuthUser = {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        roleTitle: staff.roleTitle,
        avatar: staff.avatar,
        provider: 'google',
        phone: staff.phone,
        dni: staff.dni,
        planName: staff.role === 'owner_dev' ? 'Owner Developer' : 'Administración Sede',
        creditsLeft: 99,
        experienceLevel: 'Avanzado',
        healthConditions: ['Ninguna'],
      };

      localStorage.setItem('firme_auth_user', JSON.stringify(authUser));
      sessionStorage.setItem('firme_admin_logged', 'true');
      setLoadingAccountId(null);
      onSuccess(authUser);
      onClose();
    }, 600);
  };

  // Registro de nueva cuenta con Correo y Contraseña
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y apellido');
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido');
      return;
    }
    if (registerPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoadingAccountId('register');
    setErrorMsg('');

    setTimeout(() => {
      const email = registerEmail.trim().toLowerCase();
      const { role, roleTitle } = determineUserRole(registerName, email);

      const authUser: AuthUser = {
        id: `usr-${Date.now()}`,
        name: registerName.trim(),
        email: email,
        role: role,
        roleTitle: roleTitle,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(registerName.trim())}&background=B5654A&color=fff`,
        provider: 'manual',
        phone: registerPhone.trim() || '+51 900 000 000',
        planName: role === 'client' ? 'Alumna Registrada' : roleTitle,
        creditsLeft: role === 'client' ? 0 : 99,
        experienceLevel: 'Principiante',
        healthConditions: ['Ninguna'],
      };

      // Guardar en lista de usuarios registrados del navegador
      try {
        const storedUsersRaw = localStorage.getItem('firme_registered_users');
        const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
        storedUsers.push({
          ...authUser,
          password: registerPassword,
        });
        localStorage.setItem('firme_registered_users', JSON.stringify(storedUsers));
      } catch (err) {
        console.warn('Error al guardar credenciales locales:', err);
      }

      localStorage.setItem('firme_auth_user', JSON.stringify(authUser));
      if (role === 'owner_dev' || role === 'admin') {
        sessionStorage.setItem('firme_admin_logged', 'true');
      } else {
        sessionStorage.removeItem('firme_admin_logged');
      }

      setLoadingAccountId(null);
      onSuccess(authUser);
      onClose();
    }, 700);
  };

  // Inicio de sesión para usuario existente con Correo y Contraseña
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setErrorMsg('Ingresa tu correo electrónico registrado');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Ingresa tu contraseña');
      return;
    }

    setLoadingAccountId('login');
    setErrorMsg('');

    setTimeout(() => {
      const email = loginEmail.trim().toLowerCase();

      // Buscar si es un usuario registrado previamente
      let foundUser: any = null;
      try {
        const storedUsersRaw = localStorage.getItem('firme_registered_users');
        if (storedUsersRaw) {
          const storedUsers = JSON.parse(storedUsersRaw);
          foundUser = storedUsers.find((u: any) => u.email.toLowerCase() === email);
        }
      } catch (err) {
        // ignore
      }

      // Si no está en usuarios guardados, buscar en las cuentas demo o permitir login
      if (!foundUser) {
        const mockMatch = MOCK_GMAIL_ACCOUNTS.find((a) => a.email.toLowerCase() === email);
        if (mockMatch) {
          foundUser = {
            id: mockMatch.id,
            name: mockMatch.name,
            email: mockMatch.email,
            role: 'client',
            roleTitle: 'Alumna',
            avatar: mockMatch.avatar,
            phone: mockMatch.phone,
            dni: mockMatch.dni,
            planName: mockMatch.plan,
            creditsLeft: mockMatch.credits,
          };
        } else {
          // Crear sesión con el correo ingresado
          const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
          const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          const { role, roleTitle } = determineUserRole(formattedName, email);
          foundUser = {
            id: `usr-${Date.now()}`,
            name: formattedName,
            email: email,
            role: role,
            roleTitle: roleTitle,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=B5654A&color=fff`,
            provider: 'manual',
            phone: '+51 900 000 000',
            planName: 'Alumna Registrada',
            creditsLeft: 0,
          };
        }
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
        dni: foundUser.dni || '70000000',
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

      setLoadingAccountId(null);
      onSuccess(authUser);
      onClose();
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden text-[#1A1815] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
          aria-label="Cerrar modal de autenticación"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Informative Header Banner when booking or buying */}
        <div className="mb-4">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold tracking-wider uppercase text-[#B5654A] bg-[#F1ECE5] px-2.5 py-1 rounded border border-[#E4DED4] mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>FIRME STUDIO · ACCESO ALUMNA</span>
          </div>

          <h2 className="font-fraunces text-2xl text-[#1A1815] leading-tight">
            {authMode === 'register' && 'Crear tu Cuenta de Alumna'}
            {authMode === 'login' && 'Iniciar Sesión'}
            {authMode === 'google' && 'Acceso Rápido con Google'}
            {authMode === 'staff' && 'Acceso Equipo Staff'}
          </h2>

          <p className="text-xs text-[#6B655C] mt-1 leading-relaxed">
            {purpose
              ? `Para ${purpose}, crea tu cuenta o inicia sesión. La navegación de la web es 100% abierta.`
              : 'Accede para gestionar tus reservas en Reformer, tus créditos y tu progreso postural.'}
          </p>
        </div>

        {/* Contextual Notice */}
        <div className="mb-4 p-2.5 bg-[#FAF2E8] border border-[#E4DED4] rounded-xl flex items-center gap-2 text-[11px] text-[#6B655C]">
          <Sparkles className="w-3.5 h-3.5 text-[#B5654A] shrink-0" />
          <span>
            Puedes ver horarios, tarifas y fotos libremente. Solo requieres cuenta para <strong>agendar cupos o comprar membresías</strong>.
          </span>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#EFE9DF] rounded-xl border border-[#DDD5C9] mb-4 text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg('');
            }}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-[#B5654A] text-white shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear cuenta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
            }}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-[#1A1815] text-white shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Ingresar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('google');
              setErrorMsg('');
            }}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'google'
                ? 'bg-white text-[#1A1815] shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815]'
            }`}
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
            <span>Google</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 text-xs text-[#9A5340] bg-[#9A5340]/10 border border-[#9A5340]/20 p-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="overflow-y-auto pr-1 flex-1">
          {/* -------------------------------------------------------------
              TAB 1: CREAR CUENTA NUEVA CON CORREO & CONTRASEÑA
              ------------------------------------------------------------- */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                  Nombre y Apellido <span className="text-[#B5654A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Ej. Sofía Montaner"
                  className="w-full bg-white border border-[#DDD5C9] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                  Correo Electrónico <span className="text-[#B5654A]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#6B655C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                  Celular / WhatsApp <span className="text-[10px] text-[#6B655C] font-normal">(Para avisos de cupo y recordatorios)</span>
                </label>
                <input
                  type="tel"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  placeholder="+51 984 123 456"
                  className="w-full bg-white border border-[#DDD5C9] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                  Crear Contraseña <span className="text-[#B5654A]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] transition-colors"
                  />
                  <Key className="w-4 h-4 text-[#6B655C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F1ECE5] text-[11px] text-[#6B655C] flex items-center gap-2 border border-[#E4DED4]">
                <Users className="w-4 h-4 text-[#B5654A] shrink-0" />
                <span>
                  Tu cuenta guarda tu historial de clases, tus créditos y tu cama Reformer asignada.
                </span>
              </div>

              <button
                type="submit"
                disabled={loadingAccountId !== null}
                className="w-full py-3 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingAccountId === 'register' ? (
                  <span>Creando tu cuenta...</span>
                ) : (
                  <>
                    <span>Crear Cuenta y Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-[#6B655C] hover:text-[#B5654A] transition-colors cursor-pointer"
                >
                  ¿Ya tienes cuenta creada? <span className="font-semibold underline">Inicia sesión aquí</span>
                </button>
              </div>
            </form>
          )}

          {/* -------------------------------------------------------------
              TAB 2: INICIAR SESIÓN CON CORREO & CONTRASEÑA
              ------------------------------------------------------------- */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#6B655C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Tu clave secreta"
                    className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] transition-colors"
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
                disabled={loadingAccountId !== null}
                className="w-full py-3 px-4 rounded-xl bg-[#1A1815] hover:bg-[#322C27] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingAccountId === 'login' ? (
                  <span>Verificando...</span>
                ) : (
                  <>
                    <span>Ingresar a mi Cuenta</span>
                    <ArrowRight className="w-4 h-4 text-[#B5654A]" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-xs text-[#6B655C] hover:text-[#B5654A] transition-colors cursor-pointer"
                >
                  ¿No tienes cuenta aún? <span className="font-semibold underline">Regístrate en 30 segundos</span>
                </button>
              </div>
            </form>
          )}

          {/* -------------------------------------------------------------
              TAB 3: GOOGLE RÁPIDO (1 CLIC)
              ------------------------------------------------------------- */}
          {authMode === 'google' && (
            <div className="space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B655C] block">
                Selecciona tu perfil de alumna:
              </span>

              {MOCK_GMAIL_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  disabled={loadingAccountId !== null}
                  className="w-full bg-white hover:bg-[#F1ECE5] border border-[#DDD5C9] p-3 rounded-xl flex items-center justify-between transition-colors text-left group cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E4DED4]"
                    />
                    <div>
                      <div className="font-medium text-sm text-[#1A1815] group-hover:text-[#B5654A] transition-colors flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded-full">
                          Alumna
                        </span>
                      </div>
                      <div className="text-xs text-[#6B655C]">{acc.email}</div>
                    </div>
                  </div>

                  <div>
                    {loadingAccountId === acc.id ? (
                      <span className="text-xs font-medium text-[#B5654A] animate-pulse">
                        Accediendo...
                      </span>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-[#6B655C] group-hover:text-[#B5654A] group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                </button>
              ))}

              <div className="pt-2 border-t border-[#E4DED4]">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#B5654A]/50 text-[#B5654A] hover:bg-[#B5654A]/5 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Crear cuenta con otro correo</span>
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              TAB 4: EQUIPO STAFF
              ------------------------------------------------------------- */}
          {authMode === 'staff' && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B655C] block">
                Accesos administrativos autorizados:
              </span>

              {PREDEFINED_STAFF.map((staff) => {
                const isOwnerDev = staff.role === 'owner_dev';
                return (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => handleSelectStaff(staff)}
                    disabled={loadingAccountId !== null}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left group cursor-pointer disabled:opacity-50 ${
                      isOwnerDev
                        ? 'bg-[#1A1815] text-[#FAF8F5] border-[#B5654A]/60 hover:border-[#B5654A]'
                        : 'bg-white hover:bg-[#F1ECE5] border-[#DDD5C9] text-[#1A1815]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className={`w-10 h-10 rounded-full object-cover border ${
                          isOwnerDev ? 'border-[#B5654A]' : 'border-[#E4DED4]'
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-1.5">
                          <span className={isOwnerDev ? 'text-[#FAF8F5]' : 'text-[#1A1815]'}>
                            {staff.name}
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm border ${
                              isOwnerDev
                                ? 'bg-[#B5654A] text-white border-[#B5654A]'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {isOwnerDev ? 'Owner Dev' : 'Admin'}
                          </span>
                        </div>
                        <div className={`text-xs ${isOwnerDev ? 'text-[#C9C3BA]' : 'text-[#6B655C]'}`}>
                          {staff.email}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isOwnerDev ? 'text-[#B5654A]' : 'text-[#8C8479]'}`}>
                          {staff.roleTitle}
                        </div>
                      </div>
                    </div>

                    <div>
                      {loadingAccountId === staff.id ? (
                        <span className="text-xs font-medium text-[#B5654A] animate-pulse">
                          Conectando...
                        </span>
                      ) : (
                        <ArrowRight
                          className={`w-4 h-4 transition-all group-hover:translate-x-1 ${
                            isOwnerDev ? 'text-[#B5654A]' : 'text-[#6B655C] group-hover:text-[#B5654A]'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & Staff switcher */}
        <div className="mt-4 pt-3 border-t border-[#E4DED4] flex items-center justify-between text-[11px] text-[#6B655C]">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Conexión cifrada de estudio</span>
          </div>

          <button
            type="button"
            onClick={() => setAuthMode(authMode === 'staff' ? 'register' : 'staff')}
            className="text-[10px] text-[#6B655C] hover:text-[#B5654A] underline cursor-pointer"
          >
            {authMode === 'staff' ? '← Volver a Alumnas' : 'Acceso Staff'}
          </button>
        </div>
      </div>
    </div>
  );
};
