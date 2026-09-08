# FIRME STUDIO — Pilates Reformer & Boutique

Plataforma integral y suite operativa para el estudio boutique de **Pilates Reformer** ubicado en **San Juan de Lurigancho (SJL), Lima, Perú**.

---

## Características Principales

- **Gestión de Sala & 8 Camas Reformer:** Aforo limitado y supervisión personalizada con máquinas Allegro 2 (Balanced Body).
- **Control de Acceso por Roles (RBAC):**
  - **Owner Dev (Valentino):** Acceso total, herramientas técnicas, Supabase y módulo Backend & APIs.
  - **Admin (Soni & Keyla):** Administración operativa (Kiosco, Modo Instructora, Agenda, CRM, Caja POS, WhatsApp, Reportes).
  - **Clientes:** Portal de reservas, horarios, compras/canje en boutique y evolución EXP (bloqueo estricto del Panel Admin).
- **Tótem SJL en Recepción:** Auto check-in para tablets en la entrada de la sede con validación de DNI y asignación de cama en tiempo real.
- **Modo Instructora en Sala:** Vista en tablet con el mapa de las 8 camas, nombres de alumnas y alertas posturales/médicas.
- **Sincronización en la Nube:** Base de datos PostgreSQL y WebSockets Realtime con **Supabase Cloud**, con fallback local resiliente.
- **Automatización por WhatsApp:** Recordatorios a 3 horas de la sesión, confirmaciones y avisos de lista de espera.
- **Boutique & Gamificación EXP:** Venta y canje por puntos de práctica de calcetines antideslizantes de agarre, botellas térmicas y tote bags.

---

## Arquitectura

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Motion, Recharts, Lucide Icons.
- **Backend:** Node.js, Express, TypeScript (`tsx server.ts`).
- **Base de Datos:** Supabase Cloud (PostgreSQL + Realtime).
- **IA:** Google Gemini 2.5 Flash (`@google/genai`) para análisis biomecánico asistido.

---

## Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (Puerto 3000)
npm run dev

# 3. Validar TypeScript
npm run lint

# 4. Compilar para producción
npm run build
```

- **Web Pública:** http://localhost:3000
- **Panel Administrativo:** http://localhost:3000/#admin
- **Health Check:** http://localhost:3000/api/health

