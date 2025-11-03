# 💰 Sistema Financiero Personal v3.1

Sistema completo de gestión financiera personal con seguimiento de tarjetas de crédito, gastos, ingresos, proyecciones y análisis detallado.

## 🎯 Características Principales

### 💳 Gestión de Tarjetas de Crédito
- Registro de múltiples tarjetas con límites y fechas de cierre/pago
- Visualización en tiempo real de saldo usado y disponible
- Sistema de pago de tarjetas con opciones: total, mínimo o personalizado
- Alertas automáticas de próximos pagos
- Seguimiento de compras en cuotas sin intereses

### 📊 Control de Gastos e Ingresos
- Registro de transacciones por categoría
- Gráficos interactivos de gastos por categoría
- Filtrado por período personalizado
- Cálculo automático de tasa de ahorro
- Sistema de cuotas con pago adelantado

### 🔮 Proyecciones Financieras
- Proyección de saldo a 6 meses
- Simulador de movimientos futuros
- Alertas de déficit anticipadas
- Consideración de pagos recurrentes y cuotas

### ⚙️ Automatización
- Pagos e ingresos recurrentes automáticos
- Registro automático en fechas programadas
- Procesamiento inteligente de cuotas

### 🔒 Seguridad
- Encriptación AES de datos con CryptoJS
- Autenticación con PIN de 6 dígitos
- Almacenamiento local seguro

## 🏗️ Estructura del Proyecto

```
sistema-financiero/
├── src/
│   ├── components/             # Componentes React
│   │   ├── forms/              # Formularios
│   │   │   ├── FormularioTarjeta.jsx
│   │   │   ├── FormularioTransaccion.jsx
│   │   │   ├── FormularioRecurrencia.jsx
│   │   │   ├── FormularioPagoTarjeta.jsx
│   │   │   ├── FormularioPagoAdelantado.jsx
│   │   │   └── SimuladorMovimiento.jsx
│   │   ├── AuthScreen.jsx      # Pantalla de autenticación
│   │   ├── Dashboard.jsx       # Dashboard principal
│   │   ├── Modal.jsx           # Componente modal
│   │   └── GraficoCategorias.jsx # Gráfico de donas
│   ├── utils/                  # Utilidades
│   │   ├── constants.js        # Constantes y configuración
│   │   ├── security.js         # Funciones de seguridad
│   │   ├── storage.js          # Gestión de localStorage
│   │   └── calculations.js     # Lógica de cálculos
│   ├── styles/
│   │   └── main.css            # Estilos globales
│   ├── App.jsx                 # Componente principal
│   └── index.jsx               # Punto de entrada
├── index.html                  # HTML principal
├── vite.config.js              # Configuración de Vite
├── vercel.json                 # Configuración de Vercel
├── package.json
├── .gitignore
└── README.md
```

## 🚀 Instalación y Uso

### Desarrollo Local

```bash
# 1. Navegar al proyecto
cd sistema-financiero

# 2. Instalar dependencias
npm install

# 3. Ejecutar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:5173
```

### Build para Producción

```bash
# Generar build optimizado
npm run build

# Previsualizar build de producción
npm run preview
```

### Deploy en Vercel

El proyecto está configurado para deployarse automáticamente en Vercel:

1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente Vite
3. El deploy se ejecutará con `npm run build`
4. Los archivos de producción estarán en `/dist`

### PIN de Acceso

**PIN por defecto:** `764958`

> ⚠️ **Importante:** Este PIN está hardcodeado en `src/utils/constants.js`. Para cambiar el PIN, edita la constante `MASTER_PIN` en ese archivo.

## 📖 Guía de Uso

### 1. Configurar Tarjetas de Crédito

1. Ve a la pestaña **Tarjetas**
2. Click en **Nueva Tarjeta**
3. Completa:
   - Nombre de la tarjeta
   - Banco
   - Últimos 4 dígitos (opcional)
   - Límite de crédito
   - Día de cierre
   - Día de pago

### 2. Registrar Gastos

**Opción A: Gasto en Efectivo**
1. Click en **Registrar Gasto**
2. Ingresa monto y descripción
3. Selecciona categoría
4. Elige "Efectivo" como método de pago

**Opción B: Gasto con Tarjeta**
1. Click en **Registrar Gasto**
2. Selecciona la tarjeta
3. Opcionalmente marca "Pagar en cuotas"
4. Elige el número de cuotas (2, 3, 6, 12, 18, 24, 36)

