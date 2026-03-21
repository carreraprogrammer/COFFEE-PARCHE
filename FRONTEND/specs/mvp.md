# mvp.md — coffee-parches-ionic-react

MVP 1 de Coffee Parches — frontend.
Leer `architecture.md`, `design-system.md`, `brand.md`, y `frontend-pages.md` antes de implementar.
Este spec extiende el boilerplate — no reemplaza nada existente.

---

## Lógica de redirect post-login

La primera pantalla después del login es siempre `/events` — no el dashboard genérico.
Modificar el flujo post-login en `authStore`:

```typescript
// Después de guardar tokens y user:
const profile = await profileService.getMyProfile();

if (!profile.onboardingCompleted) {
  history.replace('/onboarding');
} else {
  history.replace('/events');   // primera pantalla = lista de eventos
}
```

---

## Nuevas rutas

```typescript
// Agregar en AppRouter.tsx

// Onboarding — solo si autenticado y onboarding incompleto
<Route path="/onboarding">
  <OnboardingGuard>
    <OnboardingPage />
  </OnboardingGuard>
</Route>

// Participante
<Route path="/events"        component={EventsPage}       />  // protegida + onboarding
<Route path="/events/:id"    component={EventDetailPage}  />  // protegida + onboarding
<Route path="/my-events"     component={MyEventsPage}     />  // protegida + onboarding

// Admin / Collaborator
<Route path="/admin/events">
  <PermissionRoute permission="events:create">
    <AdminEventsPage />
  </PermissionRoute>
</Route>
<Route path="/admin/events/:id">
  <PermissionRoute permission="events:update">
    <AdminEventDetailPage />
  </PermissionRoute>
</Route>
<Route path="/admin/events/:id/participants">
  <PermissionRoute permission="events:read">
    <ParticipantsPage />
  </PermissionRoute>
</Route>
<Route path="/admin/enrollments">
  <PermissionRoute permission="enrollments:verify">
    <EnrollmentsPage />
  </PermissionRoute>
</Route>
<Route path="/admin/partners">
  <PermissionRoute permission="partners:read">
    <PartnersPage />
  </PermissionRoute>
</Route>
```

### OnboardingGuard

Crear `src/router/OnboardingGuard.tsx`:

```typescript
// Redirige a /events si el onboarding ya está completo
// Redirige a /login si no está autenticado
export const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const { profile }         = useProfileStore();

  if (!isAuthenticated)          return <Redirect to="/login" />;
  if (profile?.onboardingCompleted) return <Redirect to="/events" />;
  return <>{children}</>;
};
```

---

## Tipos nuevos

### src/types/event.types.ts

```typescript
export type EventType   = 'cafe' | 'karaoke' | 'yoga' | 'salsa' | 'park' | 'other';
export type EventStatus = 'draft' | 'published' | 'full' | 'cancelled' | 'completed';

export interface CoffeeEvent {
  id:                 string;
  title:              string;
  description:        string | null;
  eventType:          EventType;
  status:             EventStatus;
  partnerId:          string | null;
  partnerName:        string | null;
  address:            string;
  neighborhood:       string;
  startsAt:           string;
  endsAt:             string | null;
  capacity:           number;
  confirmedCount:     number;
  waitlistCount:      number;
  availableSlots:     number;
  isFull:             boolean;
  tipMin:             number | null;
  tipMax:             number | null;
  whatsappInviteLink: string | null;
  coverImageUrl:      string | null;   // URL firmada de S3/MinIO
  galleryUrls:        string[];        // fotos post-evento
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  cafe:    '☕ Cafetería',
  karaoke: '🎤 Karaoke',
  yoga:    '🧘 Yoga',
  salsa:   '💃 Salsa',
  park:    '🌿 Parque',
  other:   '✨ Otro',
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  cafe:    '#b59675',
  karaoke: '#8b1a1a',
  yoga:    '#6b9e6b',
  salsa:   '#c4933a',
  park:    '#6b9e6b',
  other:   '#7a9eb5',
};
```

