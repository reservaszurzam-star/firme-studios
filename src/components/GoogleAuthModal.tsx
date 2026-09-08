import React, { useState } from 'react';
import {
  X,
  Check,
  ArrowRight,
  UserPlus,
  Shield,
  Sparkles,
  Terminal,
  ShieldCheck,
  Users,
  Building2,
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
  const [activeRoleCategory, setActiveRoleCategory] = useState<'clientes' | 'staff'>('clientes');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [loadingAccountId, setLoadingAccountId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Acceso para Alumnas / Clientes (Rol estricto: 'client')
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
      // Los clientes no tienen acceso al portal administrativo
      sessionStorage.removeItem('firme_admin_logged');
      setLoadingAccountId(null);
      onSuccess(authUser);
      onClose();
    }, 700);
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
    }, 700);
  };

  // Registro de nueva cuenta (por defecto cliente, salvo coincidencia de staff)
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre');
      return;
    }
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorMsg('Ingresa un correo Gmail válido');
      return;
    }

    setLoadingAccountId('custom');
    setErrorMsg('');

    setTimeout(() => {
      const email = customEmail.toLowerCase().includes('@')
        ? customEmail.trim()
        : `${customEmail.trim()}@gmail.com`;

      // Los usuarios que se registran son por defecto CLIENTES
      const { role, roleTitle } = determineUserRole(customName, email);

      const authUser: AuthUser = {
        id: `g-custom-${Date.now()}`,
        name: customName.trim(),
        email: email,
        role: role,
        roleTitle: roleTitle,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName)}&background=B5654A&color=fff`,
        provider: 'google',
        phone: customPhone.trim() || '+51 900 000 000',
        planName: role === 'client' ? 'Nuevo Alumno' : roleTitle,
        creditsLeft: role === 'client' ? 0 : 99,
        experienceLevel: 'Principiante',
        healthConditions: ['Ninguna'],
      };

      localStorage.setItem('firme_auth_user', JSON.stringify(authUser));
      if (role === 'owner_dev' || role === 'admin') {
        sessionStorage.setItem('firme_admin_logged', 'true');
      } else {
        sessionStorage.removeItem('firme_admin_logged');
      }

      setLoadingAccountId(null);
      onSuccess(authUser);
      onClose();
    }, 800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-xl border border-[#E4DED4] p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden text-[#1A1815]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors"
          aria-label="Cerrar modal de Google"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="flex flex-col items-center text-center mb-6 pt-1">
          {/* Official Google G SVG */}
          <div className="w-12 h-12 bg-white rounded-full shadow-xs border border-gray-200 flex items-center justify-center mb-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
          </div>

          <h3 className="font-fraunces text-2xl text-[#1A1815] font-medium">
            Acceder con Google
          </h3>
          <p className="text-xs text-[#6B655C] mt-1">
            Usa tu cuenta de Gmail {purpose}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 text-xs text-[#9A5340] bg-[#9A5340]/10 border border-[#9A5340]/20 p-2.5 rounded-md">
            {errorMsg}
          </div>
        )}

        {!isCustomMode ? (
          <div>
            {/* Role Tab Selector */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F1ECE5] rounded-lg border border-[#E4DED4] mb-4">
              <button
                type="button"
                onClick={() => setActiveRoleCategory('clientes')}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeRoleCategory === 'clientes'
                    ? 'bg-white text-[#1A1815] shadow-xs'
                    : 'text-[#6B655C] hover:text-[#1A1815]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#B5654A]" />
                <span>Alumnas (Clientes)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRoleCategory('staff')}
                className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeRoleCategory === 'staff'
                    ? 'bg-[#1A1815] text-[#FAF8F5] shadow-xs'
                    : 'text-[#6B655C] hover:text-[#1A1815]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#B5654A]" />
                <span>Equipo Staff</span>
              </button>
            </div>

            {activeRoleCategory === 'clientes' ? (
              <>
                {/* Client Account Selector List */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between px-1 mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B655C]">
                      Cuentas de alumnas de prueba:
                    </span>
                    <span className="text-[10px] bg-[#E4DED4] text-[#1A1815] px-1.5 py-0.5 rounded-full font-medium">
                      Rol: Cliente
                    </span>
                  </div>

                  {MOCK_GMAIL_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc)}
                      disabled={loadingAccountId !== null}
                      className="w-full bg-white hover:bg-[#F1ECE5] border border-[#E4DED4] p-3 rounded-lg flex items-center justify-between transition-colors text-left group cursor-pointer disabled:opacity-50"
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
                </div>

                {/* Custom Google Account button */}
                <div className="pt-2 border-t border-[#E4DED4]">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(true)}
                    className="w-full py-2.5 px-3 rounded-lg border border-dashed border-[#B5654A]/40 text-[#B5654A] hover:bg-[#B5654A]/5 text-xs font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Crear nueva cuenta / Otro Gmail (Cliente)</span>
                  </button>
                </div>
              </>
            ) : (
              /* Staff Account List */
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between px-1 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B655C]">
                    Accesos autorizados del estudio:
                  </span>
                  <span className="text-[10px] bg-[#B5654A]/15 text-[#B5654A] px-1.5 py-0.5 rounded-full font-semibold">
                    Staff
                  </span>
                </div>

                {PREDEFINED_STAFF.map((staff) => {
                  const isOwnerDev = staff.role === 'owner_dev';
                  return (
                    <button
                      key={staff.id}
                      onClick={() => handleSelectStaff(staff)}
                      disabled={loadingAccountId !== null}
                      className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all text-left group cursor-pointer disabled:opacity-50 ${
                        isOwnerDev
                          ? 'bg-[#1A1815] text-[#FAF8F5] border-[#B5654A]/60 hover:border-[#B5654A]'
                          : 'bg-white hover:bg-[#F1ECE5] border-[#E4DED4] text-[#1A1815]'
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
                              {staff.role === 'owner_dev' ? 'Owner Dev' : 'Admin'}
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

                <div className="p-2.5 rounded-lg bg-[#FAF2E8] border border-[#E4DED4] text-[11px] text-[#6B655C] leading-relaxed">
                  <span className="font-semibold text-[#1A1815]">Regla de roles: </span>
                  <span className="text-[#B5654A] font-medium">Valentino</span> tiene acceso total incluyendo módulo Backend/APIs. <span className="text-emerald-800 font-medium">Soni y Keyla</span> gestionan clientes, agenda, caja y WhatsApp.
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Custom Account Form */
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#6B655C] mb-1">
                Nombre y Apellido
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ej. Camila Torres"
                className="w-full bg-white border border-[#E4DED4] rounded-md px-3 py-2 text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B655C] mb-1">
                Correo de Gmail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="tu.nombre@gmail.com"
                  className="w-full bg-white border border-[#E4DED4] rounded-md px-3 py-2 text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B655C] mb-1">
                Celular / WhatsApp <span className="text-[11px] text-[#6B655C]/70">(opcional)</span>
              </label>
              <input
                type="tel"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="+51 912 345 678"
                className="w-full bg-white border border-[#E4DED4] rounded-md px-3 py-2 text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
              />
            </div>

            <div className="p-2.5 rounded bg-[#F1ECE5] text-[11px] text-[#6B655C] flex items-center gap-1.5 border border-[#E4DED4]">
              <Users className="w-3.5 h-3.5 text-[#B5654A] shrink-0" />
              <span>Toda cuenta nueva se registra como <strong>Alumna / Cliente</strong> para reservar clases y sumar EXP.</span>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="w-1/3 py-2.5 px-3 rounded-md border border-[#E4DED4] text-xs font-medium text-[#6B655C] hover:bg-[#F1ECE5] transition-colors"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={loadingAccountId !== null}
                className="w-2/3 py-2.5 px-4 rounded-md bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-medium transition-colors shadow-xs"
              >
                {loadingAccountId === 'custom' ? 'Iniciando sesión...' : 'Continuar con este Gmail'}
              </button>
            </div>
          </form>
        )}

        {/* Security / Privacy notice */}
        <div className="mt-5 pt-3 border-t border-[#E4DED4] flex items-center justify-center space-x-1.5 text-[11px] text-[#6B655C]">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Inicio seguro certificado con Google OAuth 2.0 (Simulado)</span>
        </div>
      </div>
    </div>
  );
};
