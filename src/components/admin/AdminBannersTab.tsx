import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CarouselBanner, CarouselSettings } from '../../types';
import {
  getStoredBanners,
  saveStoredBanners,
  getStoredCarouselSettings,
  saveStoredCarouselSettings,
  CURATED_PRESET_IMAGES,
  INITIAL_CAROUSEL_BANNERS,
} from '../../data/bannerData';

export const AdminBannersTab: React.FC = () => {
  const [banners, setBanners] = useState<CarouselBanner[]>([]);
  const [settings, setSettings] = useState<CarouselSettings>(getStoredCarouselSettings());
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [previewTimerSeconds, setPreviewTimerSeconds] = useState(0);

  // Modal / Form state for new custom banner
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<CarouselBanner | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    url: string;
    tag: string;
    title: string;
    subtitle: string;
    locationLabel: string;
    capacityLabel: string;
    isActive: boolean;
  }>({
    url: '',
    tag: 'Sala Clásica Reformer',
    title: '',
    subtitle: '',
    locationLabel: 'FIRME STUDIO · LIMA - SJL',
    capacityLabel: 'Máx. 8 alumnos',
    isActive: true,
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Initial load
  useEffect(() => {
    const loaded = getStoredBanners();
    setBanners(loaded);
    setSettings(getStoredCarouselSettings());
  }, []);

  // Filter active banners for preview
  const activeBanners = banners.filter((b) => b.isActive);
  const currentPreviewBanner = activeBanners[activePreviewIndex] || activeBanners[0] || banners[0];

  // Preview cycle timer (simulated fast countdown or real time indicator)
  const totalIntervalSeconds = settings.intervalMinutes * 60;

  useEffect(() => {
    if (!settings.autoPlay || activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setPreviewTimerSeconds((prev) => {
        if (prev + 1 >= totalIntervalSeconds) {
          setActivePreviewIndex((curr) => (curr + 1) % activeBanners.length);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.autoPlay, activeBanners.length, totalIntervalSeconds]);

  // Handle re-save
  const handleUpdateBannersList = (updated: CarouselBanner[]) => {
    setBanners(updated);
    saveStoredBanners(updated);
  };

  const handleUpdateSettings = (updatedSettings: CarouselSettings) => {
    setSettings(updatedSettings);
    saveStoredCarouselSettings(updatedSettings);
    setPreviewTimerSeconds(0);
    showToast(`Intervalo de rotación configurado a ${updatedSettings.intervalMinutes} minutos.`);
  };

  // Toggle active
  const handleToggleActive = (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b));
    handleUpdateBannersList(updated);
    showToast('Estado de la imagen actualizado');
  };

  // Move order
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-assign order numbers
    const reordered = updated.map((b, idx) => ({ ...b, order: idx + 1 }));
    handleUpdateBannersList(reordered);
  };

  // Delete
  const handleDeleteBanner = (id: string, title: string) => {
    if (banners.length <= 1) {
      alert('Debe existir al menos 1 imagen en la configuración del carrusel.');
      return;
    }
    if (window.confirm(`¿Deseas eliminar la imagen "${title}" del carrusel?`)) {
      const updated = banners.filter((b) => b.id !== id);
      handleUpdateBannersList(updated);
      showToast('Imagen eliminada del carrusel');
    }
  };

  // Add custom
  const handleSaveCustomBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim() || !formData.title.trim()) {
      alert('Por favor ingresa la URL de la imagen y el título principal.');
      return;
    }

    if (editingBanner) {
      // Edit existing
      const updated = banners.map((b) =>
        b.id === editingBanner.id
          ? {
              ...b,
              url: formData.url.trim(),
              tag: formData.tag.trim() || 'Sala Clásica Reformer',
              title: formData.title.trim(),
              subtitle: formData.subtitle.trim(),
              locationLabel: formData.locationLabel.trim() || 'FIRME STUDIO · LIMA - SJL',
              capacityLabel: formData.capacityLabel.trim() || 'Máx. 8 alumnos',
              isActive: formData.isActive,
            }
          : b
      );
      handleUpdateBannersList(updated);
      showToast('Imagen editada correctamente');
    } else {
      // Create new
      const newBanner: CarouselBanner = {
        id: `banner-${Date.now()}`,
        url: formData.url.trim(),
        tag: formData.tag.trim() || 'Sala Clásica Reformer',
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        locationLabel: formData.locationLabel.trim() || 'FIRME STUDIO · LIMA - SJL',
        capacityLabel: formData.capacityLabel.trim() || 'Máx. 8 alumnos',
        isActive: formData.isActive,
        order: banners.length + 1,
      };
      handleUpdateBannersList([...banners, newBanner]);
      showToast('Nueva imagen agregada al carrusel de portada');
    }

    setShowAddModal(false);
    setEditingBanner(null);
  };

  // Add preset from curated library
  const handleAddPreset = (preset: typeof CURATED_PRESET_IMAGES[0]) => {
    const exists = banners.some((b) => b.url === preset.url);
    if (exists) {
      showToast('Esta foto ya se encuentra activa en tu lista de carrusel.');
      return;
    }

    const newBanner: CarouselBanner = {
      id: `banner-preset-${Date.now()}`,
      url: preset.url,
      tag: preset.suggestedTag,
      title: preset.suggestedTitle,
      subtitle: preset.suggestedSubtitle,
      locationLabel: 'FIRME STUDIO · LIMA - SJL',
      capacityLabel: 'Allegro 2 Reformer',
      isActive: true,
      order: banners.length + 1,
    };

    handleUpdateBannersList([...banners, newBanner]);
    showToast(`Fotografía "${preset.name}" agregada exitosamente`);
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (window.confirm('¿Deseas restablecer el carrusel a las 5 imágenes originales de alta gama de FIRME STUDIO?')) {
      handleUpdateBannersList(INITIAL_CAROUSEL_BANNERS);
      handleUpdateSettings({ intervalMinutes: 4, autoPlay: true, showProgressBar: true });
      showToast('Carrusel restablecido a valores originales de fábrica');
    }
  };

  const handleOpenEdit = (banner: CarouselBanner) => {
    setEditingBanner(banner);
    setFormData({
      url: banner.url,
      tag: banner.tag,
      title: banner.title,
      subtitle: banner.subtitle,
      locationLabel: banner.locationLabel || 'FIRME STUDIO · LIMA - SJL',
      capacityLabel: banner.capacityLabel || 'Máx. 8 alumnos',
      isActive: banner.isActive,
    });
    setShowAddModal(true);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1815] text-[#FAF8F5] border border-[#B5654A] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#B5654A]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B5654A]/10 text-[#B5654A] text-xs font-semibold uppercase tracking-wider mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Gestor de Portadas & Experiencia Visual</span>
          </div>
          <h2 className="font-fraunces text-2xl font-medium text-[#1A1815]">
            Configuración de Imágenes del Carrusel (Hero)
          </h2>
          <p className="text-xs text-[#6B655C] mt-1 max-w-2xl">
            Controla las fotografías principales del banner de bienvenida. Las imágenes rotan automáticamente cada{' '}
            <strong className="text-[#1A1815]">{settings.intervalMinutes} minutos</strong> para mantener la web fresca y visualmente atractiva.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingBanner(null);
              setFormData({
                url: '',
                tag: 'Sala Clásica Reformer',
                title: 'Nueva Sesión de Reformer',
                subtitle: 'Movimiento consciente y control biomecánico.',
                locationLabel: 'FIRME STUDIO · LIMA - SJL',
                capacityLabel: 'Máx. 8 alumnos',
                isActive: true,
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Imagen Personalizada</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] text-xs font-medium rounded-xl border border-[#DDD5C9] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Restablecer fotos originales"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#6B655C]" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Left (Live Preview + Settings), Right (Images List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 cols): Live Preview Card & Timing Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Live Interactive Preview */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#B5654A]" />
                <h3 className="font-fraunces text-base font-semibold text-[#1A1815]">
                  Vista Previa en Vivo (Hero)
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono bg-[#E4DED4] px-2 py-0.5 rounded-md text-[#1A1815]">
                <Clock className="w-3 h-3 text-[#B5654A]" />
                <span>
                  {formatSeconds(totalIntervalSeconds - previewTimerSeconds)} restantes
                </span>
              </div>
            </div>

            {/* The Preview Hero Card */}
            {currentPreviewBanner ? (
              <div className="w-full aspect-[4/5] bg-[#1A1815] rounded-xl border border-[#E4DED4] relative overflow-hidden group shadow-md">
                <img
                  src={currentPreviewBanner.url}
                  alt={currentPreviewBanner.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to local image if URL fails
                    (e.target as HTMLImageElement).src = '/assets/hero-studio.jpg';
                  }}
                />

                {/* Dark Vignette & Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1815]/95 via-[#1A1815]/30 to-black/20 pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium text-[#1A1815] shadow-xs flex items-center space-x-1.5 border border-[#E4DED4]/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{currentPreviewBanner.tag}</span>
                </div>

                {/* Slide index pill */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-mono font-bold text-white border border-white/20">
                  {activePreviewIndex + 1} / {activeBanners.length}
                </div>

                {/* Bottom Content Area */}
                <div className="absolute bottom-0 inset-x-0 p-4 text-[#FAF8F5] space-y-2">
                  <span className="block font-fraunces text-base font-medium leading-tight">
                    {currentPreviewBanner.title}
                  </span>
                  <span className="block text-[11px] text-[#FAF8F5]/85 leading-relaxed line-clamp-2">
                    {currentPreviewBanner.subtitle}
                  </span>

                  <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px]">
                    <span className="tracking-widest uppercase text-white/70">
                      {currentPreviewBanner.locationLabel || 'FIRME STUDIO'}
                    </span>
                    <span className="text-[#E4DED4] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{currentPreviewBanner.capacityLabel || '8 Camas'}</span>
                    </span>
                  </div>

                  {/* 4-minute Progress Bar */}
                  {settings.showProgressBar && (
                    <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-[#B5654A] h-full transition-all duration-1000 ease-linear"
                        style={{
                          width: `${((previewTimerSeconds) / totalIntervalSeconds) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Left/Right manual slide triggers on preview */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePreviewIndex((curr) => (curr === 0 ? activeBanners.length - 1 : curr - 1));
                    setPreviewTimerSeconds(0);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                  title="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePreviewIndex((curr) => (curr + 1) % activeBanners.length);
                    setPreviewTimerSeconds(0);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                  title="Siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#F1ECE5] rounded-xl border border-[#E4DED4] text-xs text-[#6B655C]">
                No hay ninguna imagen activa en el carrusel.
              </div>
            )}
          </div>

          {/* Card 2: Carousel Interval & Behavior Settings */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#B5654A]" />
              <h3 className="font-fraunces text-base font-semibold text-[#1A1815]">
                Parámetros de Rotación Automática
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1815] mb-1">
                  Tiempo de cambio por fotografía:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 4, 5].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleUpdateSettings({ ...settings, intervalMinutes: mins })}
                      className={`py-2 px-3 rounded-xl font-bold text-center border transition-all cursor-pointer ${
                        settings.intervalMinutes === mins
                          ? 'bg-[#B5654A] text-white border-[#B5654A] shadow-xs ring-2 ring-[#B5654A]/30'
                          : 'bg-white text-[#1A1815] border-[#E4DED4] hover:bg-[#F1ECE5]'
                      }`}
                    >
                      <span>{mins} min</span>
                      {mins === 4 && <span className="block text-[9px] font-normal opacity-90">Sugerido</span>}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#6B655C] mt-1.5">
                  Actualmente configurado a <strong>{settings.intervalMinutes} minutos</strong> por imagen ({settings.intervalMinutes * 60} segundos).
                </p>
              </div>

              <div className="pt-3 border-t border-[#E4DED4] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#1A1815] block">Rotación automática continua</span>
                  <span className="text-[11px] text-[#6B655C]">Cambia de foto sin intervención del alumno</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateSettings({ ...settings, autoPlay: !settings.autoPlay })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    settings.autoPlay ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {settings.autoPlay ? 'Activado' : 'En Pausa'}
                </button>
              </div>

              <div className="pt-3 border-t border-[#E4DED4] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#1A1815] block">Barra de progreso visual</span>
                  <span className="text-[11px] text-[#6B655C]">Muestra la cuenta regresiva en el banner</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateSettings({ ...settings, showProgressBar: !settings.showProgressBar })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    settings.showProgressBar ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {settings.showProgressBar ? 'Visible' : 'Oculta'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (7 cols): Image Management & Presets Library */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Active Carousel Images List */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                  Imágenes en Secuencia ({banners.length})
                </h3>
                <p className="text-xs text-[#6B655C]">
                  Organiza el orden de aparición o activa/desactiva fotografías según la temporada.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#B5654A]">
                {activeBanners.length} visibles en web
              </span>
            </div>

            <div className="space-y-3">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    banner.isActive
                      ? 'bg-white border-[#E4DED4] hover:border-[#B5654A]/50 shadow-2xs'
                      : 'bg-[#F1ECE5]/60 border-dashed border-zinc-300 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#DDD5C9] bg-zinc-100">
                      <img
                        src={banner.url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/hero-studio.jpg';
                        }}
                      />
                      <span className="absolute top-1 left-1 bg-black/70 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E4DED4] text-[#1A1815]">
                          {banner.tag}
                        </span>
                        {banner.isActive ? (
                          <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>En rotación (cada {settings.intervalMinutes}m)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-zinc-500">Oculto</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#1A1815] truncate">
                        {banner.title}
                      </h4>
                      <p className="text-[11px] text-[#6B655C] truncate">
                        {banner.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    {/* Move order up/down */}
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg border border-[#E4DED4] hover:bg-[#F1ECE5] disabled:opacity-30 transition-colors cursor-pointer"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-[#1A1815]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === banners.length - 1}
                      className="p-1.5 rounded-lg border border-[#E4DED4] hover:bg-[#F1ECE5] disabled:opacity-30 transition-colors cursor-pointer"
                      title="Mover abajo"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-[#1A1815]" />
                    </button>

                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(banner.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        banner.isActive
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-zinc-300 bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                      title={banner.isActive ? 'Desactivar de la rotación' : 'Activar en rotación'}
                    >
                      {banner.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(banner)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E4DED4] hover:bg-[#F1ECE5] text-xs font-semibold text-[#1A1815] transition-colors cursor-pointer"
                    >
                      Editar
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id, banner.title)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Curated Luxury Preset Photos Library (1-Click Add) */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B5654A] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Galería Curada de Nuevas Fotos</span>
                </div>
                <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                  Fotografías Profesionales de Pilates Reformer
                </h3>
                <p className="text-xs text-[#6B655C]">
                  Selección de alta definición en tonos cálidos y madera noble. Haz clic en "Añadir al Carrusel" para agregarlas inmediatamente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CURATED_PRESET_IMAGES.map((preset) => {
                const isAlreadyInList = banners.some((b) => b.url === preset.url);
                return (
                  <div
                    key={preset.id}
                    className="p-3 bg-white rounded-2xl border border-[#E4DED4] shadow-2xs flex flex-col justify-between space-y-2 hover:border-[#B5654A]/40 transition-colors"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-[#DDD5C9] bg-zinc-100">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-white uppercase tracking-wider">
                        {preset.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#1A1815] leading-tight">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-[#6B655C] line-clamp-1 mt-0.5">
                        {preset.suggestedSubtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddPreset(preset)}
                      disabled={isAlreadyInList}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isAlreadyInList
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] border border-[#DDD5C9]'
                      }`}
                    >
                      {isAlreadyInList ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ya está en el carrusel</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-[#B5654A]" />
                          <span>Añadir al Carrusel</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================
          MODAL: AGREGAR O EDITAR IMAGEN PERSONALIZADA
          ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E4DED4] pb-3">
              <div>
                <h3 className="font-fraunces text-xl font-semibold text-[#1A1815]">
                  {editingBanner ? 'Editar Fotografía del Carrusel' : 'Agregar Nueva Fotografía'}
                </h3>
                <p className="text-xs text-[#6B655C]">
                  Configura la imagen de fondo, textos descriptivos y distintivos para el Hero.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#6B655C] hover:text-[#1A1815] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1815] mb-1">
                  URL de la Imagen *
                </label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://images.unsplash.com/... o /assets/mi-foto.jpg"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-xs font-medium text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                />
                <span className="text-[10px] text-[#6B655C] mt-0.5 block">
                  Puedes usar enlaces directos de Unsplash, Cloudinary o archivos locales en /assets/
                </span>
              </div>

              {/* Image Preview if URL is valid */}
              {formData.url && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#E4DED4] bg-zinc-100">
                  <img
                    src={formData.url}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute bottom-1 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Previsualización
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1815] mb-1">
                    Etiqueta Superior
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="Ej. Sala Clásica Reformer"
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C9] rounded-xl text-xs text-[#1A1815]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1815] mb-1">
                    Ubicación / Pie
                  </label>
                  <input
                    type="text"
                    value={formData.locationLabel}
                    onChange={(e) => setFormData({ ...formData, locationLabel: e.target.value })}
                    placeholder="FIRME STUDIO · LIMA - SJL"
                    className="w-full px-3 py-2 bg-white border border-[#DDD5C9] rounded-xl text-xs text-[#1A1815]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1A1815] mb-1">
                  Título Principal *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Sala Principal · Equipamiento Clásico"
                  className="w-full px-3 py-2 bg-white border border-[#DDD5C9] rounded-xl text-xs text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1815] mb-1">
                  Subtítulo / Descripción
                </label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Ej. Luz natural, respiración pausada y aparatos calibrados milimétricamente."
                  className="w-full px-3 py-2 bg-white border border-[#DDD5C9] rounded-xl text-xs text-[#1A1815]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-[#DDD5C9] text-[#B5654A] focus:ring-[#B5654A]"
                />
                <label htmlFor="isActiveCheck" className="text-xs text-[#1A1815] font-medium cursor-pointer">
                  Activar de inmediato en el carrusel de la portada
                </label>
              </div>

              <div className="pt-3 border-t border-[#E4DED4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B655C] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#B5654A] hover:bg-[#9A5340] text-white transition-colors cursor-pointer shadow-xs"
                >
                  {editingBanner ? 'Guardar Cambios' : 'Agregar Fotografía'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
