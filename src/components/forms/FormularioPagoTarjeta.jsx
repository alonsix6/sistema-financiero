/**
 * Formulario mejorado para pagar tarjetas de crédito
 * Muestra desglose: Cuotas del mes + Saldo rotativo
 */

import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import Calculations from '../../utils/calculations';

const FormularioPagoTarjeta = ({ tarjeta, transacciones, efectivoDisponible, onPagar, onClose }) => {
  // Calcular estado de cuenta completo
  const estadoCuenta = useMemo(() => {
    return Calculations.calcularEstadoCuentaTarjeta(transacciones || [], tarjeta);
  }, [transacciones, tarjeta]);

  const [tipoPago, setTipoPago] = useState('total');
  const [montoPersonalizado, setMontoPersonalizado] = useState('');

  // Determinar monto según tipo de pago
  const montoAPagar = useMemo(() => {
    if (tipoPago === 'total') return estadoCuenta.pagoTotalMes;
    if (tipoPago === 'minimo') return estadoCuenta.pagoMinimo;
    if (tipoPago === 'cuotas') return estadoCuenta.totalCuotasPendientes;
    return parseFloat(montoPersonalizado) || 0;
  }, [tipoPago, estadoCuenta, montoPersonalizado]);

  const handlePagar = () => {
    if (montoAPagar <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }
    if (montoAPagar > efectivoDisponible) {
      alert('No tienes suficiente efectivo disponible');
      return;
    }
    onPagar(montoAPagar);
  };

  const hayAlgoPorPagar = estadoCuenta.pagoTotalMes > 0;

  return (
    <div className="space-y-5">
      {/* Estado de cuenta desglosado */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Icons.FileText size={18} className="text-accent" />
          <span className="font-semibold">Estado de Cuenta</span>
        </div>

        {/* Cuotas vencidas */}
        {estadoCuenta.totalCuotasVencidas > 0 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icons.AlertTriangle size={16} className="text-red-400" />
                <span className="text-sm text-red-300">Cuotas vencidas</span>
              </div>
              <span className="font-bold text-red-400">S/ {estadoCuenta.totalCuotasVencidas.toFixed(2)}</span>
            </div>
            <div className="mt-2 space-y-1">
              {estadoCuenta.cuotasVencidas.map((cuota, idx) => (
                <div key={idx} className="text-xs text-red-300/80 flex justify-between">
                  <span>{cuota.descripcion} ({cuota.numeroCuota}/{cuota.totalCuotas})</span>
                  <span>S/ {cuota.monto.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cuotas del mes */}
        {estadoCuenta.totalCuotasDelMes > 0 && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icons.Calendar size={16} className="text-amber-400" />
                <span className="text-sm text-amber-300">Cuotas del mes</span>
              </div>
              <span className="font-bold text-amber-400">S/ {estadoCuenta.totalCuotasDelMes.toFixed(2)}</span>
            </div>
            <div className="mt-2 space-y-1">
              {estadoCuenta.cuotasDelMes.map((cuota, idx) => (
                <div key={idx} className="text-xs text-amber-300/80 flex justify-between">
                  <span>{cuota.descripcion} ({cuota.numeroCuota}/{cuota.totalCuotas})</span>
                  <span>S/ {cuota.monto.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saldo rotativo */}
        {estadoCuenta.saldoRotativo > 0 && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icons.RotateCcw size={16} className="text-blue-400" />
                <span className="text-sm text-blue-300">Compras sin cuotas</span>
              </div>
              <span className="font-bold text-blue-400">S/ {estadoCuenta.saldoRotativo.toFixed(2)}</span>
            </div>
            <p className="text-xs text-blue-300/60 mt-1">
              Compras directas que no están en cuotas
            </p>
          </div>
        )}

        {/* Crédito bloqueado por cuotas futuras */}
        {estadoCuenta.creditoBloqueado > 0 && (
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icons.Lock size={16} className="text-purple-400" />
                <span className="text-sm text-purple-300">Crédito bloqueado</span>
              </div>
              <span className="font-bold text-purple-400">S/ {estadoCuenta.creditoBloqueado.toFixed(2)}</span>
            </div>
            <p className="text-xs text-purple-300/60 mt-1">
              Reservado para {estadoCuenta.comprasEnCuotas} compra(s) en cuotas. Se libera al pagar cada cuota.
            </p>
          </div>
        )}

        {/* Resumen de crédito */}
        <div className="bg-white/5 rounded-xl p-3 mb-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/60">Crédito usado</span>
            <span className="text-white/80">S/ {estadoCuenta.creditoUsado.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-white/60">Crédito disponible</span>
            <span className="text-green-400 font-medium">S/ {estadoCuenta.creditoDisponible.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-white/40">Límite total</span>
            <span className="text-white/50">S/ {tarjeta.limite.toFixed(2)}</span>
          </div>
        </div>

        {/* Sin deuda */}
        {!hayAlgoPorPagar && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
            <Icons.CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
            <p className="text-green-300 font-medium">Sin pago pendiente este mes</p>
            <p className="text-xs text-green-300/60 mt-1">
              {estadoCuenta.creditoBloqueado > 0
                ? `Tienes S/ ${estadoCuenta.creditoBloqueado.toFixed(2)} en cuotas futuras`
                : 'Tu tarjeta está completamente al día'}
            </p>
          </div>
        )}

        {/* Resumen */}
        {hayAlgoPorPagar && (
          <div className="border-t border-white/20 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Pago Total del Mes</span>
              <span className="text-xl font-bold text-white">S/ {estadoCuenta.pagoTotalMes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-1 text-sm">
              <span className="text-white/50">Pago Mínimo</span>
              <span className="text-white/70">S/ {estadoCuenta.pagoMinimo.toFixed(2)}</span>
            </div>
            <p className="text-xs text-white/40 mt-2">
              Fecha límite de pago: {new Date(estadoCuenta.fechaPago + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        )}
      </div>

      {/* Efectivo disponible */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icons.Wallet size={18} className="text-accent" />
          <span className="text-sm font-medium text-accent">Efectivo disponible</span>
        </div>
        <span className="text-lg font-bold text-accent">S/ {efectivoDisponible.toFixed(2)}</span>
      </div>

      {hayAlgoPorPagar && (
        <>
          {/* Opciones de pago */}
          <div className="space-y-2">
            {/* Pago Total */}
            <button
              type="button"
              onClick={() => setTipoPago('total')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                tipoPago === 'total' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Icons.CheckCircle size={18} className={tipoPago === 'total' ? 'text-green-500' : 'text-gray-400'} />
                    <p className="font-bold text-gray-800">Pago Total</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recomendado</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Paga todo y evita intereses en compras sin cuotas</p>
                </div>
                <span className="text-lg font-bold text-green-600">S/ {estadoCuenta.pagoTotalMes.toFixed(2)}</span>
              </div>
            </button>

            {/* Solo cuotas del mes (si hay cuotas) */}
            {estadoCuenta.tieneCuotas && (
              <button
                type="button"
                onClick={() => setTipoPago('cuotas')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  tipoPago === 'cuotas' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Icons.Calendar size={18} className={tipoPago === 'cuotas' ? 'text-amber-500' : 'text-gray-400'} />
                      <p className="font-bold text-gray-800">Solo Cuotas</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Paga las {estadoCuenta.cuotasDelMes.length + estadoCuenta.cuotasVencidas.length} cuota(s) pendiente(s)
                    </p>
                  </div>
                  <span className="text-lg font-bold text-amber-600">S/ {estadoCuenta.totalCuotasPendientes.toFixed(2)}</span>
                </div>
              </button>
            )}

            {/* Pago Mínimo */}
            <button
              type="button"
              onClick={() => setTipoPago('minimo')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                tipoPago === 'minimo' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Icons.AlertCircle size={18} className={tipoPago === 'minimo' ? 'text-yellow-500' : 'text-gray-400'} />
                    <p className="font-bold text-gray-800">Pago Mínimo</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {estadoCuenta.saldoRotativo > 0
                      ? 'Evita mora pero genera intereses en compras sin cuotas'
                      : 'Cuotas obligatorias del mes'}
                  </p>
                </div>
                <span className="text-lg font-bold text-yellow-600">S/ {estadoCuenta.pagoMinimo.toFixed(2)}</span>
              </div>
            </button>

            {/* Pago Personalizado */}
            <button
              type="button"
              onClick={() => setTipoPago('personalizado')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                tipoPago === 'personalizado' ? 'border-accent bg-accent/10' : 'border-gray-200 hover:border-accent/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icons.Edit3 size={18} className={tipoPago === 'personalizado' ? 'text-accent' : 'text-gray-400'} />
                <p className="font-bold text-gray-800">Monto Personalizado</p>
              </div>
              {tipoPago === 'personalizado' && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                  <input
                    type="number"
                    value={montoPersonalizado}
                    onChange={(e) => setMontoPersonalizado(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={Math.min(estadoCuenta.pagoTotalMes, efectivoDisponible)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
                    autoFocus
                  />
                </div>
              )}
            </button>
          </div>

          {/* Información de cómo se aplicará el pago */}
          {montoAPagar > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Info size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Distribución del pago</span>
              </div>
              <p className="text-xs text-gray-600">
                Tu pago de <strong>S/ {montoAPagar.toFixed(2)}</strong> se aplicará en este orden:
              </p>
              <ol className="text-xs text-gray-600 mt-2 space-y-1 list-decimal list-inside">
                {estadoCuenta.totalCuotasVencidas > 0 && <li>Cuotas vencidas (S/ {estadoCuenta.totalCuotasVencidas.toFixed(2)})</li>}
                {estadoCuenta.totalCuotasDelMes > 0 && <li>Cuotas del mes (S/ {estadoCuenta.totalCuotasDelMes.toFixed(2)})</li>}
                {estadoCuenta.saldoRotativo > 0 && <li>Compras sin cuotas (S/ {estadoCuenta.saldoRotativo.toFixed(2)})</li>}
              </ol>
            </div>
          )}

          {/* Advertencia si no hay suficiente efectivo */}
          {montoAPagar > efectivoDisponible && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <Icons.AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Efectivo insuficiente</p>
                <p className="text-xs text-red-600 mt-1">
                  Necesitas S/ {(montoAPagar - efectivoDisponible).toFixed(2)} adicionales para este pago.
                </p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePagar}
              disabled={montoAPagar > efectivoDisponible || montoAPagar <= 0}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <Icons.CreditCard size={18} />
              Pagar S/ {montoAPagar.toFixed(2)}
            </button>
          </div>
        </>
      )}

      {!hayAlgoPorPagar && (
        <button
          type="button"
          onClick={onClose}
          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
        >
          Cerrar
        </button>
      )}
    </div>
  );
};

export default FormularioPagoTarjeta;
