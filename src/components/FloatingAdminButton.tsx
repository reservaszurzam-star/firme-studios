import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { AuthUser, MainTabType } from '../types';

interface FloatingAdminButtonProps {
  currentUser: AuthUser | null;
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
}

/**
 * Boton flotante exclusivo para el equipo Staff (Owner / Dev y Administradoras).
 * Completamente invisible para alumnas (rol 'client') o usuarios no autenticados.
 */
export const FloatingAdminButton: React.FC<FloatingAdminButtonProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
}) => {
  // Verificacion estricta de rol Staff: Solo 'owner_dev' y 'admin'
  const isStaff = currentUser?.role === 'owner_dev' || currentUser?.role === 'admin';
  if (!isStaff) return null;

  const isOwnerDev = currentUser?.role === 'owner_dev';
  const isAdminActive = activeTab === 'admin';

  const handleClick = () => {
    if (isAdminActive) {
      // Si ya esta dentro del panel admin, permite volver a la web publica
      onSelectTab('inicio');
    } else {
      // Ingresar al panel administrativo
      onSelectTab('admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside
      aria-label="Acceso flotante exclusivo Staff FIRME STUDIO"
      className="fixed bottom-6 left-6 z-40 sm:bottom-8 sm:left-8 select-none"
    >
      <button
        type="button"
        id="floating-admin-btn"
        onClick={handleClick}
        className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border ${
          isAdminActive
            ? 'bg-[#B5654A] text-white border-white/30 hover:bg-[#9A5340]'
            : 'bg-[#1A1815]/95 backdrop-blur-md text-[#FAF8F5] border-[#B5654A]/50 hover:border-[#B5654A] hover:shadow-[#B5654A]/25'
        }`}
        title={
          isAdminActive
            ? 'Volver al Sitio Web Publico'
            : `Abrir Panel de Administracion (${isOwnerDev ? 'Owner / Dev' : 'Administracion'})`
        }
      >
        {/* Indicador de Estado y Pulso */}
        <div className="relative flex items-center justify-center">
          {isAdminActive ? (
            <ArrowLeft className="w-4 h-4 text-white transition-transform group-hover:-translate-x-0.5" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-[#B5654A] group-hover:text-amber-300 transition-colors" />
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping ${
                  isOwnerDev ? 'bg-[#B5654A]' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                  isOwnerDev ? 'bg-[#B5654A]' : 'bg-emerald-500'
                }`}
              />
            </>
          )}
        </div>

        {/* Texto Principal */}
        <div className="flex flex-col items-start leading-none text-left">
          <span className="font-fraunces text-xs font-semibold tracking-wide flex items-center gap-1.5">
            {isAdminActive ? 'Salir a la Web' : 'Panel Admin'}
          </span>
          <span className="text-[9px] text-[#AFA79C] group-hover:text-[#DDD5C9] transition-colors mt-0.5 font-medium">
            {isAdminActive ? 'Ver modo alumna' : currentUser?.name?.split(' ')[0] || 'Staff'}
          </span>
        </div>

        {/* Badge de Rol */}
        <span
          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider shadow-2xs ${
            isAdminActive
              ? 'bg-white/20 text-white'
              : isOwnerDev
              ? 'bg-[#B5654A] text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {isAdminActive ? 'Activo' : isOwnerDev ? 'Owner' : 'Admin'}
        </span>
      </button>
    </aside>
  );
};
