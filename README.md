# Agencia de Turismo & Hotel — Frontend SPA

Single Page Application (SPA) moderna, profesional y accesible construida con **React 18**, **Vite** y **Tailwind CSS**. Desarrollada como interfaz integral de gestión operativa y comercial para agencias de viajes y turismo, con diseño responsive mobile-first y estándares de accesibilidad WCAG AA.

---

## 1. ¿Qué hace? (Funcionalidades Principales)

El frontend proporciona una experiencia de usuario fluida, sobria y libre de recargas de página para interactuar con la API REST del backend:

- **Autenticación y Control de Sesión:**
  - Login seguro con validación de credenciales contra la API JWT.
  - **Accesos rápidos de 1 clic para evaluadores:** botones interactivos en la pantalla de inicio de sesión que autocompletan las credenciales para evaluar tanto el rol `ADMIN` como `VENDEDOR` sin tipeo manual.
  - Almacenamiento seguro de sesión en `sessionStorage` y deslogueo con limpieza de estado.

- **Catálogo de Servicios Turísticos:**
  - Visualización dual adaptativa: tabla detallada con hover en desktop y tarjetas apiladas compactas en móviles.
  - Búsqueda en vivo por nombre, destino y tipo de servicio (`HOTEL`, `ALQUILER_AUTO`, `EXCURSION`, etc.).
  - Alta y edición a través de modales flotantes centrados con validaciones inline.
  - Baja lógica y reactivación con confirmaciones seguras.

- **Armado Interactivo de Paquetes Turísticos:**
  - Constructor visual con buscador y filtro por tipo de servicio dentro del catálogo disponible.
  - **Bandeja de servicios seleccionados:** chips interactivos con botón de remoción rápida `(x)`.
  - **Comparador visual de ahorro normativo:** cálculo y contraste en tiempo real de la suma regular vs. el **10% OFF obligatorio** y el precio final comercial.
  - Validación interactiva: requiere al menos 2 servicios activos para habilitar el guardado.
  - Modal de **Dossier de Paquete** con itinerario completo de servicios incluidos, destinos y fechas.

- **Padrón de Clientes:**
  - Listado con filtros en vivo por DNI, nombre y apellido.
  - Formulario modal con validaciones de formato de contacto y fecha de nacimiento.
  - Alerta diferenciada con toasts verdes cuando un cliente previamente dado de baja es reactivado por DNI (`HTTP 200`).

- **Gestión de Personal (Empleados):**
  - Control de nómina con formulario protegido para el rol `ADMIN`.
  - **Protección Salarial Dinámica (Decisión 17):**
    - Si el usuario es `ADMIN`, visualiza las remuneraciones salariales con botón para ocultar/revelar.
    - Si el usuario es `VENDEDOR`, el sueldo se muestra bloqueado bajo el rótulo `Confidencial (Solo Admin)` y las acciones de edición/alta se inhabilitan.

- **Punto de Venta (POS & Checkout):**
  - **Flujo guiado de emisión en 3 pasos:**
    1. *Selección de Producto (Exclusión Mutua XOR):* selector interactivo con radio cards para alternar entre *Servicio Individual* y *Paquete Turístico (-10% OFF)* con buscador rápido incorporado.
    2. *Partes Intervinientes:* selección de cliente titular y empleado vendedor.
    3. *Medio de Pago:* tarjetas visuales con badge de la tasa de comisión (0% a 9%).
  - **Recibo de liquidación financiera en vivo:** previsualiza el Monto Bruto, la Comisión Retenida y la Ganancia Neta para la agencia antes de confirmar la operación.
  - **Comprobante Digital de Venta:** modal tipo voucher con el detalle de la transacción, estado (`ACTIVA` vs `ANULADA`) y desglose contable.
  - **Anulación Segura:** diálogo de confirmación con advertencia de reversión contable.

- **Dashboard Ejecutivo & Reportes:**
  - Tarjetas de KPIs principales: *Operaciones Activas*, *Facturación Bruta*, *Comisiones Retenidas* y *Ganancia Neta* con cálculo automático del **margen de rentabilidad neta** (`% neto`).
  - **Gráfico de Tendencia Mensual en SVG Nativo:** visualización de la serie diaria continua (días 1 al 31) con gradientes de marca y tooltips flotantes al pasar el cursor.
  - Desglose de distribución porcentual por medio de pago (market share) y arqueo diario de caja.

---

## 2. ¿Cómo probarlo? (Instrucciones de Instalación y Ejecución)

### Prerrequisitos
- **Node.js 18+** y **npm 9+** (o utilizar **Docker**).
- Backend en ejecución (localmente en `http://localhost:8080` o en contenedor).

### Opción A: Ejecución con Docker Compose (Recomendada)
Desde la raíz del repositorio:
```bash
# Construir y levantar el contenedor del frontend servido con Nginx
docker compose up --build -d hotel-frontend

# Ver logs de Nginx
docker compose logs -f hotel-frontend
```
Abrir el navegador en **`http://localhost:3000`**.

### Opción B: Ejecución Local en Modo Desarrollo (Vite)
1. Posicionarse en la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Instalar las dependencias de Node:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo Vite con Hot Module Replacement (HMR):
   ```bash
   npm run dev
   ```
4. El servidor estará disponible en la URL informada en la terminal (por defecto `http://localhost:5173` o `http://localhost:3000`).

### Credenciales de Acceso Rápido
En la pantalla de Login podés hacer clic en cualquiera de los dos botones de prueba:
- **Rol ADMIN:** usuario `admin` / clave `Admin1234!` (acceso total y visualización salarial).
- **Rol VENDEDOR:** usuario `vendedor` / clave `Vendedor1234!` (perfil comercial con sueldos confidenciales).