### src/types/enrollment.types.ts

```typescript
export type EnrollmentStatus =
  'pending' | 'confirmed' | 'rejected' | 'waitlisted' | 'cancelled';

export interface Enrollment {
  id:               string;
  eventId:          string;
  userId:           string;
  status:           EnrollmentStatus;
  tipAmount:        number | null;
  receiptUrl:       string | null;
  rejectionNote:    string | null;
  waitlistPosition: number | null;
  confirmedAt:      string | null;
}

export interface EnrollmentWithUser extends Enrollment {
  userName:         string;
  userPhone:        string;
  userNeighborhood: string;
  userEnglishLevel: string;
  userAvatarUrl:    string | null;
}

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending:    '⏳ Pendiente',
  confirmed:  '✅ Confirmado',
  rejected:   '❌ Rechazado',
  waitlisted: '🕐 Lista de espera',
  cancelled:  '🚫 Cancelado',
};
```

### src/types/profile.types.ts

```typescript
export type EnglishLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper' | 'advanced';
export type Interest     = 'yoga' | 'salsa' | 'karaoke' | 'cafe' | 'parque' | 'ingles';

export interface UserProfile {
  userId:              number;
  phone:               string | null;
  neighborhood:        string | null;
  englishLevel:        EnglishLevel | null;
  interests:           Interest[];
  avatarUrl:           string | null;
  onboardingCompleted: boolean;
}

export const ENGLISH_LEVEL_LABELS: Record<EnglishLevel, string> = {
  beginner:     '🌱 Principiante',
  elementary:   '📖 Básico',
  intermediate: '💬 Intermedio',
  upper:        '🚀 Intermedio alto',
  advanced:     '⭐ Avanzado',
};

export const INTEREST_LABELS: Record<Interest, string> = {
  yoga:    '🧘 Yoga',
  salsa:   '💃 Salsa',
  karaoke: '🎤 Karaoke',
  cafe:    '☕ Cafetería',
  parque:  '🌿 Parque',
  ingles:  '🗣️ Inglés',
};

export const BOGOTA_NEIGHBORHOODS = [
  'Usaquén', 'Chapinero', 'Santa Fe', 'San Cristóbal', 'Usme',
  'Tunjuelito', 'Bosa', 'Kennedy', 'Fontibón', 'Engativá',
  'Suba', 'Barrios Unidos', 'Teusaquillo', 'Los Mártires',
  'Antonio Nariño', 'Puente Aranda', 'La Candelaria',
  'Rafael Uribe Uribe', 'Ciudad Bolívar'
];
```

---

## Store nuevo — src/store/profileStore.ts

```typescript
import { create } from 'zustand';
import { UserProfile, Interest, EnglishLevel } from '../types/profile.types';
import { profileService } from '../services/profileService';

interface OnboardingPayload {
  phone:        string;
  neighborhood: string;
  englishLevel: EnglishLevel;
  interests:    Interest[];
  avatar?:      File;
}

interface ProfileState {
  profile:    UserProfile | null;
  isLoading:  boolean;

  fetchProfile:       () => Promise<void>;
  setProfile:         (profile: UserProfile) => void;
  completeOnboarding: (data: OnboardingPayload) => Promise<void>;
  updateProfile:      (data: Partial<OnboardingPayload>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile:   null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await profileService.getMyProfile();
      set({ profile });
    } finally {
      set({ isLoading: false });
    }
  },

  setProfile: (profile) => set({ profile }),

  completeOnboarding: async (data) => {
    const profile = await profileService.completeOnboarding(data);
    set({ profile });
  },

  updateProfile: async (data) => {
    const profile = await profileService.update(data);
    set({ profile });
  },
}));
```

---

## Molecules nuevos

### EventCard