### 3. Pagar Tarjetas

1. Ve a **Inicio** o **Tarjetas**
2. Click en **Pagar** en la tarjeta deseada
3. Elige tipo de pago:
   - **Pago Total:** Liquida todo el saldo
   - **Pago Mínimo:** Solo el mínimo requerido (5% o S/ 25)
   - **Pago Personalizado:** Monto a tu elección

### 4. Pagar Cuotas Adelantadas

1. Ve a **Transacciones**
2. Busca una compra en cuotas
3. Click en **Pagar X cuota(s) adelantada(s)**
4. Ingresa el monto (múltiplos de la cuota)
5. Confirma el pago

### 5. Configurar Recurrencias

1. Ve a **Recurrencias**
2. Click en **Nueva Recurrencia**
3. Define:
   - Tipo (Ingreso o Gasto)
   - Descripción (ej: "Salario", "Netflix")
   - Monto
   - Día del mes
   - Activo/Inactivo

> Las recurrencias se registran automáticamente cuando llega la fecha.

### 6. Simular Movimientos Futuros

1. Ve a **Proyección**
2. Click en **Simular Movimiento**
3. Configura el movimiento a simular
4. Observa el impacto en tu proyección

## 🧮 Cálculos Importantes

### Efectivo Disponible
```
Efectivo = Ingresos Totales - Gastos en Efectivo - Pagos de Tarjetas
```

### Proyección Financiera
- Base: Efectivo disponible actual
- Incluye: Ingresos recurrentes, pagos de tarjetas programados, cuotas pendientes
- Excluye: Gastos futuros con tarjeta (se consideran en la tarjeta, no en efectivo)

### Fecha de Cobro de Cuota
Para una compra en cuotas:
1. La primera cuota se cobra según el cierre de la tarjeta
2. Las siguientes cuotas se cobran cada mes
3. El cobro efectivo es el día de pago del mes siguiente al cierre

## 🎨 Personalización

### Cambiar Categorías de Gastos

Edita `src/utils/constants.js`:

```javascript
export const CATEGORIAS = [
  { valor: 'Nueva Categoría', icono: '🎯', color: '#FF5733' },
  // ... más categorías
];
```

### Agregar Bancos

Edita `src/utils/constants.js`:

```javascript
export const BANCOS = [
  { nombre: 'Nuevo Banco', color: 'from-purple-600 to-purple-700' },
  // ... más bancos
];
```

## 🔐 Seguridad

- **Encriptación:** Los datos se encriptan con AES antes de guardarse en localStorage
- **PIN:** Requerido en cada sesión (no se guarda en texto plano)
- **Local:** Todos los datos se almacenan localmente, nunca en un servidor

> ⚠️ **Nota:** Los datos se guardan en el navegador. Si borras los datos del navegador, perderás toda la información.

## 🐛 Solución de Problemas

### El sistema no carga
1. Verifica que todas las librerías CDN estén disponibles
2. Abre la consola del navegador (F12) para ver errores
3. Intenta limpiar localStorage: `localStorage.clear()` en consola

### PIN incorrecto
- El PIN por defecto es `764958`
- Verifica `src/utils/constants.js` para el PIN configurado

### Datos perdidos
- Los datos se almacenan en localStorage del navegador
- No uses "Modo Incógnito" o se perderán al cerrar
- Realiza backups exportando los datos de localStorage

## 🔄 Actualizar desde HTML único

Si vienes del archivo HTML único anterior:

1. **Tus datos están seguros:** El sistema usa la misma clave de localStorage
2. **Migración automática:** Los datos se cargarán automáticamente
3. **Mismo PIN:** Usa el mismo PIN que antes

## 📝 Changelog

### v3.1 (Actual)
- ✅ Sistema de pago de tarjetas
- ✅ Cálculo correcto de efectivo disponible
- ✅ Proyección basada en efectivo
- ✅ Pago adelantado de cuotas
- ✅ Código reorganizado y modular

### v3.0
- Sistema de compras en cuotas sin intereses
- Tracking detallado de cuotas
- Integración con proyecciones

### v2.0
- Recurrencias automáticas
- Simulador de movimientos
- Modo oscuro

### v1.0
- Gestión básica de tarjetas y transacciones
- Gráficos de categorías
- Encriptación de datos

## 📄 Licencia

MIT License - Uso libre para proyectos personales y comerciales.

## 👨‍💻 Autor

Desarrollado por Alonso

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o revisa la documentación en el código fuente.
