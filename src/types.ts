export type DayOfWeek = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';

export type DifficultyLevel = 'Principiante' | 'Intermedio' | 'Avanzado';

export type ClassType = 'Reformer' | 'Mat' | 'Suspensión';

export type MainTabType = 'inicio' | 'horarios' | 'mis-clases' | 'niveles' | 'membresias' | 'profesores' | 'metodo' | 'admin' | 'kiosco' | 'instructor';

export type AdminSubTab =
  | 'dashboard'
  | 'kiosco'
  | 'instructor'
  | 'whatsapp'
  | 'agenda'
  | 'clientes'
  | 'caja'
  | 'gastos'
  | 'captacion'
  | 'reportes'
  | 'backend'
  | 'banners'
  | 'seguridad';

export interface CarouselBanner {
  id: string;
  url: string;
  tag: string;
  title: string;
  subtitle: string;
  locationLabel?: string;
  capacityLabel?: string;
  isActive: boolean;
  order: number;
}

export interface CarouselSettings {
  intervalMinutes: number; // Por defecto: 4 minutos (240 segundos)
  autoPlay: boolean;
  showProgressBar: boolean;
}

export interface DayTab {
  key: DayOfWeek;
  shortLabel: string;
  fullLabel: string;
  dateLabel: string;
}

export interface BookingRecord {
  id: string;
  classId: string;
  className: string;
  classTime: string;
  classDay: DayOfWeek;
  instructor: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientDni?: string;
  status: 'confirmada' | 'asistio' | 'cancelada';
  bookedAt: string;
  bedNumber?: number; // Cama Reformer 1-8
  isWaitlist?: boolean;
  medicalAlert?: string;
  checkInTime?: string;
  whatsappReminderSent?: boolean;
  whatsappReminderTime?: string;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  category: 'recordatorio' | 'lista_espera' | 'post_prueba' | 'cancelacion';
  template: string;
  variables: string[];
}

export interface WhatsAppMessageLog {
  id: string;
  toName: string;
  toPhone: string;
  type: 'recordatorio' | 'lista_espera' | 'post_prueba' | 'cancelacion';
  sentAt: string;
  status: 'enviado' | 'simulado';
  content: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  dni: string;
  phone: string;
  email: string;
  currentPlan: string;
  planType: 'ilimitado' | 'pack' | 'clase_suelta' | 'prueba';
  creditsLeft: number;
  totalAttended: number;
  status: 'activo' | 'en_riesgo' | 'inactivo';
  joinDate: string;
  lastVisit: string;
  emergencyContact?: string;
  medicalNotes?: string;
}

export type PaymentMethod =
  | 'yape'
  | 'plin'
  | 'tarjeta_pos'
  | 'efectivo'
  | 'transferencia_bcp'
  | 'transferencia_bbva';

export interface CashTransaction {
  id: string;
  type: 'ingreso' | 'egreso';
  concept: string;
  category: 'membresia' | 'pack_clases' | 'clase_suelta' | 'tienda_calcetines' | 'bebidas' | 'otro';
  amount: number; // PEN (S/.)
  paymentMethod: PaymentMethod;
  clientName?: string;
  receiptNumber: string;
  date: string;
  time: string;
  notes?: string;
}

export interface CashRegisterState {
  isOpen: boolean;
  openingAmount: number;
  openedAt?: string;
  closedAt?: string;
  cashierName: string;
}

export type DailyCashRegister = CashRegisterState;

export type ExpenseCategory =
  | 'alquiler_local'
  | 'pago_instructores'
  | 'mantenimiento_reformers'
  | 'servicios_luz_agua_wifi'
  | 'marketing_redes'
  | 'insumos_limpieza'
  | 'otros';

export interface ExpenseRecord {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number; // PEN (S/.)
  date: string;
  recipient: string;
  paymentMethod: PaymentMethod;
  status: 'pagado' | 'pendiente';
  receiptNumber?: string;
}

export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'prueba_agendada'
  | 'asistio_prueba'
  | 'convertido'
  | 'no_interesado';

