import {
  ClassSession,
  BookingRecord,
  ClientProfile,
  CashTransaction,
  ExpenseRecord,
  LeadRecord,
  CashRegisterState,
  WhatsAppMessageLog,
} from '../../src/types';
import { MOCK_CLASSES } from '../../src/data/mockData';
import {
  INITIAL_CLIENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_LEADS,
  INITIAL_CASH_STATE,
} from '../../src/data/adminMockData';

const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'b-1',
    classId: 'lun-1',
    className: 'Fundamentos Reformer',
    classTime: '07:30',
    classDay: 'lun',
    instructor: 'Valeria Soler',
    clientName: 'María Fernanda Ruiz',
    clientDni: '72849102',
    clientEmail: 'maria.ruiz@gmail.com',
    clientPhone: '+51 984 123 456',
    status: 'asistio',
    bookedAt: '02/09/2026 07:10',
    bedNumber: 1,
    medicalAlert: 'Tensión cervical leve por trabajo de oficina. Cabecero en nivel 2.',
    checkInTime: '07:22',
    whatsappReminderSent: true,
  },
  {
    id: 'b-2',
    classId: 'lun-1',
    className: 'Fundamentos Reformer',
    classTime: '07:30',
    classDay: 'lun',
    instructor: 'Valeria Soler',
    clientName: 'Rodrigo Salazar Peña',
    clientDni: '45912830',
    clientEmail: 'rodrigo.s@outlook.com',
    clientPhone: '+51 992 456 789',
    status: 'asistio',
    bookedAt: '01/09/2026 19:30',
    bedNumber: 2,
    medicalAlert: 'Cirugía de menisco derecho en 2023. Evitar flexión profunda extrema de rodilla.',
    checkInTime: '07:25',
    whatsappReminderSent: true,
  },
  {
    id: 'b-3',
    classId: 'lun-1',
    className: 'Fundamentos Reformer',
    classTime: '07:30',
    classDay: 'lun',
    instructor: 'Valeria Soler',
    clientName: 'Andrea Navarro Vega',
    clientDni: '71029384',
    clientEmail: 'andrea.navarro@gmail.com',
    clientPhone: '+51 971 332 114',
    status: 'asistio',
    bookedAt: '02/09/2026 06:45',
    bedNumber: 3,
    medicalAlert: 'Hiperlordosis lumbar compensada. Priorizar activación del transverso abdominal.',
    checkInTime: '07:28',
    whatsappReminderSent: true,
  },
  {
    id: 'b-4',
    classId: 'lun-1',
    className: 'Fundamentos Reformer',
    classTime: '07:30',
    classDay: 'lun',
    instructor: 'Valeria Soler',
    clientName: 'Camila Quispe Morales',
    clientDni: '74820193',
    clientEmail: 'camila.qm@hotmail.com',
    clientPhone: '+51 983 776 221',
    status: 'confirmada',
    bookedAt: '01/09/2026 21:00',
    bedNumber: 4,
    medicalAlert: 'Primer trimestre de embarazo (semana 14). Sin decúbito prono prolongado.',
    whatsappReminderSent: true,
  },
  {
    id: 'b-5',
    classId: 'lun-1',
    className: 'Fundamentos Reformer',
    classTime: '07:30',
    classDay: 'lun',
    instructor: 'Valeria Soler',
    clientName: 'Valeria Hurtado Cruz',
    clientDni: '76192834',
    clientEmail: 'valeria.hc@gmail.com',
    clientPhone: '+51 988 234 567',
    status: 'confirmada',
    bookedAt: '02/09/2026 06:15',
    bedNumber: 5,
    medicalAlert: 'Dolor recurrente en manguito rotador derecho. Resortes suaves en brazos.',
    whatsappReminderSent: false,
  },
  {
    id: 'b-6',
    classId: 'lun-2',
    className: 'Reformer Flow Dinámico',
    classTime: '09:00',
    classDay: 'lun',
    instructor: 'Mateo Arismendi',
    clientName: 'María Fernanda Ruiz',
    clientDni: '72849102',
    clientEmail: 'maria.ruiz@gmail.com',
    clientPhone: '+51 984 123 456',
    status: 'confirmada',
    bookedAt: '02/09/2026 08:30',
    bedNumber: 1,
    medicalAlert: 'Tensión cervical leve. Cabecero en nivel 2.',
    whatsappReminderSent: false,
  },
];

