/**
 * Formulario para pago adelantado de cuotas
 */

import React, { useState } from 'react';

const FormularioPagoAdelantado = ({ transaccion, efectivoDisponible, onPagar, onClose }) => {
  const [montoPago, setMontoPago] = useState('');
  const montoCuota = transaccion.cuotasInfo.montoPorCuota;
  const cuotasRestantes = transaccion.cuotasInfo.cuotasRestantes;
  const saldoRestante = cuotasRestantes * montoCuota;

  const cuotasQueSePagaran = montoPago ? Math.floor(parseFloat(montoPago) / montoCuota) : 0;
  const cuotasQueQuedaran = cuotasRestantes - cuotasQueSePagaran;
  const montoRealAPagar = cuotasQueSePagaran * montoCuota;

  const calcularFechaFin = () => {
    if (cuotasQueQuedaran <= 0) return 'Completado';
    const ultimaCuotaPendiente = transaccion.cuotasInfo.fechasCobro
      .filter(c => c.estado === 'pendiente')
      .slice(cuotasQueSePagaran)[cuotasQueQuedaran - 1];
    if (ultimaCuotaPendiente) {
      return new Date(ultimaCuotaPendiente.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return '-';
  };

  const handlePagar = () => {
    if (!montoPago || parseFloat(montoPago) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    if (cuotasQueSePagaran <= 0) {
      alert('El monto no alcanza para pagar ni una cuota completa');
      return;
    }
    if (montoRealAPagar > efectivoDisponible) {
      alert('No tienes suficiente efectivo disponible');
      return;
    }
    if (cuotasQueSePagaran > cuotasRestantes) {
      alert('No puedes pagar más cuotas de las que quedan pendientes');
      return;
    }
    onPagar(cuotasQueSePagaran, montoRealAPagar);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
        <h4 className="font-bold text-purple-900 mb-2">💳 {transaccion.descripcion}</h4>
        <p className="text-sm text-purple-700">{cuotasRestantes} cuotas restantes de {transaccion.cuotasInfo.numeroCuotas}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-blue-800">Efectivo Disponible:</span>
          <span className="font-bold text-blue-900">S/ {efectivoDisponible.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-blue-800">Saldo restante en cuotas:</span>
          <span className="font-bold text-red-600">S/ {saldoRestante.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-blue-800">Monto por cuota:</span>
          <span className="font-bold text-gray-800">S/ {montoCuota.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Monto a pagar (S/)</label>
        <input
          type="number"
          value={montoPago}
          onChange={(e) => setMontoPago(e.target.value)}
          step="0.01"
          placeholder="Ingresa el monto"
          className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl text-xl font-bold focus:border-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">💡 Puedes pagar múltiplos de S/ {montoCuota.toFixed(2)}</p>
      </div>

      {montoPago && cuotasQueSePagaran > 0 && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
          <p className="text-sm font-bold text-green-900 mb-3">📊 Resultado del Pago:</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-800">Cuotas que se pagarán:</span>
              <span className="font-bold text-green-900">{cuotasQueSePagaran}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-800">Monto real a pagar:</span>
              <span className="font-bold text-green-900">S/ {montoRealAPagar.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-800">Cuotas restantes:</span>
              <span className="font-bold text-green-900">{cuotasQueQuedaran}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-800">Saldo liberado:</span>
              <span className="font-bold text-green-900">S/ {montoRealAPagar.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-green-300 pt-2">
              <span className="text-green-800">Nueva fecha fin:</span>
              <span className="font-bold text-green-900">{calcularFechaFin()}</span>
            </div>
          </div>
        </div>
      )}

      {montoPago && cuotasQueSePagaran <= 0 && parseFloat(montoPago) > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <p className="text-sm text-yellow-800">⚠️ El monto no alcanza para pagar una cuota completa (S/ {montoCuota.toFixed(2)})</p>
        </div>
      )}

      {montoRealAPagar > efectivoDisponible && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-800">❌ No tienes suficiente efectivo. Te faltan S/ {(montoRealAPagar - efectivoDisponible).toFixed(2)}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border rounded-xl hover:bg-gray-50">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handlePagar}
          disabled={!montoPago || cuotasQueSePagaran <= 0 || montoRealAPagar > efectivoDisponible}
          className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          💳 Confirmar Pago Adelantado
        </button>
      </div>
    </div>
  );
};

export default FormularioPagoAdelantado;
