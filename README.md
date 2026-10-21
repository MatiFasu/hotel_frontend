# Agencia de Turismo & Hotel — Frontend SPA (HackaCode 2da Edición)

Interfaz web interactiva (Single Page Application) construida en **React 18 + Vite** para la gestión integral de una Agencia de Turismo: Catálogo de Servicios, Composición de Paquetes con 10% de descuento, Clientes, Empleados con protección salarial, Punto de Venta (POS) y Reportes de Ganancias Netas.

---

## 1. Stack Tecnológico

- **Framework:** React 18 + Vite
- **Iconografía:** Lucide React
- **Estilos:** Diseño Glassmorphism Dark Mode con variables CSS nativas
- **Servidor de Producción / Contenedor:** Nginx Alpine con proxy inverso `/api/` hacia el backend (`hotel-backend:8080`) y soporte `vercel.json` para despliegue cloud

---

## 2. Módulos de la Aplicación

1. **Servicios Turísticos (`ServiciosView.jsx`):**
   - Alta, edición (`PUT`), baja lógica (`DELETE`) y reactivación (`PATCH`) de los 7 tipos oficiales de servicios (`HOTEL`, `ALQUILER_AUTO`, `PASAJE_COLECTIVO`, `PASAJE_AVION`, `PASAJE_TREN`, `EXCURSION`, `ENTRADA_EVENTO`).
2. **Paquetes Turísticos (`PaquetesView.jsx`):**
   - Selector interactivo de servicios activos (mínimo 2 servicios distintos) con previsualizador en vivo del **10% de descuento reglamentario**.
3. **Clientes (`ClientesView.jsx`):**
   - Padrón de clientes con buscador en vivo por DNI/nombre/apellido y alerta diferenciada cuando un DNI inactivo es reactivado automáticamente (`HTTP 200`).
4. **Empleados (`EmpleadosView.jsx`):**
   - Gestión de personal con simulador de rol (`ADMIN` vs `VENDEDOR`) para verificar en vivo la privacidad del campo `sueldo` (*Decisión 17*).
5. **Punto de Venta (`VentasView.jsx`):**
   - Selector de exclusión mutua **XOR** (Servicio Individual o Paquete Turístico), calculadora de comisión según medio de pago, emisión de venta y anulación lógica.
6. **Reportes & Ganancias (`ReportesView.jsx` — Bonus Point):**
   - Balance Mensual con **serie diaria continua** de todos los días del mes calendario, Arqueo Diario, desglose por medio de pago y botón **"Cargar Datos Demo"**.
7. **Login JWT (`App.jsx`):**
   - Modal de inicio de sesión contra `POST /api/auth/login` con botones rápidos para probar las cuentas semilla (`admin` / `Admin1234!` y `vendedor` / `Vendedor1234!`).

---

## 3. Ejecución en Desarrollo o Docker

```bash
# Instalación y arranque en modo desarrollo (puerto 3000)
npm install
npm run dev

# Compilación de producción
npm run build
```
