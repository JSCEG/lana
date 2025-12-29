# Documento de Requisitos del Producto (PRD) - Finanzas Personales

## 1. Introducción
Desarrollo de una aplicación web de finanzas personales moderna, segura y escalable, diseñada para ayudar a los usuarios a gestionar sus gastos, ingresos, ahorros e inversiones de manera eficiente.

## 2. Objetivos del Producto
- Proporcionar una visión clara y detallada de la salud financiera del usuario.
- Facilitar el registro y seguimiento de transacciones financieras.
- Permitir la planificación financiera a través de presupuestos y metas de ahorro.
- Ofrecer herramientas de análisis visual para la toma de decisiones.

## 3. Funcionalidades Principales

### 3.1 Gestión de Transacciones
- **Gastos Fijos**: Registro recurrente (mensual/anual) con alertas de vencimiento. Campos: Categoría, Monto, Frecuencia, Fecha Vencimiento, Descripción.
- **Gastos Variables**: Registro puntual. Campos: Categoría, Monto, Fecha, Método de Pago, Etiquetas, Comprobante (opcional).
- **Ingresos**: Registro de entradas. Campos: Fuente, Monto, Frecuencia, Fecha, Tipo (Fijo/Variable).

### 3.2 Presupuestos
- Establecimiento de límites mensuales por categoría.
- Visualización de progreso (gastado vs límite).
- Alertas visuales al acercarse o exceder el límite.

### 3.3 Ahorro y Metas
- Creación de objetivos de ahorro (ej. "Vacaciones", "Fondo de Emergencia").
- Definición de monto meta y plazos.
- Seguimiento del progreso visual.

### 3.4 Inversiones
- Registro de activos (Acciones, Cripto, Bonos, etc.).
- Campos: Tipo Activo, Monto Invertido, Rendimiento Actual (manual o calculado), Fecha Compra/Venta.

### 3.5 Dashboard Principal
- Resumen de saldo total.
- Gráficos de distribución de gastos (Pastel/Donut).
- Evolución de ingresos vs gastos (Línea/Barras).
- Próximos vencimientos.
- Estado de presupuestos y metas.

## 4. Requisitos No Funcionales
- **UX/UI**: Diseño "Mobile First", intuitivo, modo oscuro/claro (opcional), responsive.
- **Rendimiento**: Carga rápida (<2s), optimización de assets con Vite.
- **Seguridad**: Autenticación robusta, protección de datos sensibles, RLS en base de datos.
- **Confiabilidad**: Backups automáticos, validación de datos estricta.

## 5. Especificaciones Técnicas (Resumen)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React.
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Despliegue**: Cloudflare Pages.
