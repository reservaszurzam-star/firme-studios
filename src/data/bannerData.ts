import { CarouselBanner, CarouselSettings } from '../types';

export const DEFAULT_CAROUSEL_SETTINGS: CarouselSettings = {
  intervalMinutes: 4, // 4 minutos exactos por imagen
  autoPlay: true,
  showProgressBar: true,
};

export const INITIAL_CAROUSEL_BANNERS: CarouselBanner[] = [
  {
    id: 'banner-1',
    url: '/assets/hero-studio.jpg',
    tag: 'Sala Clásica Reformer',
    title: 'Sala Principal · Equipamiento Clásico',
    subtitle: 'Luz natural, respiración pausada y aparatos calibrados milimétricamente en San Juan de Lurigancho.',
    locationLabel: 'FIRME STUDIO · LIMA - SJL',
    capacityLabel: 'Máx. 8 alumnos',
    isActive: true,
    order: 1,
  },
  {
    id: 'banner-2',
    url: '/assets/nuevo-en-estudio.jpg',
    tag: 'Allegro 2 Balanced Body',
    title: 'Biomecánica & Control de Postura',
    subtitle: 'Elongación axial y activación profunda del transverso abdominal en carruaje suave y silencioso.',
    locationLabel: 'ALLEGRO 2 · BALANCED BODY',
    capacityLabel: 'Atención personalizada',
    isActive: true,
    order: 2,
  },
  {
    id: 'banner-3',
    url: '/assets/nuevo-en-pilates.jpg',
    tag: 'Atmósfera Zen Boutique',
    title: 'Entorno de Calma & Enfoque',
    subtitle: 'Espacio minimalista diseñado con tonos tierra, maderas nobles y aromaterapia relajante.',
    locationLabel: 'BOUTIQUE STUDIO · SJL',
    capacityLabel: 'Grupos reducidos',
    isActive: true,
    order: 3,
  },
  {
    id: 'banner-4',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80',
    tag: 'Precisión y Fuerza Central',
    title: 'Secuencias de Potencia & Flexibilidad',
    subtitle: 'Movimientos guiados por instructoras certificadas para descomprimir columna y fortalecer articulaciones.',
    locationLabel: 'INSTRUCTORAS PMA CERTIFIED',
    capacityLabel: 'Reformer & Tower',
    isActive: true,
    order: 4,
  },
  {
    id: 'banner-5',
    url: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1600&q=80',
    tag: 'Comunidad Exclusiva',
    title: 'Bienestar Integral & Salud Postural',
    subtitle: 'Un santuario de movimiento en Lima Este para reconectar cuerpo y mente en cada inhalación.',
    locationLabel: 'JR. AKAPANA 1261 · SJL',
    capacityLabel: '8 Camas de Alta Gama',
    isActive: true,
    order: 5,
  },
];

// Galería curada de nuevas fotografías profesionales para agregar con 1 solo clic desde el panel
export const CURATED_PRESET_IMAGES: {
  id: string;
  name: string;
  category: string;
  url: string;
  suggestedTag: string;
  suggestedTitle: string;
  suggestedSubtitle: string;
}[] = [
  {
    id: 'preset-1',
    name: 'Alineación en Carruaje Allegro 2',
    category: 'Reformer',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80',
    suggestedTag: 'Técnica & Biomecánica',
    suggestedTitle: 'Alineación de Columna en Reformer',
    suggestedSubtitle: 'Resistencia progresiva por resortes para fortalecer musculatura profunda sin impacto articular.',
  },
  {
    id: 'preset-2',
    name: 'Atmósfera Arquitectónica y Espejos',
    category: 'Estudio',
    url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80',
    suggestedTag: 'Diseño & Confort',
    suggestedTitle: 'Santuario de Calma en San Juan de Lurigancho',
    suggestedSubtitle: 'Luz difusa, ventanales con lino y materiales nobles para una experiencia de desconexión absoluta.',
  },
  {
    id: 'preset-3',
    name: 'Detalle de Resortes y Muelles de Precisión',
    category: 'Equipamiento',
    url: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1600&q=80',
    suggestedTag: 'Equipamiento Premium',
    suggestedTitle: 'Resortes de Tensión Graduada',
    suggestedSubtitle: 'Calibración exacta de 1 a 5 resortes para adaptar cada ejercicio a tu nivel físico y patologías.',
  },
  {
    id: 'preset-4',
    name: 'Sesión Grupal Guiada en Sala',
    category: 'Comunidad',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80',
    suggestedTag: 'Grupos Exclusivos',
    suggestedTitle: 'Entrenamiento Compartido con Enfoque Individual',
    suggestedSubtitle: 'Máximo 8 alumnas por horario para garantizar la corrección postural personalizada de tu instructora.',
  },
  {
    id: 'preset-5',
    name: 'Elongación Profunda & Tower Cadillac',
    category: 'Flexibilidad',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80',
    suggestedTag: 'Descompresión Espinal',
    suggestedTitle: 'Elongación Asistida & Cadillac Tower',
    suggestedSubtitle: 'Libera la tensión lumbar y cervical acumulada durante la jornada laboral.',
  },
  {
    id: 'preset-6',
    name: 'Clara - Instructora Principal en Demostración',
    category: 'Instructores',
    url: '/assets/instructor-clara.jpg',
    suggestedTag: 'Staff Especializado',
    suggestedTitle: 'Dirección Técnica por Instructoras PMA',
    suggestedSubtitle: 'Guiado paso a paso con señas verbales claras y adaptaciones biomecánicas instantáneas.',
  },
];

// Helper functions para persistencia en localStorage
export const BANNER_STORAGE_KEY = 'firme_hero_banners';
export const CAROUSEL_SETTINGS_KEY = 'firme_hero_carousel_settings';

export function getStoredBanners(): CarouselBanner[] {
  try {
    const raw = localStorage.getItem(BANNER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error al leer banners del almacenamiento:', err);
  }
  return INITIAL_CAROUSEL_BANNERS;
}

export function saveStoredBanners(banners: CarouselBanner[]): void {
  try {
    localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new Event('firme_banners_updated'));
  } catch (err) {
    console.error('Error al guardar banners:', err);
  }
}

export function getStoredCarouselSettings(): CarouselSettings {
  try {
    const raw = localStorage.getItem(CAROUSEL_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CAROUSEL_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('Error al leer configuración de carrusel:', err);
  }
  return DEFAULT_CAROUSEL_SETTINGS;
}

export function saveStoredCarouselSettings(settings: CarouselSettings): void {
  try {
    localStorage.setItem(CAROUSEL_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('firme_banners_updated'));
  } catch (err) {
    console.error('Error al guardar configuración de carrusel:', err);
  }
}