class StudioStore {
  private classes: ClassSession[] = [...MOCK_CLASSES];
  private bookings: BookingRecord[] = [...INITIAL_BOOKINGS];
  private clients: ClientProfile[] = [...INITIAL_CLIENTS];
  private transactions: CashTransaction[] = [...INITIAL_TRANSACTIONS];
  private expenses: ExpenseRecord[] = [...INITIAL_EXPENSES];
  private leads: LeadRecord[] = [...INITIAL_LEADS];
  private cashRegister: CashRegisterState = { ...INITIAL_CASH_STATE };
  private whatsappLogs: WhatsAppMessageLog[] = [
    {
      id: 'wa-1',
      toName: 'María Fernanda Ruiz',
      toPhone: '+51 984 123 456',
      type: 'recordatorio',
      sentAt: '02/09/2026 06:30',
      status: 'enviado',
      content: '¡Hola María Fernanda! ✨ Te recordamos tu clase de Fundamentos Reformer hoy a las 07:30 con Valeria Soler en FIRME STUDIO.',
    },
    {
      id: 'wa-2',
      toName: 'Rodrigo Salazar Peña',
      toPhone: '+51 992 456 789',
      type: 'recordatorio',
      sentAt: '02/09/2026 06:30',
      status: 'enviado',
      content: '¡Hola Rodrigo! Te recordamos tu clase de Fundamentos Reformer hoy a las 07:30. Recuerda traer tus calcetines antideslizantes grip.',
    },
  ];

  // --- WhatsApp Logs ---
  getWhatsAppLogs(): WhatsAppMessageLog[] {
    return this.whatsappLogs;
  }

  recordWhatsAppLog(log: WhatsAppMessageLog): WhatsAppMessageLog {
    this.whatsappLogs.unshift(log);
    // If it's a reminder for a booking, mark it
    const booking = this.bookings.find((b) => b.clientPhone === log.toPhone || b.clientName.toLowerCase() === log.toName.toLowerCase());
    if (booking) {
      booking.whatsappReminderSent = true;
      booking.whatsappReminderTime = log.sentAt;
    }
    return log;
  }

  // --- Classes ---
  getClasses(): ClassSession[] {
    return this.classes;
  }

  getClassById(id: string): ClassSession | undefined {
    return this.classes.find((c) => c.id === id);
  }

  addClass(newClass: ClassSession): ClassSession {
    this.classes.push(newClass);
    return newClass;
  }

  updateClass(id: string, update: Partial<ClassSession>): ClassSession | null {
    const idx = this.classes.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.classes[idx] = { ...this.classes[idx], ...update };
    return this.classes[idx];
  }

  deleteClass(id: string): boolean {
    const prevLen = this.classes.length;
    this.classes = this.classes.filter((c) => c.id !== id);
    return this.classes.length < prevLen;
  }

  // --- Bookings ---
  getBookings(): BookingRecord[] {
    return this.bookings;
  }

  addBooking(booking: BookingRecord): BookingRecord {
    this.bookings.unshift(booking);
    // Automatically increment occupied spots in the matching class if available
    const classSession = this.classes.find((c) => c.id === booking.classId);
    if (classSession && classSession.occupiedSpots < classSession.totalSpots) {
      classSession.occupiedSpots += 1;
    }
    return booking;
  }

  updateBookingStatus(id: string, status: BookingRecord['status']): BookingRecord | null {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) return null;
    const oldStatus = booking.status;
    booking.status = status;