```typescript
// src/components/molecules/EventCard/EventCard.tsx

interface EventCardProps {
  event:   CoffeeEvent;
  onClick: () => void;
}
```

**Estructura visual:**

```
┌─────────────────────────────────┐
│  [FOTO DE PORTADA — 16:9]       │
│  [Badge tipo]    [Badge estado] │
├─────────────────────────────────┤
│  Título del evento              │
│  📅 Sáb 15 Mar · 4:00 PM       │
│  📍 Chapinero, Bogotá           │
│  🤝 Café Quindío (si hay)       │
├─────────────────────────────────┤
│  ████████░░  8 de 12 cupos      │
│  Propina: $5.000 - $10.000      │
└─────────────────────────────────┘
```

- Si `coverImageUrl` es null: mostrar gradiente de fondo usando `EVENT_TYPE_COLORS[event.eventType]`
- Si `isFull`: reemplazar barra de capacidad por badge "🕐 Lista de espera"
- Si `status === 'completed'`: overlay semitransparente con texto "Evento finalizado"
- Formato de fecha: usar `Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })`

**Estilos clave en EventCard.module.css:**

```css
.card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(181, 150, 117, 0.12);
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.coverImage {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.coverFallback {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.capacityBar {
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.capacityFill {
  height: 100%;
  background: var(--color-brand);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}
```

---

## Páginas nuevas

### OnboardingPage — `/onboarding`

**Template:** ninguno (pantalla full, sin nav)
**Wizard de 4 pasos — no se puede saltar**

```typescript
interface OnboardingState {
  step:         1 | 2 | 3 | 4;
  avatarFile:   File | null;
  avatarPreview: string | null;
  phone:        string;
  neighborhood: string;
  englishLevel: EnglishLevel | null;
  interests:    Interest[];
}
```

#### Paso 1 — Foto y presentación
- Fondo: `var(--gradient-brand)` con clase `.grain-overlay`
- Logo centrado arriba (size="md")
- `ImageInput` circular para avatar (aspectRatio="1:1", maxSizeMB=5)
- Texto: "Cuéntanos quién eres ☕"
- Subtexto: "Una foto tuya para que la comunidad te reconozca"

#### Paso 2 — Contacto y ubicación
- `PhoneInput` country="CO" — obligatorio
- `SelectInput` con `BOGOTA_NEIGHBORHOODS` — "¿De qué barrio eres?"
- Subtexto: "Tu teléfono es para coordinar la llegada al parche 🗺️"

#### Paso 3 — Nivel de inglés
- NO usar SelectInput — usar cards visuales grandes (grid 1x5)
- Cada card: emoji + label de `ENGLISH_LEVEL_LABELS`
- Selección única — card seleccionada con borde `var(--color-brand)` y fondo `var(--color-brand-subtle)`
- Texto: "¿Cómo está tu inglés?"
- Subtexto: "Sé honesto, aquí no hay juicio 😄"

#### Paso 4 — Intereses
- Grid 2x3 de chips grandes seleccionables
- Cada chip: emoji + label de `INTEREST_LABELS`
- Selección múltiple — chip seleccionado con fondo `var(--color-brand)` y texto `var(--color-text-inverse)`
- Mínimo 1 seleccionado para continuar
- Texto: "¿Qué tipo de parches te gustan?"

#### Barra de progreso
```css
/* 4 segmentos, se llenan por paso */
.progressBar {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
}

.segment {
  flex: 1;
  height: 3px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  transition: background var(--transition-base);
}

.segment.active {
  background: var(--color-brand);
}
```

#### Submit (paso 4)
- Botón "¡Listo, empecemos! ☕" variant="primary" fullWidth
- Llama `profileStore.completeOnboarding(data)`
- En éxito: `history.replace('/events')`

---

### EventsPage — `/events`

**Template:** `AppLayout`
**Endpoint:** `GET /api/v1/events`

Esta es la primera pantalla que ve el usuario al entrar.
Debe ser visualmente impactante — las fotos de los eventos son el elemento principal.

