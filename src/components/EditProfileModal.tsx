import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  HeartPulse,
  Save,
  Check,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { AuthUser } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onSave: (updatedUser: AuthUser) => void;
}

const COMMON_HEALTH_CONDITIONS = [
  'Ninguna',
  'Lumbalgia',
  'Hernia Discal',
  'Lesión de Rodilla',
  'Cervicalgia',
  'Embarazo',
  'Post-Parto',
  'Hipertensión',
  'Problemas Articulares',
  'Escoliosis',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) => {
  const [activeSection, setActiveSection] = useState<'personal' | 'salud' | 'avatar'>('personal');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentType, setDocumentType] = useState<'dni' | 'ce' | 'pasaporte'>('dni');
  const [dni, setDni] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'femenino' | 'masculino' | 'otro'>('femenino');
  const [experienceLevel, setExperienceLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Principiante');
  const [avatar, setAvatar] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [healthConditions, setHealthConditions] = useState<string[]>(['Ninguna']);
  const [medicalNotes, setMedicalNotes] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setDocumentType(currentUser.documentType || 'dni');
      setDni(currentUser.dni || '');
      setBirthDate(currentUser.birthDate || '');
      setGender(currentUser.gender || 'femenino');
      setExperienceLevel(currentUser.experienceLevel || 'Principiante');
      setAvatar(currentUser.avatar || '');
      setEmergencyContact(currentUser.emergencyContact || '');
      setEmergencyPhone(currentUser.emergencyPhone || '');
      setHealthConditions(
        currentUser.healthConditions && currentUser.healthConditions.length > 0
          ? currentUser.healthConditions
          : ['Ninguna']
      );
      setMedicalNotes(currentUser.medicalNotes || '');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const toggleCondition = (cond: string) => {
    if (cond === 'Ninguna') {
      setHealthConditions(['Ninguna']);
      return;
    }
    const filtered = healthConditions.filter((c) => c !== 'Ninguna');
    if (filtered.includes(cond)) {
      const next = filtered.filter((c) => c !== cond);
      setHealthConditions(next.length === 0 ? ['Ninguna'] : next);
    } else {
      setHealthConditions([...filtered, cond]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: AuthUser = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      phone: phone.trim(),
      documentType,
      dni: dni.trim(),
      birthDate,
      gender,
      experienceLevel,
      avatar: avatar.trim(),
      emergencyContact: emergencyContact.trim(),
      emergencyPhone: emergencyPhone.trim(),
      healthConditions,
      medicalNotes: medicalNotes.trim(),
    };

    onSave(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1815]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-3xl border border-[#DDD5C9] shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden text-[#1A1815] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#E4DED4] bg-white/70 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B5654A]/10 border border-[#B5654A]/20 flex items-center justify-center text-[#B5654A]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fraunces text-xl sm:text-2xl font-semibold text-[#1A1815]">
                  Editar Datos del Perfil
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF2E8] border border-[#B5654A]/30 text-[#B5654A]">
                  {currentUser.roleTitle || 'Alumna'}
                </span>
              </div>
              <p className="text-xs text-[#6B655C]">
                Actualiza tu información personal, contacto de emergencia y ficha de salud.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-[#E4DED4] bg-[#FAF8F5] px-4 sm:px-6 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSection('personal')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'personal'
                ? 'border-[#B5654A] text-[#B5654A]'
                : 'border-transparent text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Datos Personales</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('salud')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'salud'
                ? 'border-[#B5654A] text-[#B5654A]'
                : 'border-transparent text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Salud & Emergencia</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('avatar')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'avatar'
                ? 'border-[#B5654A] text-[#B5654A]'
                : 'border-transparent text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Foto & Nivel</span>
          </button>
        </div>

        {/* Modal Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Section 1: Datos Personales */}
          {activeSection === 'personal' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Nombre Completo */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C8479] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Valeria Gómez"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-xs sm:text-sm text-[#1A1815] placeholder:text-[#8C8479] focus:outline-hidden focus:border-[#B5654A] focus:ring-1 focus:ring-[#B5654A] shadow-2xs"
                  />
                </div>
              </div>

              {/* Email (Solo Lectura) */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                  Correo Electrónico (Asociado a la cuenta)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C8479] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F1ECE5] border border-[#DDD5C9] rounded-xl text-xs sm:text-sm text-[#6B655C] cursor-not-allowed select-none"
                  />
                </div>
                <span className="text-[10px] text-[#8C8479] mt-1 block">
                  El correo es el identificador único de inicio de sesión.
                </span>
              </div>

              {/* Teléfono y Documento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8C8479] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+51 987 654 321"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-xs sm:text-sm text-[#1A1815] placeholder:text-[#8C8479] focus:outline-hidden focus:border-[#B5654A] focus:ring-1 focus:ring-[#B5654A] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Documento (DNI / CE) */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                    Documento de Identidad
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as any)}
                      className="bg-white border border-[#DDD5C9] rounded-xl px-2 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    >
                      <option value="dni">DNI</option>
                      <option value="ce">CE</option>
                      <option value="pasaporte">Pasaporte</option>
                    </select>
                    <div className="relative flex-1">
                      <CreditCard className="w-4 h-4 text-[#8C8479] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        placeholder="71234567"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-xs sm:text-sm text-[#1A1815] placeholder:text-[#8C8479] focus:outline-hidden focus:border-[#B5654A] focus:ring-1 focus:ring-[#B5654A] shadow-2xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fecha Nacimiento y Género */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                    Fecha de Nacimiento
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#8C8479] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                    Género
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] shadow-2xs"
                  >
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="otro">Otro / Prefiero no decir</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Salud & Emergencia */}
          {activeSection === 'salud' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Los instructores de Reformer consultan esta información antes de cada clase para adaptar resortes, ángulos y posturas a tu anatomía.
                </span>
              </div>

              {/* Condiciones Médicas (Chips) */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-2">
                  Condiciones Físicas o Lesiones:
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_HEALTH_CONDITIONS.map((cond) => {
                    const isSelected = healthConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleCondition(cond)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#B5654A] text-white border-[#B5654A] shadow-2xs'
                            : 'bg-white text-[#6B655C] border-[#DDD5C9] hover:border-[#B5654A]/50'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        <span>{cond}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Observaciones Médicas Específicas */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                  Notas de Salud para el Profesor (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Ej. Molestia en hombro izquierdo al realizar extensiones altas..."
                  className="w-full p-3 bg-white border border-[#DDD5C9] rounded-xl text-xs sm:text-sm text-[#1A1815] placeholder:text-[#8C8479] focus:outline-hidden focus:border-[#B5654A] focus:ring-1 focus:ring-[#B5654A] shadow-2xs"
                />
              </div>

              {/* Contacto de Emergencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#E4DED4]">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                    Contacto de Emergencia (Nombre)
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Ej. Juan Pérez (Hermano)"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-xs sm:text-sm text-[#1A1815] placeholder:text-[#8C8479] focus:outline-hidden focus:border-[#B5654A] shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                    Teléfono de Emergencia
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+51 999 888 777"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-xs sm:text-sm text-[#1A1815] placeholder:text-[#8C8479] focus:outline-hidden focus:border-[#B5654A] shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Foto & Nivel */}
          {activeSection === 'avatar' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Preview Avatar */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#DDD5C9]">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#B5654A] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#B5654A] text-white flex items-center justify-center font-fraunces text-2xl shrink-0">
                    {name.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm text-[#1A1815]">{name || 'Tu Nombre'}</div>
                  <div className="text-xs text-[#6B655C]">Nivel: {experienceLevel}</div>
                  <div className="text-[10px] text-[#B5654A] font-medium mt-0.5">
                    {currentUser.planName || 'Pase Regular'} · {currentUser.creditsLeft ?? 0} clases
                  </div>
                </div>
              </div>

              {/* Nivel de Experiencia */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                  Nivel de Práctica en Pilates Reformer
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Principiante', 'Intermedio', 'Avanzado'] as const).map((lvl) => {
                    const isSelected = experienceLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperienceLevel(lvl)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#1A1815] text-[#FAF8F5] border-[#B5654A]'
                            : 'bg-white hover:bg-[#FAF8F5] text-[#1A1815] border-[#DDD5C9]'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* URL de Avatar Personalizada */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                  URL de Imagen de Perfil
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://ejemplo.com/tu-foto.jpg"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-xs sm:text-sm text-[#1A1815] placeholder:text-[#8C8479] focus:outline-hidden focus:border-[#B5654A] shadow-2xs"
                />
              </div>

              {/* Preset Avatars */}
              <div>
                <span className="block text-xs font-semibold text-[#1A1815] mb-2">
                  O elige uno de nuestros avatares sugeridos:
                </span>
                <div className="flex items-center gap-3">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 cursor-pointer ${
                        avatar === url ? 'border-[#B5654A] ring-2 ring-[#B5654A]/30 scale-105' : 'border-[#DDD5C9]'
                      }`}
                    >
                      <img src={url} alt={`Avatar preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E4DED4] flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#DDD5C9] bg-white hover:bg-[#F1ECE5] text-[#6B655C] hover:text-[#1A1815] text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={savedSuccess}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#B5654A] hover:bg-[#9A5340]'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Datos Guardados!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