---

## 3. ¿Cómo lo construí? (Tecnologías Usadas y Decisiones Técnicas Relevantes)

### Stack Tecnológico
- **Librería UI:** React 18 (Hooks: `useState`, `useEffect`, `useContext`, `useCallback`).
- **Herramienta de Build:** Vite 5 (arranque instantáneo y bundling ultra rápido con Rollup).
- **Estilos:** Tailwind CSS v3 con configuración personalizada de tokens semánticos (paleta `brand`, superficies oscuras `dark`, bordes sutiles y animaciones).
- **Iconografía:** Lucide React (iconos SVG livianos, accesibles y consistentes).
- **Servidor de Producción:** Nginx Alpine optimizado con compresión gzip, proxy inverso `/api/` hacia el backend y soporte SPA (`try_files $uri /index.html`).

### Decisiones Técnicas Relevantes
1. **Sistema de Diseño Atómico Reutilizable (`src/components/ui/`):**
   - Se construyó una librería de componentes propios (`Button`, `Input`, `Select`, `Badge`, `Card`, `Modal`, `ConfirmDialog`, `TableSkeleton`, `EmptyState`, `Toast`) sin acoplarse a librerías de componentes pesadas como MUI o Ant Design.
   - Centralización de estilos en `tailwind.config.js` para asegurar coherencia visual y facilidad de mantenimiento.
2. **Visualización de Datos con SVG Nativo en lugar de Recharts:**
   - Para el gráfico de barras de serie diaria continua se implementó un componente SVG responsivo nativo en lugar de instalar librerías como Recharts o Chart.js. Esto evitó añadir ~450KB al bundle final y garantizó tiempos de carga inmediatos y animación fluida.
3. **Erradicación de `window.confirm` por Diálogos Modales Asíncronos:**
   - Todas las confirmaciones de baja lógica y anulación de ventas se reemplazaron por el componente `<ConfirmDialog>`, proporcionando foco visible, backdrop accesible, botón con spinner de carga y mensaje contextual de impacto.
4. **Arquitectura Responsiva Dual (Mobile-First):**
   - En lugar de forzar tablas con scroll horizontal incómodo en celulares, las vistas detectan el viewport y alternan automáticamente entre tabla de datos (`hidden md:table`) y tarjetas apiladas (`md:hidden`), optimizando la legibilidad en pantallas desde 375px.
5. **Accesibilidad WCAG AA:**
   - Modales accesibles con cierre mediante tecla `Escape`, clic fuera del contenedor, bloqueo de scroll en el body (`overflow: hidden`), contraste verificado y anillos de foco visibles (`focus-visible`).
6. **Manejo Desacoplado de Notificaciones con Context API:**
   - Se implementó un `ToastProvider` con hook `useToast()` que permite despachar notificaciones no bloqueantes de éxito y error desde cualquier componente de la jerarquía.

---

## 4. ¿Cómo verificarlo? (Instrucciones para Ejecutar los Tests)

### 1. Verificación del Build de Producción
Para comprobar que el código TypeScript/JSX, imports y configuraciones de PostCSS compilan de forma limpia sin errores ni advertencias:
```bash
cd frontend
npm run build
```
El comando debe finalizar con código de salida `0` y generar la carpeta optimizada `dist/` con sus chunks gzipeados.

### 2. Checklist de Verificación Funcional en Navegador
Para validar el comportamiento completo de la aplicación, seguir estos pasos en `http://localhost:3000`:

1. **Prueba de Autenticación y Control de Roles:**
   - Iniciar sesión con el botón *"Rol ADMIN"*. Ir a **Personal** y verificar que los sueldos se visualizan o pueden consultarse.
   - Cerrar sesión e iniciar como *"Rol VENDEDOR"*. Ir a **Personal** y comprobar que los sueldos dicen *"Confidencial (Solo Admin)"* y que el botón *"Nuevo Empleado"* no está disponible.
2. **Prueba de Armado de Paquetes con 10% OFF:**
   - Ir a **Paquetes Turísticos** -> *"Nuevo Paquete"*.
   - Seleccionar un solo servicio: el botón de guardado debe estar inhabilitado y el badge advertir que falta al menos 1 servicio más.
   - Seleccionar 2 o más servicios: verificar que el visor calcule el 10% de descuento normativo sobre el subtotal base.
3. **Prueba de Emisión de Venta (Punto de Venta):**
   - Ir a **Punto de Venta** -> *"Nueva Venta"*.
   - Alternar entre *Servicio Individual* y *Paquete Turístico* (comprobar exclusión XOR).
   - Elegir medio de pago *"Tarjeta de Crédito"* (9% comisión) y verificar que el recibo de liquidación descuente la comisión y calcule la ganancia neta.
   - Emitir la venta y verificar que aparezca el toast verde de éxito.
4. **Prueba de Anulación y Comprobante:**
   - En el listado de ventas, hacer clic en *"Detalle"* para ver el voucher completo.
   - Presionar *"Anular"* y confirmar en el `<ConfirmDialog>`: la venta debe pasar al estado `ANULADA` y revertir su impacto en los reportes.
5. **Prueba de Dashboard y Reportes:**
   - Ir a **Reportes** y verificar las 4 tarjetas KPI, el gráfico de barras interactivo con tooltip al pasar el cursor y el desglose de canales de pago.
6. **Prueba Responsiva:**
   - Abrir las DevTools (`F12`), cambiar al emulador de dispositivos móviles (ej. iPhone / Pixel a 375px) y verificar que el menú se convierta en drawer lateral y las tablas en tarjetas legibles.