**Contenido:**
- Header con saludo: "¿Listo para tu próximo parche? ☕"
- Filtros de tipo: chips horizontales scrollables con emojis
  `Todos | ☕ Cafetería | 🎤 Karaoke | 🧘 Yoga | 💃 Salsa | 🌿 Parque`
- Grid de EventCards: 1 columna en mobile, 2 en tablet
- La primera card puede ser "featured" (más grande, aspect-ratio diferente)
- Pull-to-refresh con IonRefresher
- Estado vacío: "No hay parches disponibles por ahora. ¡Vuelve pronto! ☕"

---

### EventDetailPage — `/events/:id`

**Template:** `AppLayout`
**Endpoint:** `GET /api/v1/events/:id`

**Estructura:**

```
[FOTO DE PORTADA — pantalla completa arriba, con overlay gradiente]
[Badge tipo]  [Badge estado]
Título
Descripción completa
━━━━━━━━━━━━━━━━━━━━━
📅 Fecha y hora
📍 Dirección, Barrio
🤝 Nombre del aliado (si existe)
━━━━━━━━━━━━━━━━━━━━━
Capacidad: [barra] X de Y cupos
Propina sugerida: $5.000 - $10.000
━━━━━━━━━━━━━━━━━━━━━
[EnrollmentSection]
━━━━━━━━━━━━━━━━━━━━━
[GallerySection — solo si status=completed]
```

#### EnrollmentSection

Muestra contenido distinto según el estado del usuario:

```typescript
// Sin inscripción + evento disponible:
<NumberInput name="tip_amount" label="¿Cuánto quieres dar de propina?" prefix="$"
  hint={`Sugerido: $${event.tipMin?.toLocaleString()} - $${event.tipMax?.toLocaleString()}`} />
<ImageInput name="receipt" label="Captura de tu transferencia a Nequi"
  hint="Sofía la revisará y te confirmará en breve ☕" />
<Button label="Inscribirme" type="submit" fullWidth />

// Sin inscripción + evento lleno:
<Button label="Unirme a lista de espera" variant="secondary" fullWidth />

// pending:
<div>"Tu inscripción está siendo revisada ⏳"</div>
<div>"Sofía confirmará tu pago pronto"</div>

// confirmed:
<div>"¡Estás dentro! 🎉"</div>
{event.whatsappInviteLink && <Button label="Unirme al grupo de WhatsApp" onClick={() => window.open(event.whatsappInviteLink)} />}

// rejected:
<div>"Tu inscripción no fue aprobada"</div>
{enrollment.rejectionNote && <div>"{enrollment.rejectionNote}"</div>}
<Button label="Intentar de nuevo" onClick={resetEnrollment} />

// waitlisted:
<div>"Estás en lista de espera 🕐"</div>
<div>"Posición #{enrollment.waitlistPosition}"</div>
```

#### GallerySection

Solo visible cuando `event.status === 'completed'`:

```typescript
// Si el usuario tiene enrollment confirmado: mostrar botón "Subir foto"
// Grid de fotos con las galleryUrls del evento
// Click en foto: modal con imagen en tamaño completo
```

---

### MyEventsPage — `/my-events`

**Template:** `AppLayout`
**Endpoint:** `GET /api/v1/enrollments`

Tabs: "Próximos" | "Pendientes" | "Historial"

- **Próximos**: inscripciones confirmed con evento futuro → EventCard compacta + link de WhatsApp
- **Pendientes**: inscripciones pending → EventCard + "Esperando confirmación ⏳"
- **Historial**: eventos completados → EventCard con galería si existe

---

### AdminEventsPage — `/admin/events`

**Template:** `AppLayout`

**Contenido:**
- Lista de todos los eventos (incluyendo drafts)
- Filtro por estado: Todos | Borrador | Publicado | Completado
- Botón "Crear evento +" → abre modal
- EventCard compacta por evento con badge de estado y acciones rápidas