export type LeadChannel =
  | 'instagram'
  | 'tiktok'
  | 'whatsapp'
  | 'web_organico'
  | 'recomendacion';

export interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  channel: LeadChannel;
  interest: 'Reformer' | 'Mat' | 'Suspensión' | 'Todos';
  status: LeadStatus;
  trialDate?: string;
  notes?: string;
  createdAt: string;
}

export interface ClassSession {
  id: string;
  name: string;
  instructor: string;
  time: string;
  duration: string;
  totalSpots: number;
  occupiedSpots: number;
  day: DayOfWeek;
  level: DifficultyLevel;
  classType: ClassType;
  focus: string;
  description?: string;
  isLocked?: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  certification: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  isPopular?: boolean;
  features: string[];
  ctaText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  durationInStudio: string;
  quote: string;
}

export type BookingModalType = 'reserve' | 'waitlist' | null;

export interface BookingModalData {
  classSession: ClassSession;
  type: 'reserve' | 'waitlist';
  waitlistPosition?: number;
}

export type UserRole = 'owner_dev' | 'admin' | 'client';

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  phone: string;
  dni: string;
  description: string;
}

export const PREDEFINED_STAFF: StaffAccount[] = [
  {
    id: 'staff-valentino',
    name: 'Valentino',
    email: 'valentino@firmestudio.pe',
    role: 'owner_dev',
    roleTitle: 'Owner / Lead Developer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '+51 987 654 321',
    dni: '70112233',
    description: 'Acceso Total: Infraestructura, APIs, Supabase y Back-Office',
  },
  {
    id: 'staff-soni',
    name: 'Soni',
    email: 'soni@firmestudio.pe',
    role: 'admin',
    roleTitle: 'Administración Sede SJL',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    phone: '+51 991 223 344',
    dni: '71223344',
    description: 'Gestión Operativa: Clientes, Agenda, 8 Camas, Caja y WhatsApp',
  },
  {
    id: 'staff-keyla',
    name: 'Keyla',
    email: 'keyla@firmestudio.pe',
    role: 'admin',
    roleTitle: 'Administración & Operaciones',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    phone: '+51 982 334 455',
    dni: '72334455',
    description: 'Gestión Operativa: Clientes, Agenda, 8 Camas, Caja y WhatsApp',
  },
];

export function determineUserRole(name?: string, email?: string): { role: UserRole; roleTitle: string } {
  const normName = (name || '').trim().toLowerCase();
  const normEmail = (email || '').trim().toLowerCase();

  if (normName.includes('valentino') || normEmail.includes('valentino')) {
    return { role: 'owner_dev', roleTitle: 'Owner Dev' };
  }
  if (normName.includes('soni') || normEmail.includes('soni')) {
    return { role: 'admin', roleTitle: 'Administración' };
  }
  if (normName.includes('keyla') || normEmail.includes('keyla')) {
    return { role: 'admin', roleTitle: 'Administración' };
  }

  return { role: 'client', roleTitle: 'Alumna' };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle?: string;
  avatar?: string;
  provider: 'google' | 'manual';
  phone?: string;
  dni?: string;
  experienceLevel?: 'Principiante' | 'Intermedio' | 'Avanzado';
  healthConditions?: string[];
  medicalNotes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  planName?: string;
  creditsLeft?: number;
  totalAttended?: number;
  level?: number;
  levelTitle?: string;
  exp?: number;
  expNextLevel?: number;
  weeklyStreak?: number;
  unlockedBadges?: string[];
}

export interface ClientBookingFormData {
  name: string;
  email: string;
  phone: string;
  dni: string;
  experienceLevel: 'Principiante' | 'Intermedio' | 'Avanzado';
  healthConditions: string[];
  medicalNotes?: string;
  fitnessGoal: string;
  gripSocksOption: 'has_socks' | 'need_purchase';
  emergencyContact?: string;
  emergencyPhone?: string;
  acceptedTerms: boolean;
  googleAvatar?: string;
  authProvider?: 'google' | 'manual';
  selectedBed?: number;
}

