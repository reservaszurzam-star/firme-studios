import React, { useState } from 'react';
import { Instagram, Music, MessageCircle, MapPin, Phone, Mail, X, Lock, BookOpen, ShieldCheck } from 'lucide-react';
import { MainTabType } from '../types';
import { LibroReclamacionesModal } from './LibroReclamacionesModal';
import { LegalModals, LegalDocType } from './LegalModals';

interface FooterProps {
  onSelectTab?: (tab: MainTabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType | null>(null);
  const [isLibroOpen, setIsLibroOpen] = useState(false);

  const handleLinkClick = (tab: MainTabType) => {
    if (onSelectTab) {
      onSelectTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="footer-section"
      className="w-full bg-[#F1ECE5] border-t border-[#E4DED4] pt-16 pb-12 text-[#6B655C]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-[#E4DED4]">
          
          {/* Col 1: Marca (Logo + Dirección + Teléfono) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/firme-studio-logo.svg"
                alt="FIRME STUDIO"
                className="w-12 h-12 rounded-full object-contain shadow-xs border border-[#DDD5C9]"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-xs uppercase tracking-widest text-[#B5654A] font-semibold block">
                  Pilates Boutique
                </span>
                <span className="text-[11px] text-[#6B655C]">
                  LIMA - SJL
                </span>
              </div>
            </div>
            
            <p className="text-xs leading-relaxed text-[#6B655C]">
              Espacio boutique de Pilates Reformer, Tower y Cadillac enfocado en biomecánica consciente y salud postural.
            </p>

            <div className="space-y-2 pt-1 text-xs text-[#6B655C]">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-[#B5654A] mr-2 shrink-0 mt-0.5" />
                <span>Jr. Akapana 1261, Lima - SJL</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-[#B5654A] mr-2 shrink-0" />
                <span>+51 (1) 719-4820</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-[#B5654A] mr-2 shrink-0" />
                <span>hola@firmestudio.pe</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navegación */}
          <div>
            <h4 className="font-fraunces text-base text-[#1A1815] font-medium mb-4">
              Pestañas
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('inicio')}
                  className="hover:text-[#B5654A] transition-colors cursor-pointer text-left"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('horarios')}
                  className="hover:text-[#B5654A] transition-colors cursor-pointer text-left"
                >
                  Horarios y Reservas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('mis-clases')}
                  className="hover:text-[#B5654A] transition-colors cursor-pointer text-left"
                >
                  Mis Clases Reservadas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('niveles')}
                  className="hover:text-[#B5654A] transition-colors cursor-pointer text-left inline-flex items-center gap-1"
                >
                  <span>Mi Nivel & EXP (Logros)</span>
                  <span className="text-[10px] bg-[#B5654A]/20 text-[#B5654A] px-1.5 py-0.2 rounded-full font-bold">Nuevo</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('membresias')}
                  className="hover:text-[#B5654A] transition-colors cursor-pointer text-left"
                >
                  Membresías y Precios
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('profesores')}
                  className="hover:text-[#B5654A] transition-colors cursor-pointer text-left"
                >
                  Equipo Docente
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('metodo')}
                  className="hover:text-[#B5654A] transition-colors cursor-pointer text-left"
                >
                  Método & Primeros Pasos
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h4 className="font-fraunces text-base text-[#1A1815] font-medium mb-4">
              Legal & Normas
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm mb-4">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalDoc('cancellation')}
                  className="hover:text-[#B5654A] transition-colors text-left cursor-pointer"
                >
                  Política de cancelación (12h)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalDoc('privacy')}
                  className="hover:text-[#B5654A] transition-colors text-left cursor-pointer"
                >
                  Privacidad y Datos (Ley 29733)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalDoc('terms')}
                  className="hover:text-[#B5654A] transition-colors text-left cursor-pointer"
                >
                  Términos de servicio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalDoc('rules')}
                  className="hover:text-[#B5654A] transition-colors text-left cursor-pointer"
                >
                  Normas de convivencia en sala
                </button>
              </li>
            </ul>

            {/* INDECOPI - Libro de Reclamaciones Button Banner */}
            <button
              type="button"
              onClick={() => setIsLibroOpen(true)}
              className="w-full bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 border border-[#E4DED4] hover:border-[#B5654A] p-2.5 rounded-xl transition-all flex items-center gap-2.5 text-left group shadow-2xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center shrink-0 border border-[#B5654A]/20 group-hover:bg-[#B5654A] group-hover:text-white transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#1A1815] block group-hover:text-[#B5654A] transition-colors">
                  Libro de Reclamaciones
                </span>
                <span className="text-[9px] text-[#6B655C] block">
                  Virtual · D.S. N° 011-2011-PCM
                </span>
              </div>
            </button>
          </div>

          {/* Col 4: Redes Sociales */}
          <div>
            <h4 className="font-fraunces text-base text-[#1A1815] font-medium mb-4">
              Conexión
            </h4>
            <p className="text-xs text-[#6B655C] mb-4">
              Sigue nuestra rutina diaria y escucha nuestras selecciones sonoras para el estudio.
            </p>

            <div className="flex items-center space-x-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram de FIRME STUDIO"
                className="w-9 h-9 rounded-md bg-[#FAF8F5] border border-[#E4DED4] flex items-center justify-center text-[#1A1815] hover:text-[#B5654A] hover:border-[#B5654A] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://spotify.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Playlist de Spotify de FIRME STUDIO"
                className="w-9 h-9 rounded-md bg-[#FAF8F5] border border-[#E4DED4] flex items-center justify-center text-[#1A1815] hover:text-[#B5654A] hover:border-[#B5654A] transition-colors"
              >
                <Music className="w-4 h-4" />
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp de contacto FIRME STUDIO"
                className="w-9 h-9 rounded-md bg-[#FAF8F5] border border-[#E4DED4] flex items-center justify-center text-[#1A1815] hover:text-[#B5654A] hover:border-[#B5654A] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4DED4]">
              <span className="text-[11px] text-[#6B655C] block">
                Horario de atención:
              </span>
              <span className="text-xs text-[#1A1815] font-medium">
                Lun a Vie: 07:00 – 21:00 | Sáb: 09:00 – 14:00
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B655C] gap-3">
          <span>
            © {new Date().getFullYear()} FIRME STUDIO S.A.C. · LIMA - SJL
          </span>
          <span className="font-fraunces italic text-[#B5654A]">
            Pilates, con intención.
          </span>
        </div>

      </div>

      {/* Modales Legales y Cumplimiento Normativo (Perú) */}
      <LegalModals
        type={activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
      />

      <LibroReclamacionesModal
        isOpen={isLibroOpen}
        onClose={() => setIsLibroOpen(false)}
      />
    </footer>
  );
};