#### Modal de creación de evento

```typescript
// Campos en orden:
ImageInput    — "Foto del evento" (requerida, aspectRatio="16:9", maxSizeMB=10)
TextInput     — "Título"
SelectInput   — "Tipo" (EVENT_TYPE_LABELS)
TextareaInput — "Descripción" (rows=4)
TextInput     — "Dirección"
SelectInput   — "Barrio" (BOGOTA_NEIGHBORHOODS)
DateInput     — "Fecha y hora de inicio" (format="datetime-local")
NumberInput   — "Capacidad" (min=1)
NumberInput   — "Propina mínima sugerida" prefix="$" (opcional)
NumberInput   — "Propina máxima sugerida" prefix="$" (opcional)
SelectInput   — "Lugar aliado" (opcional, carga de GET /api/v1/partners)
TextInput     — "Link del grupo de WhatsApp"
              hint="Requerido para publicar el evento"
```

**Nota para el agente:** el `ImageInput` debe subir el archivo como `multipart/form-data`,
no como base64. Usar `FormData` en el service al crear el evento.

---

### AdminEventDetailPage — `/admin/events/:id`

**Template:** `AppLayout`

- Vista completa del evento con todos los datos
- Estadísticas en cards: Confirmados / Capacidad / En espera / Rechazados
- Botón "Publicar" visible si: status=draft + tiene cover_image + tiene whatsapp_invite_link
- Si falta algún requisito para publicar: mostrar checklist con lo que falta
- Botón "Ver participantes" → `/admin/events/:id/participants`
- Lista de inscripciones pendientes con acceso rápido

---

### ParticipantsPage — `/admin/events/:id/participants`

**Template:** `AppLayout`
**Esta es la pantalla más importante para Sofía**

Header: nombre del evento + fecha + contador de confirmados/capacidad

**Tabs: Pendientes | Confirmados | En espera | Rechazados**

#### Tab Pendientes (tab por defecto)
Por cada inscripción:
- Avatar + nombre + barrio + nivel de inglés
- Monto declarado de propina
- Miniatura de la captura → click abre modal con imagen completa
- Botones "✓ Confirmar" (variant=success) y "✗ Rechazar" (variant=danger)
- Si rechaza: campo de texto obligatorio para nota

Acción en lote:
- Checkbox por inscripción
- Botón "Confirmar seleccionados (n)" flotante al seleccionar

#### Tab Confirmados
- Lista con avatar, nombre, teléfono, barrio
- Badge de check-in si ya hizo check-in en el evento
- Botón "Check-in ✓" por participante (llama POST /api/v1/checkins)
- Botón "📱 WhatsApp" por participante → abre `https://wa.me/{phone}`

#### Tab En espera
- Lista ordenada por posición
- Si hay slots: botón "Mover a pendientes"

---

### EnrollmentsPage — `/admin/enrollments`

**Template:** `AppLayout`

Inbox centralizado de todas las inscripciones pendientes.
Agrupadas por evento. Contador en el título: "Pendientes (12)".

---

### PartnersPage — `/admin/partners`

**Template:** `AppLayout`

Lista de aliados + modal de creación.

---

## Services

### src/services/eventService.ts

```typescript
export const eventService = {
  getAll: async (filters?: { type?: EventType }): Promise<CoffeeEvent[]> => {
    const params = filters?.type ? `?type=${filters.type}` : '';
    const res = await api.get(`/api/v1/events${params}`);
    return res.data.data.map(mapEvent);
  },

  getById: async (id: string): Promise<CoffeeEvent> => {
    const res = await api.get(`/api/v1/events/${id}`);
    return mapEvent(res.data.data);
  },

  create: async (data: CreateEventPayload): Promise<CoffeeEvent> => {
    // Usar FormData para incluir la imagen
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob);
      }
    });
    const res = await api.post('/api/v1/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapEvent(res.data.data);
  },

  publish: async (id: string): Promise<CoffeeEvent> => {
    const res = await api.post(`/api/v1/events/${id}/publish`);
    return mapEvent(res.data.data);
  },

  getParticipants: async (id: string): Promise<EnrollmentWithUser[]> => {
    const res = await api.get(`/api/v1/events/${id}/participants`);
    return res.data.data.map(mapEnrollmentWithUser);
  },

  addGalleryPhoto: async (id: string, photo: File): Promise<void> => {
    const formData = new FormData();
    formData.append('photo', photo);
    await api.post(`/api/v1/events/${id}/gallery_photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};
