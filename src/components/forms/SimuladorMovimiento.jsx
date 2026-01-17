/**
 * Simulador de movimientos financieros
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import Calculations from '../../utils/calculations.js';

const SimuladorMovimiento = ({ proyeccion, onSimular, onCerrar, tarjetas }) => {
  const [simulacion, setSimulacion] = useState({
    tipo: 'Gasto',
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    metodoPago: 'Efectivo'
  });

  const handleSimular = () => {
    if (!simulacion.monto || !simulacion.descripcion) {
      alert('Completa todos los campos');
      return;
    }
    onSimular({ ...simulacion, monto: parseFloat(simulacion.monto) });
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
        <p className="text-sm text-accent">
          Este simulador te muestra cómo afectaría un movimiento futuro a tu proyección. Los gastos en efectivo afectan inmediatamente. Los gastos con tarjeta afectan en la fecha de pago según el cierre.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <select
            value={simulacion.tipo}
            onChange={(e) => setSimulacion({ ...simulacion, tipo: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          >
            <option value="Ingreso">Ingreso</option>
            <option value="Gasto">Gasto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
          <input
            type="date"
            value={simulacion.fecha}
            onChange={(e) => setSimulacion({ ...simulacion, fecha: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
        <input
          type="text"
          value={simulacion.descripcion}
          onChange={(e) => setSimulacion({ ...simulacion, descripcion: e.target.value })}
          placeholder="Ej: Compra laptop, Bono extra, etc."
          className="w-full px-4 py-3 border rounded-xl"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Monto (S/)</label>
        <input
          type="number"
          value={simulacion.monto}
          onChange={(e) => setSimulacion({ ...simulacion, monto: e.target.value })}
          step="0.01"
          className="w-full px-4 py-3 border rounded-xl"
        />
      </div>

      {simulacion.tipo === 'Gasto' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
          <select
            value={simulacion.metodoPago}
            onChange={(e) => setSimulacion({ ...simulacion, metodoPago: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
          >
            <option value="Efectivo">Efectivo (impacto inmediato)</option>
            {tarjetas.map(t => (
              <option key={t.id} value={t.id}>Tarjeta: {t.nombre} (impacta en fecha de pago)</option>
            ))}
          </select>
          {simulacion.metodoPago !== 'Efectivo' && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              {(() => {
                const tarjetaSeleccionada = tarjetas.find(t => t.id === parseInt(simulacion.metodoPago));
                if (tarjetaSeleccionada) {
                  const disponible = tarjetaSeleccionada.limite - tarjetaSeleccionada.saldoActual;
                  const fechaPago = Calculations.calcularFechaCobro(simulacion.fecha, tarjetaSeleccionada.fechaCierre, tarjetaSeleccionada.fechaPago);
                  return (
                    <>
                      <p className="text-xs text-yellow-800 mb-2"><strong>Info de {tarjetaSeleccionada.nombre}:</strong></p>
                      <p className="text-xs text-yellow-700">• Disponible: S/ {disponible.toFixed(2)} de S/ {tarjetaSeleccionada.limite.toFixed(2)}</p>
                      <p className="text-xs text-yellow-700">• Usado actualmente: S/ {tarjetaSeleccionada.saldoActual.toFixed(2)}</p>
                      <p className="text-xs text-yellow-700">• Fecha de cobro estimada: {fechaPago.toLocaleDateString('es-PE')}</p>
                      {parseFloat(simulacion.monto) > disponible && (
                        <p className="text-xs text-red-600 mt-2 font-bold">Este gasto excede el crédito disponible</p>
                      )}
                    </>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onCerrar} className="flex-1 px-6 py-3 border rounded-xl hover:bg-gray-50">
          Cerrar
        </button>
        <button type="button" onClick={handleSimular} className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600">
          <Icons.Wand2 size={18} className="inline mr-2" />Calcular Impacto
        </button>
      </div>

      {proyeccion && (
        <div className="border-t pt-6">
          <h4 className="font-bold text-lg mb-4 text-gray-800">Resultado de la Simulacion</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {proyeccion.eventos.filter(e => e.esSimulacion || Math.abs((e.fecha - new Date(simulacion.fecha + 'T12:00:00')) / (1000 * 60 * 60 * 24)) <= 30).map((e, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 ${
                  e.esSimulacion ? 'bg-purple-50 border-purple-300' :
                  e.color === 'verde' ? 'bg-green-50 border-green-200' :
                  e.color === 'amarillo' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{e.esSimulacion && <Icons.Wand2 size={14} className="inline mr-1" />}{e.descripcion}</p>
                    <p className="text-sm text-gray-600">{e.fecha.toLocaleDateString('es-PE')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${e.monto > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {e.monto > 0 ? '+' : ''} S/ {e.monto.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Saldo: S/ {e.saldoProyectado.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs font-medium">
                  {e.color === 'verde' && 'Seguro'}
                  {e.color === 'amarillo' && 'Ajustado'}
                  {e.color === 'rojo' && 'Deficit'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimuladorMovimiento;
