import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { CarouselBanner, CarouselSettings } from '../types';
import {
  getStoredBanners,
  getStoredCarouselSettings,
  INITIAL_CAROUSEL_BANNERS,
} from '../data/bannerData';

interface HeroProps {
  onBookFirstClass: () => void;
  onViewSchedule: () => void;
  onOpenBiomechanicsQuiz?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onBookFirstClass,
  onViewSchedule,
  onOpenBiomechanicsQuiz,
}) => {
  const [banners, setBanners] = useState<CarouselBanner[]>(() => getStoredBanners());
  const [settings, setSettings] = useState<CarouselSettings>(() => getStoredCarouselSettings());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Active banners list
  const activeBanners =
    banners.filter((b) => b.isActive).length > 0
      ? banners.filter((b) => b.isActive)
      : INITIAL_CAROUSEL_BANNERS;

  // Listen for banner updates from the Admin Panel
  useEffect(() => {
    const handleUpdate = () => {
      setBanners(getStoredBanners());
      setSettings(getStoredCarouselSettings());
    };
    window.addEventListener('firme_banners_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('firme_banners_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Timer for automatic rotation (default: 4 minutes = 240,000 ms)
  useEffect(() => {
    if (!settings.autoPlay || activeBanners.length <= 1) {
      setProgress(0);
      return;
    }

    const intervalMinutes = settings.intervalMinutes || 4;
    const intervalMs = intervalMinutes * 60 * 1000;
    const stepMs = 500; // updates progress smoothly every 500ms
    const stepIncrement = (stepMs / intervalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % activeBanners.length);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [settings.autoPlay, settings.intervalMinutes, activeBanners.length, currentIndex]);

  const goToNext = () => {
    setCurrentIndex((curr) => (curr + 1) % activeBanners.length);
    setProgress(0);
  };

  const goToPrev = () => {
    setCurrentIndex((curr) => (curr - 1 + activeBanners.length) % activeBanners.length);
    setProgress(0);
  };

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  const currentBanner = activeBanners[currentIndex % activeBanners.length] || activeBanners[0];

  return (
    <section
      id="hero-section"
      className="relative w-full bg-[#FAF8F5] py-10 sm:py-14 md:py-16 lg:py-20 flex items-center border-b border-[#E4DED4]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left / Top Text Area */}
          <div className="md:col-span-1 lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 text-xs font-medium tracking-wider uppercase text-[#B5654A] bg-[#F1ECE5] px-3 py-1.5 rounded-md self-start border border-[#E4DED4]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Estudio Boutique Reformer & Cadillac</span>
            </div>

            {/* Main Headline */}
            <h1
              id="hero-headline"
              className="font-fraunces text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.12] text-[#1A1815] tracking-tight"
            >
              Movimiento consciente.<br />
              Pilates, con <span className="italic text-[#B5654A] font-normal">intención</span>.
            </h1>

            {/* Subtitle */}
            <p
              id="hero-subtitle"
              className="text-sm sm:text-lg text-[#6B655C] max-w-xl leading-relaxed font-normal"
            >
              Un espacio sereno concebido para reeducar tu postura, fortalecer el centro
              y restaurar el equilibrio biomecánico en grupos de máximo ocho alumnos.
            </p>

            {/* CTAs */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2.5 sm:space-y-0 sm:space-x-4">
              <button
                id="hero-cta-primary"
                onClick={onBookFirstClass}
                className="inline-flex items-center justify-center bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-5 py-3 sm:px-6 sm:py-3.5 rounded-md font-medium text-sm sm:text-base transition-colors duration-200 shadow-xs group cursor-pointer"
              >
                <span>Reserva tu primera clase</span>
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                id="hero-cta-secondary"
                onClick={onViewSchedule}
                className="inline-flex items-center justify-center border border-[#B5654A] text-[#B5654A] hover:bg-[#B5654A]/5 px-5 py-3 sm:px-6 sm:py-3.5 rounded-md font-medium text-sm sm:text-base transition-colors duration-200 cursor-pointer"
              >
                Ver horarios
              </button>
            </div>

            {/* Biomechanics Quiz Quick Entry */}
            {onOpenBiomechanicsQuiz && (
              <button
                type="button"
                onClick={onOpenBiomechanicsQuiz}
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 text-xs text-[#B5654A] font-semibold bg-[#F1ECE5] hover:bg-[#FAF2E8] px-3.5 py-2.5 rounded-lg border border-[#E4DED4] transition-all self-start cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#B5654A] group-hover:rotate-12 transition-transform shrink-0" />
                  <span>¿Dudas sobre postura o dolores? <strong>Haz el Test Biomecánico</strong></span>
                </div>
                <span className="font-bold shrink-0">→</span>
              </button>
            )}

            {/* Trust Metrics Bar */}
            <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 border-t border-[#E4DED4] text-[#6B655C]">
              <div className="bg-[#F1ECE5]/40 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none">
                <span className="block font-fraunces font-medium text-[#1A1815] text-sm sm:text-lg leading-tight">8 alumnos</span>
                <span className="text-[10px] sm:text-xs text-[#6B655C] leading-tight block mt-0.5">Máximo por sesión</span>
              </div>
              <div className="bg-[#F1ECE5]/40 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none">
                <span className="block font-fraunces font-medium text-[#1A1815] text-sm sm:text-lg leading-tight">Reformer & Tower</span>
                <span className="text-[10px] sm:text-xs text-[#6B655C] leading-tight block mt-0.5">Aparatos alta gama</span>
              </div>
              <div className="bg-[#F1ECE5]/40 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none">
                <span className="block font-fraunces font-medium text-[#1A1815] text-sm sm:text-lg leading-tight">100% Certificados</span>
                <span className="text-[10px] sm:text-xs text-[#6B655C] leading-tight block mt-0.5">Instructores PMA</span>
              </div>
            </div>

          </div>

          {/* Right / Bottom Editorial Image Carousel */}
          <div className="md:col-span-1 lg:col-span-5 flex items-center justify-center">
            <div className="w-full max-w-md lg:max-w-none relative group">
              
              {/* Studio Showcase Card with 4-minute Auto-Carousel */}
              <div
                id="hero-image-showcase"
                className="w-full aspect-[16/10] sm:aspect-[16/11] lg:aspect-[4/5] bg-[#1A1815] rounded-xl border border-[#E4DED4] relative overflow-hidden transition-all duration-500 hover:shadow-xl select-none"
              >
                {/* Cross-fading Banner Images */}
                {activeBanners.map((banner, index) => {
                  const isCurrent = index === (currentIndex % activeBanners.length);
                  return (
                    <div
                      key={banner.id || index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={banner.url}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                        onError={(e) => {
                          // Fallback to local image if external link fails
                          (e.currentTarget as HTMLImageElement).src = '/assets/hero-studio.jpg';
                        }}
                      />
                    </div>
                  );
                })}

                {/* Vignette & Gradient Overlays for high readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1815]/95 via-[#1A1815]/40 to-black/20 z-10 pointer-events-none" />

                {/* Top Floating Left Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 bg-[#FAF8F5]/90 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-medium text-[#1A1815] shadow-xs flex items-center space-x-1.5 sm:space-x-2 border border-[#E4DED4]/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="tracking-wide">{currentBanner.tag}</span>
                </div>

                {/* Top Floating Right Badge (Rotation & Slide Counter) */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 bg-[#1A1815]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-[#FAF8F5]/90 border border-white/15 shadow-xs">
                  <Clock className="w-3 h-3 text-[#B5654A]" />
                  <span>{settings.intervalMinutes} min</span>
                  <span className="text-[#FAF8F5]/40">·</span>
                  <span className="font-mono">
                    {(currentIndex % activeBanners.length) + 1}/{activeBanners.length}
                  </span>
                </div>

                {/* Subtle Prev / Next Chevron Arrows on Hover */}
                {activeBanners.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#1A1815]/70 hover:bg-[#1A1815] text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white/20 cursor-pointer shadow-md"
                      aria-label="Imagen anterior"
                      title="Imagen anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#1A1815]/70 hover:bg-[#1A1815] text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white/20 cursor-pointer shadow-md"
                      aria-label="Siguiente imagen"
                      title="Siguiente imagen"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Bottom Content Area */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-7 text-[#FAF8F5] z-20">
                  <span className="block font-fraunces text-base sm:text-2xl text-[#FAF8F5] font-medium tracking-tight line-clamp-2">
                    {currentBanner.title}
                  </span>
                  <span className="block text-[11px] sm:text-sm text-[#FAF8F5]/85 mt-1 font-inter max-w-md leading-relaxed line-clamp-2">
                    {currentBanner.subtitle}
                  </span>

                  <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/15 flex items-center justify-between text-xs">
                    <div className="bg-[#FAF8F5]/20 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[9px] sm:text-[10px] tracking-widest uppercase font-medium text-[#FAF8F5] border border-white/20">
                      {currentBanner.locationLabel || 'FIRME STUDIO · LIMA - SJL'}
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-[#FAF8F5]/80">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E4DED4]" />
                      <span>{currentBanner.capacityLabel || 'Máx. 8 alumnos'}</span>
                    </div>
                  </div>

                  {/* Dot Indicators */}
                  {activeBanners.length > 1 && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 pt-1">
                      {activeBanners.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToSlide(idx);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentIndex % activeBanners.length
                              ? 'w-6 bg-[#B5654A]'
                              : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Ver foto ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Continuous 4-minute Progress Bar */}
                {settings.showProgressBar && settings.autoPlay && activeBanners.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#B5654A] via-[#D49581] to-[#B5654A] transition-all duration-500 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