```

### src/services/enrollmentService.ts

```typescript
export const enrollmentService = {
  getMine: async (): Promise<Enrollment[]> => {
    const res = await api.get('/api/v1/enrollments');
    return res.data.data.map(mapEnrollment);
  },

  create: async (eventId: string, tipAmount: number, receipt: File): Promise<Enrollment> => {
    const formData = new FormData();
    formData.append('event_id',   eventId);
    formData.append('tip_amount', tipAmount.toString());
    formData.append('receipt',    receipt);
    const res = await api.post('/api/v1/enrollments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapEnrollment(res.data.data);
  },

  verify: async (
    id: string,
    action: 'confirm' | 'reject',
    rejectionNote?: string
  ): Promise<Enrollment> => {
    const res = await api.post(`/api/v1/enrollments/${id}/verify`, {
      action,
      rejection_note: rejectionNote
    });
    return mapEnrollment(res.data.data);
  },

  cancel: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/enrollments/${id}`);
  },
};
```

### src/services/profileService.ts

```typescript
export const profileService = {
  getMyProfile: async (): Promise<UserProfile> => {
    const res = await api.get('/api/v1/profile');
    return mapProfile(res.data.data);
  },

  completeOnboarding: async (data: OnboardingPayload): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append('phone',         data.phone);
    formData.append('neighborhood',  data.neighborhood);
    formData.append('english_level', data.englishLevel);
    data.interests.forEach(i => formData.append('interests[]', i));
    if (data.avatar) formData.append('avatar', data.avatar);

    const res = await api.post('/api/v1/profile/complete_onboarding', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapProfile(res.data.data);
  },
};
```

---

## Navegación — IonMenu actualizado

```typescript
// Siempre visible
{ icon: '☕', label: 'Parches',     path: '/events' }
{ icon: '📋', label: 'Mis parches', path: '/my-events' }
{ icon: '👤', label: 'Mi perfil',   path: '/profile' }

// Solo admin/collaborator
<PermissionGate permission="events:create">
  { icon: '🎉', label: 'Gestionar eventos', path: '/admin/events' }
</PermissionGate>
<PermissionGate permission="enrollments:verify">
  { icon: '✅', label: 'Inscripciones',     path: '/admin/enrollments' }
</PermissionGate>
<PermissionGate permission="partners:read">
  { icon: '🤝', label: 'Aliados',           path: '/admin/partners' }
</PermissionGate>
```

---

## Definición de done — MVP frontend

- Post-login redirige a `/onboarding` si perfil incompleto, a `/events` si completo
- Wizard de onboarding completa los 4 pasos y guarda el perfil con foto
- `EventsPage` muestra eventos con foto de portada y filtros funcionando
- EventCard muestra gradiente de color cuando no hay foto
- `EventDetailPage` muestra formulario de inscripción con upload de captura
- Inscripción exitosa muestra estado correcto según slots disponibles
- `ParticipantsPage` tab Pendientes muestra captura y permite confirmar/rechazar
- Confirmar inscripción → participante aparece en tab Confirmados con opción de check-in
- Modal de creación de evento acepta foto y la muestra en preview antes de guardar
- Fotos de galería visibles en `EventDetailPage` cuando el evento está completado
- `tsc --noEmit` retorna 0 errores
- `npm test` pasa al 100%
