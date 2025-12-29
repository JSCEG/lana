# Registro de Cambios Técnicos (Changelog)

## [2024-12-29] - Implementación de Recuperación de Contraseña, Mejoras UI/UX y Reportes

### 1. Sistema de Recuperación de Contraseña
Se implementó un flujo completo para la recuperación de contraseñas utilizando Supabase Auth.

*   **Nuevas Páginas**:
    *   `src/pages/ForgotPassword.tsx`: Formulario para solicitar el enlace de restablecimiento. Utiliza `supabase.auth.resetPasswordForEmail`.
    *   `src/pages/ResetPassword.tsx`: Formulario para establecer la nueva contraseña. Utiliza `supabase.auth.updateUser`.
*   **Actualizaciones**:
    *   `src/pages/Login.tsx`: Se añadió un enlace "¿Olvidaste tu contraseña?".
    *   `src/App.tsx`: Se añadieron las rutas `/forgot-password` y `/reset-password`.

### 2. Mejoras de UI/UX
Se modernizó la interfaz con un diseño adaptable (Modo Claro/Oscuro) y efectos de glassmorphism.

*   **Tema y Estilos**:
    *   `tailwind.config.js`: Habilitado `darkMode: "class"`.
    *   `src/index.css`: Añadidas clases utilitarias `.glass`, `.glass-card` y variables para transiciones suaves.
    *   `src/hooks/useTheme.ts`: Hook para manejar la persistencia del tema en `localStorage`.
*   **Componentes**:
    *   `src/components/ThemeToggle.tsx`: Botón para alternar entre temas.
    *   `src/components/Layout.tsx`: Integración del toggle, estilos responsive y glassmorphism en sidebar/header.
    *   `src/components/dashboard/SummaryCards.tsx`: Adaptado para usar `glass-card` y colores dinámicos.
    *   `src/components/dashboard/ExpenseChart.tsx`: Adaptado para modo oscuro (textos, tooltips).
    *   `src/components/dashboard/RecentTransactions.tsx`: Estilizado con glassmorphism y modo oscuro.

### 3. Exportación de Reportes
Funcionalidad para descargar los datos del dashboard.

*   **Utilidades**:
    *   `src/utils/exportUtils.ts`: Funciones `exportToExcel` (usando `xlsx`) y `exportToPDF` (usando `jspdf` y `jspdf-autotable`).
*   **Integración**:
    *   `src/pages/Home.tsx`:
        *   Estado para almacenar todas las transacciones (`allTransactions`).
        *   Botones de exportación (Excel y PDF) con indicadores de carga.
        *   Lógica para formatear datos antes de la exportación.

### Librerías Añadidas
*   `xlsx`: Generación de hojas de cálculo.
*   `jspdf`: Generación de PDFs.
*   `jspdf-autotable`: Tablas en PDFs.
