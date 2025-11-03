/**
 * Punto de entrada principal de la aplicación
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/main.css';

// Log de inicialización
console.log('✅ Sistema Financiero v3.1 - Pago de Tarjetas cargado correctamente');
console.log('🔌 PIN de acceso: 764958');
console.log('🎯 Cambios principales:');
console.log('   - ✅ Efectivo Disponible calculado correctamente');
console.log('   - ✅ Botón de Pago en tarjetas');
console.log('   - ✅ Nuevo tipo de transacción: PagoTarjeta');
console.log('   - ✅ Proyección corregida (base en efectivo)');
console.log('   - ✅ Validaciones de pago');
console.log('   - ✅ Sistema de cuotas con pago adelantado');

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('❌ Error al cargar el sistema:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: system-ui;">
      <h1 style="color: #EF4444; margin-bottom: 20px;">Error al cargar el sistema</h1>
      <p style="color: #6B7280; margin-bottom: 30px;">${error.message}</p>
      <button onclick="localStorage.clear(); location.reload();"
              style="background: #3B82F6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
        🔄 Reiniciar Sistema
      </button>
    </div>
  `;
}