    // If cancelled, decrement spots
    if (status === 'cancelada' && oldStatus !== 'cancelada') {
      const cls = this.classes.find((c) => c.id === booking.classId);
      if (cls && cls.occupiedSpots > 0) {
        cls.occupiedSpots -= 1;
      }
    }
    return booking;
  }

  assignBed(bookingId: string, bedNumber: number): BookingRecord | null {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return null;
    booking.bedNumber = bedNumber;
    return booking;
  }

  checkInBooking(bookingId: string, bedNumber?: number): BookingRecord | null {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return null;
    booking.status = 'asistio';
    const now = new Date();
    booking.checkInTime = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    if (bedNumber !== undefined) {
      booking.bedNumber = bedNumber;
    }
    // Update client last visit
    const client = this.clients.find((c) => c.email.toLowerCase() === booking.clientEmail.toLowerCase() || (booking.clientDni && c.dni === booking.clientDni));
    if (client) {
      client.totalAttended = (client.totalAttended || 0) + 1;
      client.lastVisit = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return booking;
  }

  deleteBooking(id: string): boolean {
    const prevLen = this.bookings.length;
    this.bookings = this.bookings.filter((b) => b.id !== id);
    return this.bookings.length < prevLen;
  }

  // --- Clients ---
  getClients(): ClientProfile[] {
    return this.clients;
  }

  getClientById(id: string): ClientProfile | undefined {
    return this.clients.find((c) => c.id === id);
  }

  addClient(client: ClientProfile): ClientProfile {
    this.clients.unshift(client);
    return client;
  }

  updateClient(id: string, update: Partial<ClientProfile>): ClientProfile | null {
    const idx = this.clients.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.clients[idx] = { ...this.clients[idx], ...update };
    return this.clients[idx];
  }

  deleteClient(id: string): boolean {
    const prevLen = this.clients.length;
    this.clients = this.clients.filter((c) => c.id !== id);
    return this.clients.length < prevLen;
  }

  // --- Transactions / Cash ---
  getTransactions(): CashTransaction[] {
    return this.transactions;
  }

  addTransaction(tx: CashTransaction): CashTransaction {
    this.transactions.unshift(tx);
    return tx;
  }

  updateTransaction(id: string, update: Partial<CashTransaction>): CashTransaction | null {
    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.transactions[idx] = { ...this.transactions[idx], ...update };
    return this.transactions[idx];
  }

  deleteTransaction(id: string): boolean {
    const prevLen = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    return this.transactions.length < prevLen;
  }

  getCashRegister(): CashRegisterState {
    return this.cashRegister;
  }

  toggleCashRegister(): CashRegisterState {
    this.cashRegister.isOpen = !this.cashRegister.isOpen;
    return this.cashRegister;
  }

  // --- Expenses ---
  getExpenses(): ExpenseRecord[] {
    return this.expenses;
  }

  addExpense(exp: ExpenseRecord): ExpenseRecord {
    this.expenses.unshift(exp);
    return exp;
  }

  updateExpense(id: string, update: Partial<ExpenseRecord>): ExpenseRecord | null {
    const idx = this.expenses.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.expenses[idx] = { ...this.expenses[idx], ...update };
    return this.expenses[idx];
  }

  deleteExpense(id: string): boolean {
    const prevLen = this.expenses.length;
    this.expenses = this.expenses.filter((e) => e.id !== id);
    return this.expenses.length < prevLen;
  }

  // --- Leads ---
  getLeads(): LeadRecord[] {
    return this.leads;
  }

  addLead(lead: LeadRecord): LeadRecord {
    this.leads.unshift(lead);
    return lead;
  }

  updateLead(id: string, update: Partial<LeadRecord>): LeadRecord | null {
    const idx = this.leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    this.leads[idx] = { ...this.leads[idx], ...update };
    return this.leads[idx];
  }

  deleteLead(id: string): boolean {
    const prevLen = this.leads.length;
    this.leads = this.leads.filter((l) => l.id !== id);
    return this.leads.length < prevLen;
  }

  // Stats / Overview
  getStats() {
    const totalClients = this.clients.length;
    const activeClients = this.clients.filter((c) => c.status === 'activo').length;
    const totalRevenue = this.transactions.reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = this.expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalBookings = this.bookings.length;
    const confirmedBookings = this.bookings.filter((b) => b.status === 'confirmada' || b.status === 'asistio').length;
    const activeLeads = this.leads.length;

    return {
      totalClients,
      activeClients,
      totalRevenue,
      totalExpenses,
      netBalance: totalRevenue - totalExpenses,
      totalBookings,
      confirmedBookings,
      activeLeads,
      totalClasses: this.classes.length,
    };
  }
}

export const store = new StudioStore();
