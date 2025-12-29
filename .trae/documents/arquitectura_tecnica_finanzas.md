# Documento de Arquitectura Técnica - Finanzas Personales

## 1. Stack Tecnológico

### Frontend
- **Framework**: React 18+
- **Lenguaje**: TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS (Diseño Utility-First)
- **Estado Global**: Zustand
- **Enrutamiento**: React Router DOM
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Formularios**: React Hook Form + Zod (Validación)
- **Cliente HTTP/Supabase**: @supabase/supabase-js

### Backend (BaaS - Supabase)
- **Base de Datos**: PostgreSQL
- **Autenticación**: Supabase Auth (Email/Password, OAuth si se requiere)
- **Seguridad**: Row Level Security (RLS) para aislamiento de datos por usuario.
- **Lógica de Negocio**: Stored Procedures (PL/pgSQL) y Database Triggers.

## 2. Modelo de Datos (Esquema Relacional)

### Tablas Principales
1.  **profiles** (Extensión de auth.users)
    - id (UUID, PK, FK -> auth.users)
    - full_name (Text)
    - avatar_url (Text)
    - updated_at (Timestamptz)

2.  **categories**
    - id (UUID, PK)
    - user_id (UUID, FK -> profiles.id)
    - name (Text)
    - type (Enum: 'expense', 'income')
    - icon (Text)
    - color (Text)

3.  **transactions**
    - id (UUID, PK)
    - user_id (UUID, FK -> profiles.id)
    - category_id (UUID, FK -> categories.id)
    - amount (Decimal)
    - date (Date)
    - description (Text)
    - type (Enum: 'fixed_expense', 'variable_expense', 'income')
    - frequency (Enum: 'one_time', 'monthly', 'yearly') - Para fijos/recurrentes
    - payment_method (Text)
    - tags (Array Text)
    - created_at (Timestamptz)

4.  **budgets**
    - id (UUID, PK)
    - user_id (UUID, FK -> profiles.id)
    - category_id (UUID, FK -> categories.id)
    - amount_limit (Decimal)
    - period (Text, e.g., '2024-01')

5.  **savings_goals**
    - id (UUID, PK)
    - user_id (UUID, FK -> profiles.id)
    - name (Text)
    - target_amount (Decimal)
    - current_amount (Decimal)
    - deadline (Date)

6.  **investments**
    - id (UUID, PK)
    - user_id (UUID, FK -> profiles.id)
    - asset_type (Text)
    - name (Text)
    - invested_amount (Decimal)
    - current_value (Decimal)
    - purchase_date (Date)

## 3. Seguridad (RLS)
- Todas las tablas tendrán RLS habilitado.
- Políticas típicas:
    - `SELECT using (auth.uid() = user_id)`
    - `INSERT with check (auth.uid() = user_id)`
    - `UPDATE using (auth.uid() = user_id)`
    - `DELETE using (auth.uid() = user_id)`

## 4. Estrategia de Despliegue
- **Plataforma**: Cloudflare Pages.
- **CI/CD**: Integración con repositorio Git (GitHub/GitLab).
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 5. Testing
- **Unit Testing**: Vitest + React Testing Library.
- **Coverage**: >80% en componentes core y utilidades.
- **E2E**: Opcional (Playwright/Cypress) para flujos críticos.
