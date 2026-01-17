/**
 * Formulario para pagar tarjetas de crédito
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';

const FormularioPagoTarjeta = ({ tarjeta, efectivoDisponible, onPagar, onClose }) => {
  const pagoMinimo = Math.max(tarjeta.saldoActual * 0.05, 25);
  const [tipoPago, setTipoPago] = useState('total');
  const [montoPersonalizado, setMontoPersonalizado] = useState('');
  const montoAPagar = tipoPago === 'total' ? tarjeta.saldoActual : tipoPago === 'minimo' ? pagoMinimo : parseFloat(montoPersonalizado) || 0;

  const handlePagar = () => {
    if (montoAPagar <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }
    if (montoAPagar > efectivoDisponible) {
      alert('No tienes suficiente efectivo disponible');
      return;
    }
    if (montoAPagar > tarjeta.saldoActual) {
      alert('No puedes pagar más que el saldo de la tarjeta');
      return;
    }
    onPagar(montoAPagar);
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-accent">Efectivo Disponible</span>
          <span className="text-lg font-bold text-accent">S/ {efectivoDisponible.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-accent">Saldo Tarjeta</span>
          <span className="text-lg font-bold text-red-600">S/ {tarjeta.saldoActual.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setTipoPago('total')}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            tipoPago === 'total' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800">Pago Total (Recomendado)</p>
              <p className="text-sm text-gray-600">Libera todo el crédito</p>
            </div>
            <span className="text-xl font-bold text-green-600">S/ {tarjeta.saldoActual.toFixed(2)}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTipoPago('minimo')}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            tipoPago === 'minimo' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800">Pago Minimo</p>
              <p className="text-sm text-gray-600">Evita mora, pero acumula intereses</p>
            </div>
            <span className="text-xl font-bold text-yellow-600">S/ {pagoMinimo.toFixed(2)}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTipoPago('personalizado')}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            tipoPago === 'personalizado' ? 'border-accent bg-accent/10' : 'border-gray-200 hover:border-accent/50'
          }`}
        >
          <div>
            <p className="font-bold text-gray-800 mb-2">Pago Personalizado</p>
            {tipoPago === 'personalizado' && (
              <input
                type="number"
                value={montoPersonalizado}
                onChange={(e) => setMontoPersonalizado(e.target.value)}
                placeholder="Ingresa el monto"
                step="0.01"
                min={pagoMinimo}
                max={Math.min(tarjeta.saldoActual, efectivoDisponible)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            )}
          </div>
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Saldo Actual</span>
          <span className="font-semibold text-gray-800">S/ {tarjeta.saldoActual.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Monto a Pagar</span>
          <span className="font-semibold text-accent">- S/ {montoAPagar.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-bold text-gray-800">Nuevo Saldo</span>
          <span className="font-bold text-green-600">S/ {(tarjeta.saldoActual - montoAPagar).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Efectivo Restante</span>
          <span className={`font-semibold ${(efectivoDisponible - montoAPagar) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            S/ {(efectivoDisponible - montoAPagar).toFixed(2)}
          </span>
        </div>
      </div>

      {montoAPagar > efectivoDisponible && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">
            No tienes suficiente efectivo para este pago. Necesitas S/ {(montoAPagar - efectivoDisponible).toFixed(2)} adicionales.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border rounded-xl hover:bg-gray-50">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handlePagar}
          disabled={montoAPagar > efectivoDisponible || montoAPagar <= 0}
          className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Icons.CreditCard size={18} className="inline mr-2" />Confirmar Pago
        </button>
      </div>
    </div>
  );
};

export default FormularioPagoTarjeta;
